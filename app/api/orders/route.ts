import { NextResponse } from 'next/server';
import { query, generateId } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { sessionId, items } = await request.json();
    
    if (!sessionId || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const orderId = generateId();
    const now = new Date();
    
    // Get session information for logging
    const sessionData = await query(`
      SELECT 
        s.id as session_id,
        s.session_tier_id,
        t.code as tier_code,
        t.price_per_person_baht,
        (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count
      FROM sessions s
      LEFT JOIN tiers t ON s.session_tier_id = t.id
      WHERE s.id = $1
    `, [sessionId]);
    
    const session = sessionData[0];
    
    // Create order
    await query(`
      INSERT INTO orders (id, session_id, created_at, status)
      VALUES ($1, $2, $3, 'pending')
    `, [orderId, sessionId, now]);
    
    // Create order items and menu item logs
    for (const item of items) {
      const orderItemId = generateId();
      const logId = generateId();
      
      // Insert into order_items
      await query(`
        INSERT INTO order_items (id, order_id, item_id, item_name_snapshot, quantity, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [orderItemId, orderId, item.id, item.name, item.quantity, now]);
      
      // Get menu item details for logging
      const menuItemData = await query(`
        SELECT 
          mi.id,
          mi.name,
          mc.name as category_name
        FROM menu_items mi
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE mi.id = $1
      `, [item.id]);
      
      const menuItem = menuItemData[0];
      
      // Insert into menu_item_logs for analytics
      await query(`
        INSERT INTO menu_item_logs (
          id, session_id, order_id, item_id, item_name, category_name,
          quantity, session_tier_code, buffet_price_per_person_baht,
          customer_count, ordered_at, logged_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `, [
        logId,
        sessionId,
        orderId,
        item.id,
        menuItem?.name || item.name,
        menuItem?.category_name || null,
        item.quantity,
        session?.tier_code || null,
        session?.price_per_person_baht || null,
        session?.customer_count || 0,
        now,
        now
      ]);
    }
    
    return NextResponse.json({ orderId, success: true });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
