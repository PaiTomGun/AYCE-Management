'use client';

import { useState, useEffect, use, useRef } from 'react';
import { CartItem } from '@/lib/types';

export default function MenuPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [menu, setMenu] = useState<any>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [orderSent, setOrderSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchSessionInfo();
  }, []);

  useEffect(() => {
    if (!sessionInfo) return;
    
    // Initial update
    const updateTime = () => {
      if (!sessionInfo?.started_at || !sessionInfo?.session_duration_minutes) {
        setTimeLeft('--:--');
        return;
      }
      
      const startTime = new Date(sessionInfo.started_at).getTime();
      const duration = sessionInfo.session_duration_minutes * 60 * 1000;
      const endTime = startTime + duration;
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [sessionInfo]);

  const fetchSessionInfo = async () => {
    try {
      const response = await fetch(`/api/tables/session/${sessionId}`);
      
      if (response.status === 404) {
        // Session not found or inactive
        setSessionInfo({ error: 'not_found' });
        setLoading(false);
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        setSessionInfo({ error: data.error });
        setLoading(false);
        return;
      }
      
      setSessionInfo(data);
      // Fetch menu based on tier from customer_tiers (via session_tier_id)
      if (data.tier_id || data.session_tier_id) {
        fetchMenu(data.tier_id || data.session_tier_id);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setSessionInfo({ error: 'fetch_error' });
      setLoading(false);
    }
  };

  const fetchMenu = async (tierId: string) => {
    try {
      const response = await fetch(`/api/menu?tierId=${tierId}`);
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: string, itemName: string, delta: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === itemId);
      if (existing) {
        const newQuantity = existing.quantity + delta;
        if (newQuantity <= 0) {
          return prevCart.filter((item) => item.id !== itemId);
        }
        return prevCart.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
      } else if (delta > 0) {
        return [...prevCart, { id: itemId, name: itemName, quantity: delta }];
      }
      return prevCart;
    });
  };

  const getQuantity = (itemId: string) => {
    return cart.find((item) => item.id === itemId)?.quantity || 0;
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleOrder = () => {
    if (cart.length === 0) return;
    setShowOrder(true);
  };

  const confirmOrder = async () => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionId,
          items: cart,
        }),
      });
      
      if (response.ok) {
        setOrderSent(true);
        setTimeout(() => {
          setCart([]);
          setShowOrder(false);
          setOrderSent(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await fetch(`/api/orders/history?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success) {
        setOrderHistory(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const handleShowOrderHistory = () => {
    fetchOrderHistory();
    setShowOrderHistory(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { bg: string; text: string; label: string } } = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Processing' },
      preparing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Preparing' },
      ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Ready' },
      served: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Served' },
    };
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const categories = ['All', ...Object.keys(menu)];

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = categoryRefs.current[category];
      if (element) {
        const offset = 180; // Header height + category tabs height
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // Check if session is inactive or not found
  if (sessionInfo?.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Session Ended</h1>
            <p className="text-gray-600 mb-6">
              This session has been checked out<br />
              or does not exist in the system
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-gray-600">
              <p>Please contact staff to start a new session</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (orderSent) {
    return (
      <div className="min-h-screen bg-red-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 border-8 border-white rounded-full flex items-center justify-center">
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white text-xl">Order Sent Successfully</p>
        </div>
      </div>
    );
  }

  if (showOrder) {
    return (
      <div className="min-h-screen bg-red-500 text-white">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Confirm Order</h1>
            <button 
              onClick={() => setShowOrder(false)}
              className="text-white hover:text-red-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="bg-white text-black rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <div>
                <p className="text-sm text-gray-500">Table</p>
                <p className="font-bold text-lg">{sessionInfo?.table_code || 'Loading...'}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tier</p>
                <p className="font-bold text-red-500">{sessionInfo?.tier_name || '-'}</p>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="flex-1">{item.name}</span>
                  <span className="font-medium">x {item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-red-500">{getTotalItems()} items</span>
              </div>
            </div>
          </div>

          <button
            onClick={confirmOrder}
            className="w-full bg-white text-red-500 rounded-full py-4 font-bold mb-3 hover:bg-red-50 text-lg"
          >
            ✓ Confirm Order
          </button>
          <button
            onClick={() => setShowOrder(false)}
            className="w-full bg-red-600 text-white rounded-full py-3 font-bold hover:bg-red-700"
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Order History Modal */}
      {showOrderHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Order History</h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchOrderHistory}
                  className="text-red-500 hover:text-red-600"
                  title="Refresh"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
                <button
                  onClick={() => setShowOrderHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {orderHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <p>No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory.map((order, index) => (
                    <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            Order #{orderHistory.length - index}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                        </div>
                        {getStatusBadge(order.status || 'pending')}
                      </div>
                      <div className="space-y-2">
                        {order.items && order.items.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.item_name}</span>
                            <span className="font-medium text-red-500">x {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      {order.items && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total Quantity:</span>
                            <span className="text-red-500">
                              {order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} items
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-white">
              <button
                onClick={() => setShowOrderHistory(false)}
                className="w-full bg-red-500 text-white rounded-full py-3 font-bold hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basket Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
          <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>Cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.name, -1)}
                          className="w-8 h-8 rounded-full bg-white border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-red-500">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.name, 1)}
                          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-red-500">{getTotalItems()} items</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={cart.length === 0}
                className={`w-full rounded-full py-3 font-bold mb-2 ${
                  cart.length > 0
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                Place Order
              </button>
              <button
                onClick={() => setShowCart(false)}
                className="w-full bg-white border-2 border-red-500 text-red-500 rounded-full py-3 font-bold hover:bg-red-50"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto">
          {/* Header */}
        <div className="bg-white p-4 border-b sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h1 className="font-bold">Menu</h1>
                <p className="text-xs text-gray-500">
                  {sessionInfo?.table_code || 'Loading...'}
                </p>
              </div>
            </div>
            <button 
              onClick={handleShowOrderHistory}
              className="text-red-500 hover:text-red-600"
              title="Order History"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </button>
          </div>
          {sessionInfo && (
            <div className="space-y-1">
              <div className="text-xs bg-red-50 p-2 rounded text-center">
                <span className="font-bold text-red-600">{sessionInfo.tier_name}</span>
                <span className="text-gray-600"> - ฿{sessionInfo.tier_price}/person</span>
              </div>
              <div className="flex justify-between text-xs bg-red-50 p-2 rounded">
                <div>
                  <span className="text-gray-600">Checked in: </span>
                  <span className="font-medium">
                    {new Date(sessionInfo.started_at).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Time left: </span>
                  <span className="font-bold text-red-600">{timeLeft}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 p-4 overflow-x-auto sticky top-[140px] bg-white z-10 border-b">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="p-4 pb-24">
          {Object.entries(menu).map(([category, items]: [string, any]) => (
            <div 
              key={category} 
              className="mb-6"
              ref={(el) => { categoryRefs.current[category] = el; }}
            >
              <h2 className="text-xl font-bold mb-4 text-gray-800">{category}</h2>
              {(items as any[]).map((item) => (
                <div key={item.id} className="flex gap-3 mb-4 pb-4 border-b">
                  <img
                    src={item.image_base64 || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect width="80" height="80" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" fill="%239ca3af"%3E🍽️%3C/text%3E%3C/svg%3E'}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{item.name}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.name, -1)}
                        disabled={getQuantity(item.id) === 0}
                        className="w-8 h-8 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold text-red-500">
                        {getQuantity(item.id)}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.name, 1)}
                        className="w-8 h-8 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center hover:bg-red-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Cart Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="max-w-md mx-auto flex gap-2">
            <button
              onClick={() => setShowCart(!showCart)}
              className="flex-1 bg-white border-2 border-red-500 text-red-500 rounded-full py-3 px-6 font-bold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Cart
              {cart.length > 0 && (
                <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {getTotalItems()}
                </span>
              )}
            </button>
            <button
              onClick={handleShowOrderHistory}
              className="flex-1 bg-red-500 text-white rounded-full py-3 px-6 font-bold flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              History
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
