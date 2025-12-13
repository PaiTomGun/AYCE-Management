'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardStats, User } from '@/lib/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (!data.user) {
        router.push('/staff/login');
      } else {
        setUser(data.user);
      }
    } catch (error) {
      router.push('/staff/login');
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/staff/login');
  };

  if (loading || !stats) {
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
              className="block px-4 py-3 bg-red-500 rounded-lg font-medium"
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
            {user?.role === 'admin' && (
              <Link
                href="/staff/accounts"
                className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
              >
                User Management
              </Link>
            )}
            <Link
              href="/staff/analytics"
              className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
            >
              Analytics
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg text-red-400 mt-4"
            >
              🚪 Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="p-8">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-600">Sales Today</h3>
                </div>
                <p className="text-3xl font-bold">{stats.sales_today.toLocaleString()} Baht</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-600">Customer Now</h3>
                </div>
                <p className="text-3xl font-bold">{stats.customer_now}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-gray-600">Active Table</h3>
                </div>
                <p className="text-3xl font-bold">{stats.active_table}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-gray-600">Available Table</h3>
                </div>
                <p className="text-3xl font-bold">{stats.available_table}</p>
              </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="text-gray-500 text-center py-8">
                No recent activity
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
