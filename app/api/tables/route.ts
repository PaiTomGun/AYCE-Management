import { NextResponse } from 'next/server';
import { getTablesWithStatus, createSession as createSessionDb } from '@/lib/database';

export async function GET() {
  try {
    const tables = await getTablesWithStatus();
    return NextResponse.json(tables);
  } catch (error) {
    console.error('Tables error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { tableId, tierId, customerCount, sessionDuration } = await request.json();
    
    if (!tableId || !tierId || !customerCount || !sessionDuration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const sessionId = await createSessionDb(tableId, tierId, customerCount, sessionDuration);
    
    return NextResponse.json({ sessionId, success: true });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
