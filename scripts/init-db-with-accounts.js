const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'ayce_user',
  password: String(process.env.DB_PASSWORD || 'ayce_password'),
  host: 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ayce_db',
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing database...');
    
    // Read and execute main schema
    const schemaPath = path.join(__dirname, '../init-scripts/AYCE.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('✅ Schema created successfully');
    
    // Read and execute seed accounts
    const seedAccountsPath = path.join(__dirname, '../init-scripts/seed-accounts.sql');
    if (fs.existsSync(seedAccountsPath)) {
      const seedAccounts = fs.readFileSync(seedAccountsPath, 'utf8');
      await client.query(seedAccounts);
      console.log('✅ Seed accounts created successfully');
      console.log('   - Admin account: admin / admin123');
      console.log('   - Staff account: staff / staff123');
    }
    
    // Read and execute sample data
    const sampleDataPath = path.join(__dirname, '../init-scripts/sample-data.sql');
    if (fs.existsSync(sampleDataPath)) {
      const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
      await client.query(sampleData);
      console.log('✅ Sample data inserted successfully');
    }
    
    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase().catch(console.error);
