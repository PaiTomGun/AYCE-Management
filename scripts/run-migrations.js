const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigrations() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ayce_db',
    user: process.env.DB_USER || 'ayce_user',
    password: process.env.DB_PASSWORD || 'ayce_password',
  });

  try {
    console.log('Running database migrations...');
    
    const migrationPath = path.join(__dirname, '..', 'init-scripts', 'migration-features.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(migrationSQL);
    
    console.log('✓ Migrations completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
