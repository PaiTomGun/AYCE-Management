import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const sqlPath = path.join(process.cwd(), 'init-scripts', 'AYCE.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    await pool.query(sql);

    return NextResponse.json({ message: 'Database initialized successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return NextResponse.json({ error: 'Failed to initialize database', details: error.message }, { status: 500 });
  }
}
