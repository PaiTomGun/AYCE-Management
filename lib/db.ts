import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'ayce_user',
  password: process.env.DB_PASSWORD || 'ayce_password',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ayce_db',
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export default pool;
