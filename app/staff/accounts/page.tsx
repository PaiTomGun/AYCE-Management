'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@/lib/types';

interface Account {
  id: string;
  username: string;
  role: 'staff' | 'admin';
  is_active: boolean;
  created_at: string;
  created_by_username: string | null;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'staff' | 'admin'>('staff');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchAccounts();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      if (!data.user) {
        router.push('/staff/login');
      } else if (data.user.role !== 'admin') {
        router.push('/staff/dashboard');
      } else {
        setUser(data.user);
      }
    } catch (error) {
      router.push('/staff/login');
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !role) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      setShowAddModal(false);
      setUsername('');
      setPassword('');
      setRole('staff');
      fetchAccounts();
    } catch (error) {
      setError('An error occurred');
    }
  };

  const toggleAccountStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/accounts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, isActive: !currentStatus }),
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error updating account:', error);
    }
  };

  const deleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      const response = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
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
            <p className="text-sm text-gray-400">Administrator</p>
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
              href="/staff/analytics"
              className="block px-4 py-3 hover:bg-gray-800 rounded-lg"
            >
              Analytics
            </Link>
            <Link
              href="/staff/accounts"
              className="block px-4 py-3 bg-red-500 rounded-lg font-medium"
            >
              Account Management
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Top Bar */}
          <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Account Management</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              + Add Account
            </button>
          </div>

          {/* Accounts List */}
          <div className="p-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {accounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{account.username}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            account.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {account.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            account.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {account.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {account.created_by_username || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(account.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleAccountStatus(account.id, account.is_active)}
                            className="text-sm text-blue-500 hover:text-blue-700"
                            disabled={account.id === user?.id}
                          >
                            {account.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          {account.id !== user?.id && (
                            <button
                              onClick={() => deleteAccount(account.id)}
                              className="text-sm text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Add New Account</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleAddAccount}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'staff' | 'admin')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
