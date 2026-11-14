'use client';

// nested dashboard layout for customer accounts
// includes sidebar navigation, mobile tab bar, and user balance badge
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { formatRupees } from '@/lib/money';

const DASHBOARD_LINKS = [
  { href: '/dashboard', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/planner', label: 'Planner', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/dashboard/calendar', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: '/dashboard/pause', label: 'Pause Delivery', icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/dashboard/wallet', label: 'Wallet', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { href: '/dashboard/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar for tablet & desktop */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-20 space-y-4">
            {/* User Mini Profile */}
            <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
              <div>
                <p className="font-serif font-bold text-gray-900 text-sm">
                  {user?.name || 'Customer'}
                </p>
                <p className="text-xs text-gray-500">{user?.area || 'Punjab'}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase font-mono block">Balance</span>
                <span className="text-xs font-mono font-bold text-green-deep">
                  {formatRupees(user?.walletBalance ?? 0)}
                </span>
              </div>
            </div>

            {/* Nav list */}
            <nav className="space-y-1">
              {DASHBOARD_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-light text-green-deep font-semibold'
                        : 'text-gray-600 hover:bg-cream hover:text-gray-900'
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                    </svg>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-2 py-1.5 flex justify-around">
        {DASHBOARD_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1 px-2 rounded text-[10px] transition-colors ${
                isActive ? 'text-green-deep font-bold' : 'text-gray-500'
              }`}
            >
              <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
              </svg>
              <span>{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
