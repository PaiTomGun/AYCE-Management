'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/app/components/Sidebar';
import TopBar from '@/app/components/TopBar';

interface OrderItem {
  id: string;
  item_id: string;
  item_name: string;
  quantity: number;
}

interface Order {
  id: string;
  session_id: string;
  created_at: string;
  status: string;
  table_code: string;
  tier_name: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'staff' | 'admin' | null>(null);

  useEffect(() => {
    const init = async () => {
      await fetchSession();
      await fetchOrders();
      setLoading(false);
    };
    init();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        // Redirect admin users to dashboard as they shouldn't access orders page
        if (data.user?.role === 'admin') {
          window.location.href = '/staff/dashboard';
          return;
        }
        setUserRole(data.user?.role || 'staff');
      } else {
        setUserRole('staff');
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setUserRole('staff');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/pending');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        // Refresh orders list
        fetchOrders();
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const orderTime = new Date(dateString).getTime();
    const diffMinutes = Math.floor((now - orderTime) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes === 1) return '1 minute ago';
    return `${diffMinutes} minutes ago`;
  };

  if (loading || !userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={userRole} />
      <div className="flex-1">
        <TopBar title="Upcoming Orders" />
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No pending orders</h3>
              <p className="text-gray-500">New orders will appear here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-md p-5 border-l-4 border-red-500 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {order.table_code}
                        </h3>
                        <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-full">
                          {order.tier_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(order.created_at)}
                        </span>
                        <span className="font-medium text-orange-600">
                          {getTimeAgo(order.created_at)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Complete
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-3">Menu Items:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {order.items && order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg"
                        >
                          <span className="text-gray-800">{item.item_name}</span>
                          <span className="font-semibold text-red-600">x {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-lg font-bold text-red-600">
                        {order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0} items
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
