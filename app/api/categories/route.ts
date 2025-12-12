import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const result = await pool.query('SELECT * FROM menu_categories ORDER BY position ASC, created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, position } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const id = uuidv4();
    const query = `
      INSERT INTO menu_categories (id, name, position, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const values = [id, name, position || 0];

    const result = await pool.query(query, values);
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
