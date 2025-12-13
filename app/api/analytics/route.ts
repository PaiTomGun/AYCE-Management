import { NextResponse } from 'next/server';
import { getSessionLogs } from '@/lib/database';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    
    const logs = await getSessionLogs(startDate, endDate);
    
    // Calculate analytics
    const analytics = {
      totalRevenue: logs.reduce((sum, log: any) => sum + Number(log.total_amount_baht), 0),
      totalCustomers: logs.reduce((sum, log: any) => sum + Number(log.customer_count), 0),
      avgDuration: logs.length > 0 
        ? logs.reduce((sum, log: any) => sum + (Number(log.duration_minutes) || 0), 0) / logs.length 
        : 0,
      tierBreakdown: logs.reduce((acc: any, log: any) => {
        const tier = log.session_tier_code || 'Unknown';
        if (!acc[tier]) {
          acc[tier] = { count: 0, revenue: 0 };
        }
        acc[tier].count += 1;
        acc[tier].revenue += Number(log.total_amount_baht);
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
    };
    
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
