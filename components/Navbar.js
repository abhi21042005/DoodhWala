'use client';

// shared navigation header
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useState } from 'react';
import { labels } from '@/lib/i18n';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [lang, setLang] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = labels[lang];

  const toggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  const navLinks = [
    { href: '/plans', label: t.plans },
    { href: '/how-it-works', label: t.howItWorks },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-green-deep flex items-center justify-center text-cream font-serif font-bold text-lg">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg text-green-deep tracking-tight">
              {t.appName}
            </span>
            <span className="text-[10px] text-gray-500 hidden sm:block">
              Punjab Dairy Network
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href ? 'text-green-deep font-semibold' : 'text-gray-600 hover:text-green-deep'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="text-xs px-2.5 py-1 rounded-full border border-gray-300 bg-white hover:bg-cream-dark transition-colors font-medium text-gray-700"
            title="Toggle English / Hindi"
          >
            {t.language}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={isAdmin ? '/admin' : '/dashboard'}
                className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-green-deep text-white hover:bg-green-mid transition-colors"
              >
                {isAdmin ? t.admin : t.dashboard}
              </Link>
              <button
                onClick={logout}
                className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg bg-green-deep text-white hover:bg-green-mid transition-colors"
              >
                {t.register}
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-cream px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 hover:text-green-deep"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
