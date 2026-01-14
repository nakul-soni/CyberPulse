"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.getIncidents = getIncidents;
exports.getIncidentById = getIncidentById;
exports.incidentExistsByUrl = incidentExistsByUrl;
exports.incidentExistsByHash = incidentExistsByHash;
exports.insertIncident = insertIncident;
exports.updateIncidentAnalysis = updateIncidentAnalysis;
exports.createIngestionLog = createIngestionLog;
exports.updateIngestionLog = updateIngestionLog;
const pg_1 = require("pg");
// PostgreSQL connection pool
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'cyberpulse',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.pool = pool;
// Test connection on startup
pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
});
pool.on('error', (err) => {
    console.error('❌ PostgreSQL connection error:', err);
});
// Query helper
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log('Executed query', { text, duration, rows: res.rowCount });
        }
        return res;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
// Get all incidents with pagination
async function getIncidents(options) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];
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
        whereClauses.push(`(
        to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', $${paramIndex})
        OR title ILIKE $${paramIndex + 1}
        OR description ILIKE $${paramIndex + 1}
        OR attack_type ILIKE $${paramIndex + 1}
        OR analysis::text ILIKE $${paramIndex + 1}
      )`);
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
    const countResult = await query(`SELECT COUNT(*) as count FROM incidents ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);
    // Get incidents
    params.push(limit, offset);
    const result = await query(`SELECT * FROM incidents ${whereClause} ORDER BY published_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`, params);
    return {
        incidents: result.rows,
        total,
    };
}
// Get incident by ID
async function getIncidentById(id) {
    const result = await query('SELECT * FROM incidents WHERE id = $1', [id]);
    return result.rows[0] || null;
}
// Check if incident exists by URL
async function incidentExistsByUrl(url) {
    const result = await query('SELECT EXISTS(SELECT 1 FROM incidents WHERE url = $1) as exists', [url]);
    return result.rows[0].exists;
}
// Check if incident exists by content hash
async function incidentExistsByHash(hash) {
    const result = await query('SELECT EXISTS(SELECT 1 FROM incidents WHERE content_hash = $1) as exists', [hash]);
    return result.rows[0].exists;
}
// Insert new incident
async function insertIncident(incident) {
    const result = await query(`INSERT INTO incidents (title, description, content, url, source, published_at, content_hash, region, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
     RETURNING *`, [
        incident.title,
        incident.description || null,
        incident.content || null,
        incident.url,
        incident.source,
        incident.published_at,
        incident.content_hash,
        incident.region || null,
    ]);
    return result.rows[0];
}
// Update incident analysis
async function updateIncidentAnalysis(id, analysis) {
    const result = await query(`UPDATE incidents 
     SET analysis = $1, severity = $2, attack_type = $3, risk_score = $4, status = 'analyzed'
     WHERE id = $5
     RETURNING *`, [
        JSON.stringify(analysis.analysis),
        analysis.severity || null,
        analysis.attack_type || null,
        analysis.risk_score || null,
        id,
    ]);
    return result.rows[0];
}
// Create ingestion log
async function createIngestionLog(sourceName) {
    const result = await query(`INSERT INTO ingestion_logs (source_name, status) 
     VALUES ($1, 'running')
     RETURNING *`, [sourceName || null]);
    return result.rows[0];
}
// Update ingestion log
async function updateIngestionLog(id, updates) {
    const fields = [];
    const values = [];
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
    const result = await query(`UPDATE ingestion_logs 
     SET ${fields.join(', ')}
     WHERE id = $${paramIndex++}
     RETURNING *`, values);
    return result.rows[0];
}
