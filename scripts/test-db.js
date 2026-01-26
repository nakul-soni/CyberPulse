const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function test() {
  console.log('Testing connection to:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'cyberpulse',
    user: 'postgres',
    password: '12345678'
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully');
    const res = await client.query('SELECT NOW()');
    console.log('Result:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

test();
