/**
 * Run Database Migration Script
 * 
 * This script runs the fix-column-lengths.sql migration on your database.
 * 
 * Usage:
 *   node scripts/run-migration.js
 *   or
 *   tsx scripts/run-migration.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { readFileSync } = require('fs');
const { join } = require('path');
const { Pool } = require('pg');

async function runMigration() {
  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { 
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'cyberpulse',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
      };

  const pool = new Pool(poolConfig);

  try {
    console.log('🔄 Running database migration...');
    
    // Read the migration SQL file
    const sqlPath = join(__dirname, 'fix-column-lengths.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // Execute the migration
    await pool.query(sql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\nVerifying column lengths...');
    
    // Verify the change
    const result = await pool.query(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'incidents' 
        AND column_name IN ('attack_type', 'severity', 'status')
      ORDER BY column_name
    `);
    
    console.log('\nCurrent column lengths:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}(${row.character_maximum_length || 'N/A'})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('⚠️ Migration may have already been applied. This is okay.');
      process.exit(0);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
