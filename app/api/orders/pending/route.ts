import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    const pendingOrders = await query(`
      SELECT 
        o.id,
        o.session_id,
        o.created_at,
        o.status,
        t.table_code,
        s.session_tier_id,
        tier.display_name as tier_name,
        (
          SELECT json_agg(
            json_build_object(
              'id', oi.id,
              'item_id', oi.item_id,
              'item_name', oi.item_name_snapshot,
              'quantity', oi.quantity
            )
          )
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) as items
      FROM orders o
      JOIN sessions s ON o.session_id = s.id
      JOIN restaurant_tables t ON s.table_id = t.id
      LEFT JOIN tiers tier ON s.session_tier_id = tier.id
      WHERE o.status = 'pending'
      ORDER BY o.created_at ASC
    `);

    return NextResponse.json(pendingOrders);
  } catch (error) {
    console.error('Pending orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
