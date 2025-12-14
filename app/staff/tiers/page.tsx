'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

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
  const [user, setUser] = useState<any>(null);
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
      } else {
        setUser(data.user);
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

  const toggleTierStatus = async (tier: Tier) => {
    try {
      const response = await fetch('/api/tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: tier.id,
          code: tier.code,
          displayName: tier.display_name,
          pricePerPerson: tier.price_per_person_baht,
          priority: tier.priority,
          isActive: !tier.is_active,
        }),
      });
      
      if (response.ok) {
        fetchTiers();
      }
    } catch (error) {
      console.error('Error toggling tier status:', error);
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
        <div className="text-gray-500">Loading...</div>
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
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
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
                        <button
                          onClick={() => toggleTierStatus(tier)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                            tier.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {tier.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3 justify-center">
                          <button 
                            onClick={() => handleEditTier(tier)}
                            className="group relative text-blue-500 hover:text-blue-700"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Edit
                            </span>
                          </button>
                          <button 
                            onClick={() => handleDeleteTier(tier.id)}
                            className="group relative text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Delete
                            </span>
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
