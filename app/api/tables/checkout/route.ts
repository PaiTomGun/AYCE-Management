import { NextResponse } from 'next/server';
import { query, generateId } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { sessionId, paymentMethod } = await request.json();
    
    if (!sessionId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing sessionId or paymentMethod' },
        { status: 400 }
      );
    }

    // Validate payment method
    const validMethods = ['cash', 'credit_card', 'thai_qr'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }
    
    // Get session data
    const sessionData = await query(
      `SELECT s.*, t.table_code, tier.display_name as tier_name, tier.code as tier_code,
              tier.price_per_person_baht,
              (SELECT COUNT(*) FROM session_customers WHERE session_id = s.id) as customer_count
       FROM sessions s
       JOIN restaurant_tables t ON s.table_id = t.id
       LEFT JOIN tiers tier ON s.session_tier_id = tier.id
       WHERE s.id = $1`,
      [sessionId]
    );
    
    if (sessionData.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionData[0];
    const customerCount = Number(session.customer_count);
    const pricePerPerson = Number(session.price_per_person_baht) || 0;
    const totalAmount = customerCount * pricePerPerson;
    const endedAt = new Date();
    const startedAt = new Date(session.started_at);
    const durationMinutes = Math.round((endedAt.getTime() - startedAt.getTime()) / 60000);

    // Create payment record
    const paymentId = generateId();
    await query(
      `INSERT INTO payments (id, session_id, customer_count, price_per_person_baht, amount_baht, method, processed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [paymentId, sessionId, customerCount, pricePerPerson, totalAmount, paymentMethod, endedAt]
    );

    // Log to session_logs
    await query(
      `INSERT INTO session_logs (id, session_id, table_code, started_at, ended_at, customer_count, session_tier_code, 
                                 duration_minutes, buffet_price_per_person_baht, total_amount_baht, payment_method, logged_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        generateId(),
        sessionId,
        session.table_code,
        startedAt,
        endedAt,
        customerCount,
        session.tier_code || session.tier_name || 'STANDARD',
        durationMinutes,
        pricePerPerson,
        totalAmount,
        paymentMethod,
        endedAt
      ]
    );

    // Log menu items ordered during this session
    const orderItems = await query(
      `SELECT oi.*, mi.name as item_name, mc.name as category_name, o.created_at as ordered_at
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       LEFT JOIN menu_items mi ON oi.item_id = mi.id
       LEFT JOIN menu_categories mc ON mi.category_id = mc.id
       WHERE o.session_id = $1`,
      [sessionId]
    );

    for (const item of orderItems) {
      await query(
        `INSERT INTO menu_item_logs (id, session_id, order_id, item_id, item_name, category_name, quantity, 
                                      session_tier_code, buffet_price_per_person_baht, customer_count, ordered_at, logged_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          generateId(),
          sessionId,
          item.order_id,
          item.item_id,
          item.item_name || item.item_name_snapshot || 'Unknown',
          item.category_name || 'Other',
          item.quantity,
          session.tier_code || session.tier_name || 'STANDARD',
          pricePerPerson,
          customerCount,
          item.ordered_at,
          endedAt
        ]
      );
    }
    
    // Update session status to completed
    await query(
      `UPDATE sessions SET status = 'completed', ended_at = $1, updated_at = $2 WHERE id = $3`,
      [endedAt, endedAt, sessionId]
    );
    
    return NextResponse.json({ success: true, totalAmount, paymentId });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
