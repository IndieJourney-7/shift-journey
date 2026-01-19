import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Bell, Settings } from 'lucide-react';
import { Button } from '../ui';

export default function Navbar({ isAuthenticated = false, user = null }) {
  const location = useLocation();

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Log In', href: '/login' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-obsidian-950/80 backdrop-blur-md border-b border-obsidian-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 relative">
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
            <span className="text-obsidian-100 font-semibold text-lg tracking-tight">
              Shift Journey
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-obsidian-400 hover:text-obsidian-200 text-sm font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* CTA or User Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button className="p-2 text-obsidian-400 hover:text-obsidian-200 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 text-obsidian-400 hover:text-obsidian-200 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-obsidian-700 border border-obsidian-600 flex items-center justify-center">
                    <span className="text-obsidian-300 text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="primary" size="md">
                    Get Started
                  </Button>
                </Link>
                <button className="md:hidden p-2 text-obsidian-400">
                  <Menu className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
