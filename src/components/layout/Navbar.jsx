import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Settings, X } from 'lucide-react';
import { Button } from '../ui';

export default function Navbar({ isAuthenticated = false, user = null }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', href: '#features', isAnchor: true },
    { label: 'How It Works', href: '#how-it-works', isAnchor: true },
    { label: 'Pricing', href: '/pricing', isAnchor: false },
    { label: 'Log In', href: '/login', isAnchor: false },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian-950/80 backdrop-blur-md border-b border-obsidian-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 relative">
              <svg viewBox="0 0 32 32" className="w-full h-full">
                <defs>
                  <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c9a962" />
                    <stop offset="100%" stopColor="#d4b978" />
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="url(#logoGold)" strokeWidth="1.5" />
                <path d="M10 18 Q16 10 22 18" stroke="url(#logoGold)" strokeWidth="2" fill="none" />
                <circle cx="16" cy="12" r="2" fill="url(#logoGold)" />
              </svg>
            </div>
            <span className="text-obsidian-100 font-semibold text-base sm:text-lg tracking-tight">
              Shift Ascent
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) =>
                link.isAnchor ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-obsidian-400 hover:text-obsidian-200 text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-obsidian-400 hover:text-obsidian-200 text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          )}

          {/* CTA or User Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 text-obsidian-400 hover:text-obsidian-200 transition-colors">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="p-2 text-obsidian-400 hover:text-obsidian-200 transition-colors">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-obsidian-700 border border-obsidian-600 flex items-center justify-center">
                    <span className="text-obsidian-300 text-xs sm:text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="primary" size="md">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login" className="sm:hidden">
                  <Button variant="primary" size="sm">
                    Start
                  </Button>
                </Link>
                <button
                  className="md:hidden p-2 text-obsidian-400 hover:text-obsidian-200"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {!isAuthenticated && mobileMenuOpen && (
          <div className="md:hidden border-t border-obsidian-800 py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) =>
                link.isAnchor ? (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-obsidian-400 hover:text-obsidian-200 text-sm font-medium transition-colors px-2 py-2"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-obsidian-400 hover:text-obsidian-200 text-sm font-medium transition-colors px-2 py-2"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
