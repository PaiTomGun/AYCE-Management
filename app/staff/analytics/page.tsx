'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    // Set default dates (last 7 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAnalytics();
    }
  }, [startDate, endDate]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (!data.user) {
        router.push('/staff/login');
      }
    } catch (error) {
      router.push('/staff/login');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `/api/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white min-h-screen p-6">
          <div className="mb-8">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl font-bold">👤</span>
            </div>
            <p className="text-sm text-gray-400">ผู้ประสานงานและผู้ใช้งาน</p>
          </div>

          <nav className="space-y-2">
            <Link
              href="/staff/dashboard"
              className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              href="/staff/tables"
              className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
            >
              Table Layout
            </Link>
            <Link
              href="/staff/menu"
              className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
            >
              Menu Management
            </Link>
            <Link
              href="/staff/tiers"
              className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
            >
              Tier Management
            </Link>
            <Link
              href="/staff/accounts"
              className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
            >
              User Management
            </Link>
            <Link
              href="/staff/analytics"
              className="block px-4 py-3 bg-red-500 rounded-lg font-medium"
            >
              Analytics
            </Link>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/staff/login');
              }}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg text-red-400 mt-4"
            >
              🚪 Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white border-b px-8 py-4">
            <h1 className="text-2xl font-bold mb-4">Analytics</h1>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <span>to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border rounded-lg"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>

          {/* Analytics Content */}
          <div className="p-8">
            {analytics && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-600 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold">
                      {analytics.totalRevenue?.toLocaleString() || 0} Baht
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-600 mb-2">Total Customers</h3>
                    <p className="text-3xl font-bold">
                      {analytics.totalCustomers?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-gray-600 mb-2">Avg Duration</h3>
                    <p className="text-3xl font-bold">
                      {Math.round(analytics.avgDuration || 0)} min
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Hourly Breakdown Chart */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Peak Hours</h2>
                    <div className="relative h-64">
                      <svg className="w-full h-full" viewBox="0 0 400 200">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line
                            key={i}
                            x1="40"
                            y1={40 + i * 40}
                            x2="380"
                            y2={40 + i * 40}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                        ))}
                        
                        {/* Bar chart */}
                        {Object.entries(analytics.hourlyBreakdown || {}).map(
                          ([hour, count]: [string, any], index) => {
                            const x = 50 + index * 15;
                            const maxCount = Math.max(...(Object.values(analytics.hourlyBreakdown || {1: 1}) as number[]));
                            const height = (count / maxCount) * 140;
                            return (
                              <rect
                                key={hour}
                                x={x}
                                y={180 - height}
                                width="10"
                                height={height}
                                fill="#ef4444"
                              />
                            );
                          }
                        )}
                        
                        {/* Axes */}
                        <line x1="40" y1="180" x2="380" y2="180" stroke="#000" strokeWidth="2" />
                        <line x1="40" y1="40" x2="40" y2="180" stroke="#000" strokeWidth="2" />
                        
                        {/* Labels */}
                        <text x="10" y="45" fontSize="10">High</text>
                        <text x="10" y="185" fontSize="10">Low</text>
                        <text x="50" y="195" fontSize="10">13:00</text>
                        <text x="150" y="195" fontSize="10">16:00</text>
                        <text x="250" y="195" fontSize="10">18:00</text>
                        <text x="350" y="195" fontSize="10">21:00</text>
                      </svg>
                    </div>
                  </div>

                  {/* Tier Breakdown */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Tier Performance</h2>
                    <div className="space-y-4">
                      {Object.entries(analytics.tierBreakdown || {}).map(
                        ([tier, data]: [string, any]) => (
                          <div key={tier}>
                            <div className="flex justify-between mb-1">
                              <span className="font-medium">{tier}</span>
                              <span className="text-gray-600">
                                {data.count} sessions · {data.revenue.toLocaleString()} Baht
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{
                                  width: `${(data.revenue / analytics.totalRevenue) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment Methods & Top Items */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Payment Methods */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
                    <div className="space-y-3">
                      {Object.entries(analytics.paymentMethodBreakdown || {}).map(
                        ([method, data]: [string, any]) => {
                          const methodLabels: Record<string, string> = {
                            cash: '💵 Cash',
                            credit_card: '💳 Credit Card',
                            thai_qr: '📱 Thai QR',
                          };
                          return (
                            <div key={method} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                              <span className="font-medium">{methodLabels[method] || method}</span>
                              <div className="text-right">
                                <div className="font-bold">{data.count} transactions</div>
                                <div className="text-sm text-gray-600">{data.revenue.toLocaleString()} Baht</div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Top Menu Items */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Top 10 Menu Items</h2>
                    <div className="space-y-2">
                      {(analytics.topMenuItems || []).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">{index + 1}. {item.item_name}</span>
                            <span className="text-gray-500 text-xs ml-2">({item.category_name})</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600">{item.total_quantity}x</div>
                            <div className="text-xs text-gray-500">{item.order_count} orders</div>
                          </div>
                        </div>
                      ))}
                      {(!analytics.topMenuItems || analytics.topMenuItems.length === 0) && (
                        <div className="text-center text-gray-500 py-4">No menu items data</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {!analytics && (
              <div className="text-center text-gray-500 py-12">
                No data available for the selected date range
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
