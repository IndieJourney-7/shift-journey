import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Lock,
  Target,
  Compass,
  History,
  HelpCircle,
  Settings,
  LogOut,
  AlertCircle,
  CheckSquare,
  Calendar,
  User,
  Plus,
  ListChecks,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Sidebar() {
  const { currentGoal, canCreateNewGoal, logout } = useApp();
  const navigate = useNavigate();

  const mainLinks = [
    {
      icon: Lock,
      label: currentGoal?.title || 'My Goal',
      href: '/dashboard',
      highlight: true,
    },
    {
      icon: AlertCircle,
      label: 'Promises Broken',
      href: '/history?filter=broken',
    },
    {
      icon: CheckSquare,
      label: 'Sealed',
      href: '/history?filter=completed',
    },
  ];

  const navLinks = [
    { icon: Compass, label: 'My Journey', href: '/dashboard' },
    { icon: ListChecks, label: 'Milestones', href: '/milestones' },
    { icon: Calendar, label: 'Calendar', href: '/calendar' },
    { icon: History, label: 'History', href: '/history' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClasses = ({ isActive }) => `
    flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
    ${isActive
      ? 'bg-obsidian-700/50 text-obsidian-100 border-l-2 border-gold-500'
      : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-800/50'
    }
  `;

  return (
    <aside className="w-64 h-screen bg-obsidian-900 border-r border-obsidian-800 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-4 border-b border-obsidian-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <defs>
                <linearGradient id="sidebarLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9a962" />
                  <stop offset="100%" stopColor="#d4b978" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="url(#sidebarLogoGold)" strokeWidth="1.5" />
              <path d="M10 18 Q16 10 22 18" stroke="url(#sidebarLogoGold)" strokeWidth="2" fill="none" />
              <circle cx="16" cy="12" r="2" fill="url(#sidebarLogoGold)" />
            </svg>
          </div>
          <span className="text-obsidian-100 font-semibold text-lg">Shift Journey</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Goal Section */}
        <div className="px-3 mb-4">
          {mainLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all mb-1
                ${link.highlight
                  ? 'bg-obsidian-800 border border-obsidian-600 text-obsidian-100'
                  : isActive
                    ? 'bg-obsidian-700/50 text-obsidian-100'
                    : 'text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-800/50'
                }
              `}
            >
              <link.icon className={`w-4 h-4 ${link.highlight ? 'text-gold-500' : ''}`} />
              <span className="truncate">{link.label}</span>
              {link.highlight && (
                <span className="ml-auto text-gold-500 text-xs">★</span>
              )}
            </NavLink>
          ))}

          {/* New Goal Button - only show when allowed */}
          {canCreateNewGoal && (
            <NavLink
              to="/goal/create"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-obsidian-500 hover:text-obsidian-300 hover:bg-obsidian-800/30"
            >
              <Plus className="w-4 h-4" />
              <span>New Goal</span>
            </NavLink>
          )}
        </div>

        <div className="border-t border-obsidian-800 mx-3 mb-4" />

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {navLinks.map((link) => (
            <NavLink key={link.label} to={link.href} className={linkClasses}>
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-obsidian-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-obsidian-400 hover:text-obsidian-200 hover:bg-obsidian-800/50 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
