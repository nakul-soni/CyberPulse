
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing connection with DATABASE_URL:', process.env.DATABASE_URL);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful:', res.rows[0]);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
  } finally {
    await pool.end();
  }
}

testConnection();
