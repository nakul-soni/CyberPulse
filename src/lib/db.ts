import { Pool, QueryResult, QueryResultRow } from 'pg';

// PostgreSQL connection pool - supports DATABASE_URL or individual vars
const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { 
          rejectUnauthorized: false, // Required for Render/Supabase self-signed certs
        },
        max: 2, // Minimum connections for Render Free tier stability
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 60000, // 60s to handle slow network
        keepAlive: true,
        statement_timeout: 90000, // 90s for complex queries during analysis
        application_name: 'cyberpulse_app'
      }

  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cyberpulse',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };

const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', (client) => {
  client.query('SET statement_timeout = 90000').catch(() => {});
});

pool.on('error', (err) => {
  // If we get a "terminated" error at the pool level, it's often a transient network issue
  if (err.message.includes('terminated') || err.message.includes('Connection terminated')) {
    console.warn('⚠️ PostgreSQL Pool: Connection was terminated by server. This is common on Render Free tier.');
  } else {
    console.error('❌ PostgreSQL Pool Error:', err.message);
  }
});

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  source: string;
  published_at: Date;
  ingested_at: Date;
  status: 'pending' | 'analyzing' | 'analyzed' | 'failed';
  severity?: 'Low' | 'Medium' | 'High';
  attack_type?: string;
  risk_score?: number;
  analysis?: any;
  region?: string;
  tags?: string[];
  content_hash: string;
  created_at: Date;
  updated_at: Date;
  last_viewed_at?: Date;
}

export interface IngestionLog {
  id: string;
  started_at: Date;
  completed_at?: Date;
  source_name?: string;
  items_fetched: number;
  items_new: number;
  items_duplicate: number;
  items_failed: number;
  status: 'running' | 'completed' | 'failed';
  error_message?: string;
}

