'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Table {
  id: string;
  table_code: string;
  seats: number;
  status: 'free' | 'occupied';
  session_id?: string;
  started_at?: string;
  customer_count?: number;
  tier_name?: string;
  tier_price?: number;
  layout?: string;
}

interface Tier {
  id: string;
  code: string;
  display_name: string;
  price_per_person_baht: number;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [customerCount, setCustomerCount] = useState(1);
  const [selectedTier, setSelectedTier] = useState('');
  const [sessionDuration, setSessionDuration] = useState(90);
  const [customDuration, setCustomDuration] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [generatedSessionId, setGeneratedSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const fetchData = async () => {
    try {
      const [tablesRes, tiersRes] = await Promise.all([
        fetch('/api/tables'),
        fetch('/api/tiers'),
      ]);
      const tablesData = await tablesRes.json();
      const tiersData = await tiersRes.json();
      setTables(tablesData);
      setTiers(tiersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableClick = (table: Table) => {
    if (table.status === 'occupied') {
      setSelectedTable(table);
      setShowCheckoutModal(true);
    } else {
      handleAssignSeat(table);
    }
  };

  const handleAssignSeat = (table: Table) => {
    setSelectedTable(table);
    setShowAssignModal(true);
    setCustomerCount(1);
    setSelectedTier('');
    setSessionDuration(90);
    setCustomDuration('');
  };

  const confirmAssign = async () => {
    if (!selectedTable || !selectedTier) return;

    const duration = sessionDuration === 0 ? parseInt(customDuration) : sessionDuration;
    if (!duration || duration <= 0) {
      alert('Please enter a valid session duration');
      return;
    }

    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTable.id,
          tierId: selectedTier,
          customerCount,
          sessionDuration: duration,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const sessionId = data.sessionId;
        setGeneratedSessionId(sessionId);
        
        // Generate QR code
        const QRCode = (await import('qrcode')).default;
        const orderUrl = `${window.location.origin}/menu/${sessionId}`;
        const qrDataUrl = await QRCode.toDataURL(orderUrl, {
          width: 300,
          margin: 2,
        });
        
        setQrCodeUrl(qrDataUrl);
        setShowAssignModal(false);
        setShowQRModal(true);
        fetchData();
      }
    } catch (error) {
      console.error('Error assigning seat:', error);
    }
  };

  const handleCheckout = async () => {
    if (!selectedTable?.session_id) return;

    try {
      const response = await fetch('/api/tables/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedTable.session_id,
        }),
      });

      if (response.ok) {
        setShowCheckoutModal(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const getElapsedTime = (startedAt: string) => {
    const start = new Date(startedAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return `${diff} min`;
  };

  const parseLayout = (layout: string | undefined | null) => {
    if (!layout) return { x: 0, y: 0 };
    try {
      return JSON.parse(layout);
    } catch {
      return { x: 0, y: 0 };
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
              className="block px-4 py-3 bg-red-500 rounded-lg font-medium"
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
              className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
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
          <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Table Layout</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Date: {new Date().toLocaleDateString('th-TH')} Time:{' '}
                {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                + Add
              </button>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">
                🗑 Delete
              </button>
            </div>
          </div>

          {/* Table Layout Grid */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-6">
              {tables.map((table) => {
                const pos = parseLayout(table.layout);
                return (
                  <div
                    key={table.id}
                    className={`rounded-lg p-4 cursor-pointer transition-all ${
                      table.status === 'free'
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-pink-100 border-2 border-pink-500'
                    }`}
                    onClick={() => handleTableClick(table)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">
                        {Array.from({ length: table.seats }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-sm ${
                              table.status === 'free' ? 'bg-green-300' : 'bg-pink-300'
                            }`}
                          />
                        ))}
                      </div>
                      {table.status === 'occupied' && (
                        <button className="text-red-500 hover:text-red-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="text-center">
                      <div className={`text-lg font-bold mb-1 ${
                        table.status === 'free' ? 'text-green-700' : 'text-pink-700'
                      }`}>
                        {table.table_code}
                      </div>

                      {table.status === 'occupied' && (
                        <div className="text-sm space-y-1">
                          <div className="text-gray-700">
                            <strong>Status:</strong> Occupied
                          </div>
                          <div className="text-gray-700">
                            <strong>Customer:</strong> {table.customer_count}
                          </div>
                          <div className="text-gray-700">
                            <strong>Starting Time:</strong>{' '}
                            {table.started_at && new Date(table.started_at).toLocaleTimeString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-gray-700">
                            <strong>Remaining Time:</strong>{' '}
                            {table.started_at && getElapsedTime(table.started_at)}
                          </div>
                        </div>
                      )}

                      {table.status === 'free' && (
                        <div className="text-sm text-green-700 font-medium">
                          Available
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedTable && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Assign Table {selectedTable.table_code}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Number of Customers
              </label>
              <input
                type="number"
                min="1"
                max={selectedTable.seats}
                value={customerCount}
                onChange={(e) => setCustomerCount(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Tier</label>
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="">-- Select Tier --</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.display_name} - {tier.price_per_person_baht} Baht
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Session Duration (minutes)</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[60, 90, 120].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSessionDuration(duration)}
                    className={`px-4 py-2 border rounded-lg ${
                      sessionDuration === duration
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
                <button
                  onClick={() => setSessionDuration(0)}
                  className={`px-4 py-2 border rounded-lg ${
                    sessionDuration === 0
                      ? 'bg-red-500 text-white border-red-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Custom
                </button>
              </div>
              {sessionDuration === 0 && (
                <input
                  type="number"
                  min="1"
                  placeholder="Enter minutes"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssign}
                disabled={!selectedTier}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4">Seat Assigned Successfully!</h2>
            <p className="text-gray-600 mb-4">Scan this QR code to access the menu</p>
            
            {qrCodeUrl && (
              <div className="mb-4">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
              </div>
            )}
            
            <div className="bg-gray-100 p-3 rounded mb-4 text-sm break-all">
              {window.location.origin}/menu/{generatedSessionId}
            </div>
            
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && selectedTable && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Checkout Table {selectedTable.table_code}?</h2>
            
            <div className="mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customers:</span>
                <span className="font-medium">{selectedTable.customer_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tier:</span>
                <span className="font-medium">{selectedTable.tier_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">
                  {selectedTable.started_at && new Date(selectedTable.started_at).toLocaleTimeString('th-TH', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
