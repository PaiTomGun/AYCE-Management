import { NextResponse } from 'next/server';
import { getSessionLogs, query } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    
    const logs = await getSessionLogs(startDate, endDate);
    
    // Calculate analytics from session_logs
    const analytics: any = {
      totalRevenue: logs.reduce((sum, log: any) => sum + Number(log.total_amount_baht || 0), 0),
      totalCustomers: logs.reduce((sum, log: any) => sum + Number(log.customer_count || 0), 0),
      totalSessions: logs.length,
      avgDuration: logs.length > 0 
        ? logs.reduce((sum, log: any) => sum + (Number(log.duration_minutes) || 0), 0) / logs.length 
        : 0,
      tierBreakdown: logs.reduce((acc: any, log: any) => {
        const tier = log.session_tier_code || 'Unknown';
        if (!acc[tier]) {
          acc[tier] = { count: 0, revenue: 0, customers: 0 };
        }
        acc[tier].count += 1;
        acc[tier].revenue += Number(log.total_amount_baht || 0);
        acc[tier].customers += Number(log.customer_count || 0);
        return acc;
      }, {}),
      hourlyBreakdown: logs.reduce((acc: any, log: any) => {
        const hour = new Date(log.started_at).getHours();
        if (!acc[hour]) {
          acc[hour] = 0;
        }
        acc[hour] += 1;
        return acc;
      }, {}),
      paymentMethodBreakdown: logs.reduce((acc: any, log: any) => {
        const method = log.payment_method || 'Unknown';
        if (!acc[method]) {
          acc[method] = { count: 0, revenue: 0 };
        }
        acc[method].count += 1;
        acc[method].revenue += Number(log.total_amount_baht || 0);
        return acc;
      }, {}),
    };

    // Get top menu items from menu_item_logs
    let topItems = [];
    if (startDate && endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setDate(endDateTime.getDate() + 1);
      topItems = await query(
        `SELECT item_name, category_name, SUM(quantity) as total_quantity, COUNT(DISTINCT session_id) as order_count
         FROM menu_item_logs
         WHERE ordered_at >= $1 AND ordered_at < $2
         GROUP BY item_name, category_name
         ORDER BY total_quantity DESC
         LIMIT 10`,
        [startDate, endDateTime]
      );
    } else {
      topItems = await query(
        `SELECT item_name, category_name, SUM(quantity) as total_quantity, COUNT(DISTINCT session_id) as order_count
         FROM menu_item_logs
         GROUP BY item_name, category_name
         ORDER BY total_quantity DESC
         LIMIT 10`
      );
    }

    analytics.topMenuItems = topItems;
    
    return NextResponse.json({ logs, analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
