const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  user: process.env.DB_USER || 'ayce_user',
  password: String(process.env.DB_PASSWORD || 'ayce_password'),
  host: 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ayce_db',
});

async function initDb() {
  try {
    const sqlPath = path.join(__dirname, '..', 'init-scripts', 'AYCE.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected. Executing SQL...');
    
    try {
      await client.query(sql);
      console.log('Database initialized successfully.');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initDb();
