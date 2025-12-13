'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/staff/dashboard');
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="flex gap-8 items-center max-w-6xl w-full">
        {/* Logo */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-8xl font-bold">
            <div className="flex flex-col items-center">
              <span className="bg-red-500 w-24 h-24 rounded-lg flex items-center justify-center mb-2">A</span>
              <span className="bg-yellow-400 w-24 h-24 rounded-lg flex items-center justify-center mb-2">Y</span>
              <span className="bg-blue-500 w-24 h-24 rounded-lg flex items-center justify-center mb-2">C</span>
              <span className="bg-red-500 w-24 h-24 rounded-lg flex items-center justify-center">E</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md">
            <h1 className="text-3xl font-bold mb-8 text-center">
              Login <span className="text-sm text-gray-500">FOR STAFF</span>
            </h1>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Username"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:bg-gray-300"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'Login'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              <p>Demo credentials:</p>
              <p>Staff: staff / staff123</p>
              <p>Admin: admin / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
