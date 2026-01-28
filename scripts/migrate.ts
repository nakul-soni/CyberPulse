/**
 * Database Migration Script
 * 
 * Creates the database schema
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

// Handling __dirname in ESM-like environment (tsx)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

async function migrate() {
  try {
    console.log('📦 Running database migration...');
    
    // Check connection first
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Connected to database');
    } catch (connError) {
      console.error('❌ Database connection failed:', connError.message);
      if (!process.env.DATABASE_URL) {
        console.log('ℹ️ Tip: Check if DATABASE_URL is set in your environment or .env file');
      }
      process.exit(1);
    }

    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error(`❌ Schema file not found at: ${schemaPath}`);
      process.exit(1);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Executing schema...');
    await pool.query(schema);
    
    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Details:', JSON.stringify(error, null, 2));
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
