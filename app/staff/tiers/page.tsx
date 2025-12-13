'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tier {
  id: string;
  code: string;
  display_name: string;
  price_per_person_baht: number;
  is_active: boolean;
  priority: number;
}

export default function TiersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);
  const [tierCode, setTierCode] = useState('');
  const [tierName, setTierName] = useState('');
  const [tierPrice, setTierPrice] = useState('');
  const [tierPriority, setTierPriority] = useState('');
  const [isActive, setIsActive] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchTiers();
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

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/tiers?includeInactive=true');
      const data = await response.json();
      setTiers(data);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = () => {
    setEditingTier(null);
    setTierCode('');
    setTierName('');
    setTierPrice('');
    setTierPriority('');
    setIsActive(true);
    setShowModal(true);
  };

  const handleEditTier = (tier: Tier) => {
    setEditingTier(tier);
    setTierCode(tier.code);
    setTierName(tier.display_name);
    setTierPrice(tier.price_per_person_baht.toString());
    setTierPriority(tier.priority.toString());
    setIsActive(tier.is_active);
    setShowModal(true);
  };

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;
    
    try {
      const response = await fetch('/api/tiers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId }),
      });
      
      if (response.ok) {
        fetchTiers();
      }
    } catch (error) {
      console.error('Error deleting tier:', error);
    }
  };

  const handleSaveTier = async () => {
    if (!tierCode || !tierName || !tierPrice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/tiers', {
        method: editingTier ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: editingTier?.id,
          code: tierCode,
          displayName: tierName,
          pricePerPerson: parseFloat(tierPrice),
          priority: tierPriority ? parseInt(tierPriority) : 99,
          isActive,
        }),
      });
      
      if (response.ok) {
        setShowModal(false);
        fetchTiers();
      }
    } catch (error) {
      console.error('Error saving tier:', error);
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
              className="block px-4 py-3 bg-red-500 rounded-lg font-medium"
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
            <h1 className="text-2xl font-bold">Tier Management</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleAddTier}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
              >
                + Add Tier
              </button>
            </div>
          </div>

          {/* Tiers List */}
          <div className="p-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Display Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Price (Baht)
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tiers.map((tier) => (
                    <tr key={tier.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{tier.code}</td>
                      <td className="px-6 py-4">{tier.display_name}</td>
                      <td className="px-6 py-4">฿{tier.price_per_person_baht}</td>
                      <td className="px-6 py-4">{tier.priority}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            tier.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {tier.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditTier(tier)}
                            className="text-blue-500 hover:text-blue-700 text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteTier(tier.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tiers.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                No tiers found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              {editingTier ? 'Edit Tier' : 'Add New Tier'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Code *</label>
              <input
                type="text"
                value={tierCode}
                onChange={(e) => setTierCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., PREMIUM"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Display Name *</label>
              <input
                type="text"
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., Premium Buffet"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Price per Person (Baht) *</label>
              <input
                type="number"
                value={tierPrice}
                onChange={(e) => setTierPrice(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., 399"
                min="0"
                step="1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Priority (lower = higher priority)</label>
              <input
                type="number"
                value={tierPriority}
                onChange={(e) => setTierPriority(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="e.g., 1"
                min="1"
              />
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Active</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTier}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
