'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

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
  session_duration_minutes?: number;
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
  const [user, setUser] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerCount, setCustomerCount] = useState(1);
  const [selectedTier, setSelectedTier] = useState('');
  const [sessionDuration, setSessionDuration] = useState(90);
  const [customDuration, setCustomDuration] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [generatedSessionId, setGeneratedSessionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTableSeats, setNewTableSeats] = useState(2);
  const [selectedTableForDelete, setSelectedTableForDelete] = useState<Table | null>(null);
  const [selectedTableForEdit, setSelectedTableForEdit] = useState<Table | null>(null);
  const [editTableSeats, setEditTableSeats] = useState(2);
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
      } else {
        setUser(data.user);
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
    if (!selectedTable?.session_id || !paymentMethod) return;

    try {
      const response = await fetch('/api/tables/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: selectedTable.session_id,
          paymentMethod: paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Checkout successful! Total: ${data.totalAmount} Baht`);
        setShowCheckoutModal(false);
        setPaymentMethod('cash');
        fetchData();
      } else {
        const error = await response.json();
        alert(`Checkout failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Error processing checkout');
    }
  };

  const getRemainingTime = (startedAt: string, durationMinutes: number) => {
    const start = new Date(startedAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    const remaining = durationMinutes - elapsedMinutes;
    
    if (remaining <= 0) {
      return '0 min (Expired)';
    }
    
    return `${remaining} min`;
  };

  const getTimePercentage = (startedAt: string, durationMinutes: number) => {
    const start = new Date(startedAt);
    const now = new Date();
    const elapsedMinutes = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    const remaining = durationMinutes - elapsedMinutes;
    const percentage = (remaining / durationMinutes) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  const getTableColors = (table: Table) => {
    if (table.status === 'free') {
      return {
        bg: 'bg-green-100',
        border: 'border-green-500',
        seat: 'bg-green-300',
        text: 'text-green-700'
      };
    }

    // Occupied table - calculate color based on remaining time
    if (table.started_at && table.session_duration_minutes) {
      const percentage = getTimePercentage(table.started_at, table.session_duration_minutes);
      
      // >= 30% remaining: pink (normal)
      // 10-30% remaining: transition pink to orange
      // < 10% remaining: red (urgent)
      
      if (percentage >= 30) {
        return {
          bg: 'bg-pink-100',
          border: 'border-pink-500',
          seat: 'bg-pink-300',
          text: 'text-pink-700'
        };
      } else if (percentage >= 10) {
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-500',
          seat: 'bg-orange-300',
          text: 'text-orange-700'
        };
      } else {
        return {
          bg: 'bg-red-100',
          border: 'border-red-500',
          seat: 'bg-red-300',
          text: 'text-red-700'
        };
      }
    }

    // Default occupied color
    return {
      bg: 'bg-pink-100',
      border: 'border-pink-500',
      seat: 'bg-pink-300',
      text: 'text-pink-700'
    };
  };

  const parseLayout = (layout: string | undefined | null) => {
    if (!layout) return { x: 0, y: 0 };
    try {
      return JSON.parse(layout);
    } catch {
      return { x: 0, y: 0 };
    }
  };

  const handleAddTable = () => {
    setNewTableSeats(2);
    setShowAddModal(true);
  };

  const confirmAddTable = async () => {
    if (newTableSeats < 1 || newTableSeats > 20) {
      alert('Please enter a valid number of seats (1-20)');
      return;
    }

    try {
      const response = await fetch('/api/tables', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: newTableSeats,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Table added successfully: ${data.tableCode}`);
        setShowAddModal(false);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Failed to add table: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding table:', error);
      alert('Error adding table');
    }
  };

  const handleDeleteTable = () => {
    setShowDeleteModal(true);
    setSelectedTableForDelete(null);
  };

  const confirmDeleteTable = async () => {
    if (!selectedTableForDelete) {
      alert('Please select a table to delete');
      return;
    }

    if (selectedTableForDelete.status === 'occupied') {
      alert('Cannot delete an occupied table');
      return;
    }

    try {
      const response = await fetch('/api/tables', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableForDelete.id,
        }),
      });

      if (response.ok) {
        alert('Table deleted successfully!');
        setShowDeleteModal(false);
        setSelectedTableForDelete(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Failed to delete table: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      alert('Error deleting table');
    }
  };

  const handleEditTable = () => {
    setShowEditModal(true);
    setSelectedTableForEdit(null);
    setEditTableSeats(2);
  };

  const confirmEditTable = async () => {
    if (!selectedTableForEdit) {
      alert('Please select a table to edit');
      return;
    }

    if (editTableSeats < 1 || editTableSeats > 20) {
      alert('Please enter a valid number of seats (1-20)');
      return;
    }

    if (selectedTableForEdit.status === 'occupied') {
      alert('Cannot edit an occupied table');
      return;
    }

    try {
      const response = await fetch('/api/tables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: selectedTableForEdit.id,
          seats: editTableSeats,
        }),
      });

      if (response.ok) {
        alert('Table updated successfully!');
        setShowEditModal(false);
        setSelectedTableForEdit(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Failed to update table: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating table:', error);
      alert('Error updating table');
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
        <Sidebar role={user?.role} />

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Table Layout</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Date: {new Date().toLocaleDateString('th-TH')} Time:{' '}
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              {user?.role === 'admin' && (
                <>
                  <button 
                    onClick={handleAddTable}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                  >
                    + Add
                  </button>
                  <button 
                    onClick={handleEditTable}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600"
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    onClick={handleDeleteTable}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
                  >
                    🗑 Delete
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Table Layout Grid */}
          <div className="p-8">
            <div className="grid grid-cols-3 gap-6">
              {tables.map((table) => {
                const pos = parseLayout(table.layout);
                const colors = getTableColors(table);
                return (
                  <div
                    key={table.id}
                    className={`rounded-lg p-4 cursor-pointer transition-all ${colors.bg} border-2 ${colors.border}`}
                    onClick={() => handleTableClick(table)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-1">
                        {Array.from({ length: table.seats }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-6 rounded-sm ${colors.seat}`}
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
                      <div className={`text-lg font-bold mb-1 ${colors.text}`}>
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
                            {table.started_at && new Date(table.started_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          <div className="text-gray-700">
                            <strong>Remaining Time:</strong>{' '}
                            {table.started_at && table.session_duration_minutes && 
                              getRemainingTime(table.started_at, table.session_duration_minutes)}
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

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Table</h2>
            
            <p className="text-sm text-gray-600 mb-4">
              Table name will be automatically generated (e.g., Table 1, Table 2, etc.)
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Number of Seats</label>
              <input
                type="number"
                value={newTableSeats}
                onChange={(e) => setNewTableSeats(parseInt(e.target.value) || 2)}
                min="1"
                max="20"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddTable}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Add Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Table Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Table</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Table to Edit</label>
              <select
                value={selectedTableForEdit?.id || ''}
                onChange={(e) => {
                  const table = tables.find(t => t.id === e.target.value);
                  setSelectedTableForEdit(table || null);
                  setEditTableSeats(table?.seats || 2);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a table...</option>
                {tables.filter(t => t.status === 'free').map(table => (
                  <option key={table.id} value={table.id}>
                    {table.table_code} (Currently {table.seats} seats)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">Only free tables can be edited</p>
            </div>
            
            {selectedTableForEdit && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Number of Seats</label>
                <input
                  type="number"
                  value={editTableSeats}
                  onChange={(e) => setEditTableSeats(parseInt(e.target.value) || 2)}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTableForEdit(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEditTable}
                disabled={!selectedTableForEdit}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Update Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Table Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Delete Table</h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Select Table to Delete</label>
              <select
                value={selectedTableForDelete?.id || ''}
                onChange={(e) => {
                  const table = tables.find(t => t.id === e.target.value);
                  setSelectedTableForDelete(table || null);
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a table...</option>
                {tables.filter(t => t.status === 'free').map(table => (
                  <option key={table.id} value={table.id}>
                    {table.table_code} ({table.seats} seats)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">Only free tables can be deleted</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTableForDelete(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTable}
                disabled={!selectedTableForDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Delete Table
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && selectedTable && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Checkout Table {selectedTable.table_code}</h2>
            
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
                <span className="text-gray-600">Price per person:</span>
                <span className="font-medium">{selectedTable.tier_price} Baht</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">
                  {selectedTable.started_at && new Date(selectedTable.started_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="text-gray-900 font-semibold">Total Amount:</span>
                <span className="font-bold text-lg text-red-600">
                  {((selectedTable.customer_count || 0) * (selectedTable.tier_price || 0)).toLocaleString()} Baht
                </span>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="ml-3 text-sm font-medium">💵 Cash</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="ml-3 text-sm font-medium">💳 Credit Card</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="thai_qr"
                    checked={paymentMethod === 'thai_qr'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-red-500"
                  />
                  <span className="ml-3 text-sm font-medium">📱 Thai Payment QR</span>
                </label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setPaymentMethod('cash');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
