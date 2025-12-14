import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch all orders for this session with their items
    const ordersData = await query(`
      SELECT 
        o.id,
        o.session_id,
        o.created_at,
        o.status,
        json_agg(
          json_build_object(
            'id', oi.id,
            'item_name', oi.item_name_snapshot,
            'quantity', oi.quantity,
            'notes', oi.notes
          ) ORDER BY oi.created_at
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.session_id = $1
      GROUP BY o.id, o.session_id, o.created_at, o.status
      ORDER BY o.created_at DESC
    `, [sessionId]);
    
    return NextResponse.json({ 
      orders: ordersData,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching order history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
