import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT NOW()');
      return NextResponse.json({ status: 'ok', message: 'Database connection successful' }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Health check error:', error);
    return NextResponse.json({ status: 'error', message: 'Database connection failed', details: error.message }, { status: 500 });
  }
}
