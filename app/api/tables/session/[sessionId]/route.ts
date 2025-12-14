import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    
    const sessionData = await query(
      `SELECT s.*, 
              t.table_code,
              tier.id as tier_id,
              tier.display_name as tier_name,
              tier.price_per_person_baht as tier_price,
              (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count
       FROM sessions s
       JOIN restaurant_tables t ON s.table_id = t.id
       LEFT JOIN tiers tier ON s.session_tier_id = tier.id
       WHERE s.id = $1 AND s.status = 'active'`,
      [sessionId]
    );
    
    if (sessionData.length === 0) {
      return NextResponse.json(
        { error: 'Session not found or inactive' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(sessionData[0]);
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
