import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Loader2, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authService } from '../services/database';
import { useApp } from '../context/AppContext';

/**
 * Admin Login Page - Email/Password authentication for admins
 * Route: /admin
 */
export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, isLoading: appLoading } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect already signed-in admin users to admin dashboard
  if (!appLoading && user && user.is_admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If signed in but not admin, show access denied
  if (!appLoading && user && !user.is_admin) {
    return (
      <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-obsidian-100 mb-2">Access Denied</h1>
          <p className="text-obsidian-400 mb-6">
            You don't have admin privileges. Please sign in with an admin account.
          </p>
          <button
            onClick={async () => {
              await authService.signOut();
              window.location.reload();
            }}
            className="px-4 py-2 bg-obsidian-800 hover:bg-obsidian-700 text-obsidian-100 rounded-lg transition-colors"
          >
            Sign Out & Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Sign in with email/password
      const result = await authService.signIn(email, password);
      
      if (result?.user) {
        // Get or create user record
        const dbUser = await authService.getOrCreateAuthUser(result.user);
        
        if (dbUser?.is_admin) {
          // Redirect to admin dashboard
          navigate('/admin/dashboard');
        } else {
          setError('This account does not have admin privileges');
          await authService.signOut();
        }
      }
    } catch (err) {
      console.error('Admin sign-in failed:', err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email before signing in');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="block text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <defs>
                <linearGradient id="adminLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9a962" />
                  <stop offset="100%" stopColor="#d4b978" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="url(#adminLogoGold)" strokeWidth="1.5" />
              <path d="M10 18 Q16 10 22 18" stroke="url(#adminLogoGold)" strokeWidth="2" fill="none" />
              <circle cx="16" cy="12" r="2" fill="url(#adminLogoGold)" />
            </svg>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-obsidian-950" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-obsidian-100">Shift Ascent</h1>
          <p className="text-gold-500 text-sm mt-2 font-medium">Admin Portal</p>
        </Link>

        {/* Sign In Card */}
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6">
          <h2 className="text-lg font-medium text-obsidian-100 text-center mb-2">
            Admin Sign In
          </h2>
          <p className="text-obsidian-400 text-sm text-center mb-6">
            Enter your admin credentials
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-obsidian-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@shiftascent.com"
                className="w-full px-4 py-3 bg-obsidian-800 border border-obsidian-700 rounded-lg text-obsidian-100 placeholder-obsidian-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-obsidian-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-obsidian-800 border border-obsidian-700 rounded-lg text-obsidian-100 placeholder-obsidian-500 focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500 pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-400 hover:text-obsidian-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In as Admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to Site */}
        <p className="text-center mt-6 text-obsidian-500 text-sm">
          <Link to="/" className="text-gold-500 hover:text-gold-400 transition-colors">
            ← Back to Site
          </Link>
        </p>
      </div>
    </div>
  );
}
