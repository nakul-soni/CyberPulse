import { Pool, QueryResult, QueryResultRow } from 'pg';

// PostgreSQL connection pool - supports DATABASE_URL or individual vars
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cyberpulse',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
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

// Query helper
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
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
    whereClauses.push(`severity = $${paramIndex++}`);
    params.push(options.severity);
  }

  if (options.attackType) {
    whereClauses.push(`attack_type = $${paramIndex++}`);
    params.push(options.attackType);
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

// Get the last ingestion log
export async function getLastIngestionLog(): Promise<IngestionLog | null> {
  const result = await query<IngestionLog>(
    'SELECT * FROM ingestion_logs WHERE status = \'completed\' ORDER BY completed_at DESC LIMIT 1'
  );
  return result.rows[0] || null;
}

// Check if an ingestion is currently running
export async function isIngestionRunning(): Promise<boolean> {
  const result = await query(
    'SELECT EXISTS(SELECT 1 FROM ingestion_logs WHERE status = \'running\' AND started_at > NOW() - INTERVAL \'10 minutes\') as exists'
  );
  return result.rows[0].exists;
}

export { pool };