// Query helper with enhanced retry logic for "Connection terminated unexpectedly"
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  retries = 5 // Increased retries
): Promise<QueryResult<T>> {
  const start = Date.now();
  let lastError: any;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await pool.query<T>(text, params);
      return res;
    } catch (error: any) {
      lastError = error;
      
      const isTransient = 
        error.message.includes('terminated') || 
        error.message.includes('timeout') || 
        error.code === 'ENOTFOUND' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';
      
      if (!isTransient || attempt === retries - 1) {
        break;
      }
      
      // Longer backoff for Render
      const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
      console.warn(`Database query failed (Attempt ${attempt + 1}/${retries}). Retrying in ${Math.round(delay)}ms... ${error.message}`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('Database query final failure:', lastError.message);
  throw lastError;
}

// Get all incidents with pagination
export async function getIncidents(options: {
  page?: number;
  limit?: number;
  severity?: string;
  attackType?: string;
  search?: string;
  todayOnly?: boolean;
  date?: string;
}): Promise<{ incidents: Incident[]; total: number }> {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const offset = (page - 1) * limit;

  let whereClauses: string[] = [];
  let params: any[] = [];
  let paramIndex = 1;

  if (options.severity) {
    whereClauses.push(`severity ILIKE $${paramIndex++}`);
    params.push(options.severity);
  }

  if (options.attackType) {
    whereClauses.push(`attack_type ILIKE $${paramIndex++}`);
    params.push(`%${options.attackType}%`);
  }

  if (options.search) {
    // Enhanced search: title, description, attack_type, and analysis JSON fields
    const searchPattern = `%${options.search}%`;
    whereClauses.push(
      `(
        to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $${paramIndex})
        OR title ILIKE $${paramIndex + 1}
        OR description ILIKE $${paramIndex + 1}
        OR attack_type ILIKE $${paramIndex + 1}
        OR analysis::text ILIKE $${paramIndex + 1}
      )`
    );
    params.push(options.search, searchPattern);
    paramIndex += 2;
  }

  if (options.todayOnly) {
    whereClauses.push(`published_at::date = CURRENT_DATE`);
  }

  if (options.date) {
    whereClauses.push(`published_at::date = $${paramIndex++}`);
    params.push(options.date);
  }

  const whereClause = whereClauses.length > 0 
    ? `WHERE ${whereClauses.join(' AND ')}`
    : '';

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM incidents ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count);

  // Get incidents
  params.push(limit, offset);
  const result = await query<Incident>(
    `SELECT * FROM incidents ${whereClause} ORDER BY published_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  );

  // Mark returned incidents as viewed to prioritize them for analysis
  if (result.rows.length > 0) {
    const ids = result.rows.map(r => r.id);
    query(
      `UPDATE incidents SET last_viewed_at = NOW() WHERE id = ANY($1)`,
      [ids]
    ).catch(err => console.error('Error updating last_viewed_at:', err));
  }

  return {
    incidents: result.rows,
    total,
  };
}

// Get incident by ID
export async function getIncidentById(id: string): Promise<Incident | null> {
  const result = await query<Incident>(
    'SELECT * FROM incidents WHERE id = $1',
    [id]
  );
  
  if (result.rows[0]) {
    query(
      'UPDATE incidents SET last_viewed_at = NOW() WHERE id = $1',
      [id]
    ).catch(err => console.error('Error updating last_viewed_at:', err));
  }
  
  return result.rows[0] || null;
}

// Check if incident exists by URL
export async function incidentExistsByUrl(url: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM incidents WHERE url = $1) as exists',
    [url]
  );
  return result.rows[0].exists;
}

// Check if incident exists by content hash
export async function incidentExistsByHash(hash: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM incidents WHERE content_hash = $1) as exists',
    [hash]
  );
  return result.rows[0].exists;
}

// Insert new incident
export async function insertIncident(incident: {
  title: string;
  description?: string;
  content?: string;
  url: string;
  source: string;
  published_at: Date;
  content_hash: string;
  region?: string;
}): Promise<Incident> {
  const result = await query<Incident>(
    `INSERT INTO incidents (title, description, content, url, source, published_at, content_hash, region, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     RETURNING *`,
    [
      incident.title,
      incident.description || null,
      incident.content || null,
      incident.url,
      incident.source,
      incident.published_at,
      incident.content_hash,
      incident.region || null,
    ]
  );
  return result.rows[0];
}

// Update incident analysis
export async function updateIncidentAnalysis(
  id: string,
  analysis: {
    analysis: any;
    severity?: 'Low' | 'Medium' | 'High';
    attack_type?: string;
    risk_score?: number;
  }
): Promise<Incident> {
  const result = await query<Incident>(
    `UPDATE incidents 
     SET analysis = $1, severity = $2, attack_type = $3, risk_score = $4, status = 'analyzed'
     WHERE id = $5
     RETURNING *`,
    [
      JSON.stringify(analysis.analysis),
      analysis.severity || null,
      analysis.attack_type || null,
      analysis.risk_score || null,
      id,
    ]
  );
  return result.rows[0];
}

// Create ingestion log
export async function createIngestionLog(sourceName?: string): Promise<IngestionLog> {
  const result = await query<IngestionLog>(
    `INSERT INTO ingestion_logs (source_name, status) 
     VALUES ($1, 'running')
     RETURNING *`,
    [sourceName || null]
  );
  return result.rows[0];
}

// Update ingestion log
export async function updateIngestionLog(
  id: string,
  updates: {
    items_fetched?: number;
    items_new?: number;
    items_duplicate?: number;
    items_failed?: number;
    status?: 'running' | 'completed' | 'failed';
    error_message?: string;
  }
): Promise<IngestionLog> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.items_fetched !== undefined) {
    fields.push(`items_fetched = $${paramIndex++}`);
    values.push(updates.items_fetched);
  }
  if (updates.items_new !== undefined) {
    fields.push(`items_new = $${paramIndex++}`);
    values.push(updates.items_new);
  }
  if (updates.items_duplicate !== undefined) {
    fields.push(`items_duplicate = $${paramIndex++}`);
    values.push(updates.items_duplicate);
  }
  if (updates.items_failed !== undefined) {
    fields.push(`items_failed = $${paramIndex++}`);
    values.push(updates.items_failed);
  }
  if (updates.status) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.error_message !== undefined) {
    fields.push(`error_message = $${paramIndex++}`);
    values.push(updates.error_message);
  }

  if (updates.status === 'completed' || updates.status === 'failed') {
    fields.push(`completed_at = NOW()`);
  }

  values.push(id);

  const result = await query<IngestionLog>(
    `UPDATE ingestion_logs 
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex++}
     RETURNING *`,
    values
  );
  return result.rows[0];
}

export { pool };
