import { NextResponse } from 'next/server';
import { getTablesWithStatus, createSession as createSessionDb, query } from '@/lib/database';

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

export async function PUT(request: Request) {
  try {
    const { seats } = await request.json();
    
    if (!seats || seats < 1) {
      return NextResponse.json(
        { error: 'Invalid number of seats' },
        { status: 400 }
      );
    }

    // Get all existing table numbers sorted
    const result = await query(
      `SELECT table_code FROM restaurant_tables 
       WHERE table_code ~ '^Table [0-9]+$' 
       ORDER BY CAST(SUBSTRING(table_code FROM 'Table ([0-9]+)') AS INTEGER) ASC`
    );

    let nextTableNumber = 1;
    
    if (result.length > 0) {
      // Extract all existing numbers
      const existingNumbers = result.map((row: any) => {
        const match = row.table_code.match(/Table (\d+)/);
        return match ? parseInt(match[1]) : 0;
      }).filter(num => num > 0);

      // Find the first gap in the sequence
      for (let i = 1; i <= existingNumbers.length + 1; i++) {
        if (!existingNumbers.includes(i)) {
          nextTableNumber = i;
          break;
        }
      }
    }

    const newTableCode = `Table ${nextTableNumber}`;

    // Insert new table with UUID
    await query(
      'INSERT INTO restaurant_tables (id, table_code, seats, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, NOW(), NOW())',
      [newTableCode, seats]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Table added successfully',
      tableCode: newTableCode 
    });
  } catch (error) {
    console.error('Add table error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { tableId } = await request.json();
    
    if (!tableId) {
      return NextResponse.json(
        { error: 'Missing table ID' },
        { status: 400 }
      );
    }

    // Check if table has active session
    const activeSession = await query(
      'SELECT id FROM sessions WHERE table_id = $1 AND ended_at IS NULL',
      [tableId]
    );

    if (activeSession.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete table with active session' },
        { status: 400 }
      );
    }

    // Delete the table
    await query(
      'DELETE FROM restaurant_tables WHERE id = $1',
      [tableId]
    );
    
    return NextResponse.json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Delete table error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
