import { NextResponse } from 'next/server';
import { getActiveTiers, query, generateId } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    let sql = 'SELECT * FROM tiers WHERE archived_at IS NULL';
    if (!includeInactive) {
      sql += ' AND is_active = true';
    }
    sql += ' ORDER BY priority ASC';
    
    const tiers = await query(sql);
    return NextResponse.json(tiers);
  } catch (error) {
    console.error('Tiers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { code, displayName, pricePerPerson, priority, isActive } = await request.json();
    
    if (!code || !displayName || pricePerPerson == null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const tierId = generateId();
    await query(
      `INSERT INTO tiers (id, code, display_name, price_per_person_baht, priority, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tierId, code, displayName, pricePerPerson, priority || 99, isActive !== false, new Date()]
    );
    
    return NextResponse.json({ success: true, tierId });
  } catch (error) {
    console.error('Tiers POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { tierId, code, displayName, pricePerPerson, priority, isActive } = await request.json();
    
    if (!tierId || !code || !displayName || pricePerPerson == null) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    await query(
      `UPDATE tiers 
       SET code = $1, display_name = $2, price_per_person_baht = $3, priority = $4, is_active = $5
       WHERE id = $6`,
      [code, displayName, pricePerPerson, priority || 99, isActive !== false, tierId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tiers PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { tierId } = await request.json();
    
    if (!tierId) {
      return NextResponse.json(
        { error: 'Missing tierId' },
        { status: 400 }
      );
    }
    
    await query(
      'UPDATE tiers SET archived_at = $1 WHERE id = $2',
      [new Date(), tierId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tiers DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
