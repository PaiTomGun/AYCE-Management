'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

interface SidebarProps {
  role?: 'staff' | 'admin';
}

export default function Sidebar({ role = 'staff' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    { href: '/staff/dashboard', label: 'Dashboard' },
    { href: '/staff/tables', label: 'Table Layout' },
  ];

  if (role === 'admin') {
    navItems.push({ href: '/staff/menu', label: 'Menu Management' });
    navItems.push({ href: '/staff/tiers', label: 'Tier Management' });
    navItems.push({ href: '/staff/analytics', label: 'Analytics' });
    navItems.push({ href: '/staff/accounts', label: 'Account Management' });
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/staff/login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">👤</span>
          </div>
          <div>
            <p className="text-sm text-gray-400">
              {role === 'admin' ? 'Administrator' : 'Staff Member'}
            </p>
          </div>
        </div>
      </div>

      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-4 py-3 rounded-lg transition-colors ${
              pathname === item.href
                ? 'bg-red-500 font-medium'
                : 'hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-left"
      >
        Logout
      </button>
    </div>
  );
}
