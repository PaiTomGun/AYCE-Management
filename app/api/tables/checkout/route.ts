import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }
    
    // Update session status to completed
    await query(
      `UPDATE sessions SET status = 'completed', ended_at = $1, updated_at = $2 WHERE id = $3`,
      [new Date(), new Date(), sessionId]
    );
    
    // Log to session_logs (if needed)
    const sessionData = await query(
      `SELECT s.*, t.table_code, tier.display_name as tier_name,
              (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count
       FROM sessions s
       JOIN restaurant_tables t ON s.table_id = t.id
       LEFT JOIN tiers tier ON s.session_tier_id = tier.id
       WHERE s.id = $1`,
      [sessionId]
    );
    
    if (sessionData.length > 0) {
      const session = sessionData[0];
      await query(
        `INSERT INTO session_logs (id, session_id, table_code, started_at, ended_at, customer_count, session_tier_code, logged_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)`,
        [
          sessionId,
          session.table_code,
          session.started_at,
          new Date(),
          session.customer_count,
          session.tier_name || 'STANDARD',
          new Date()
        ]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
