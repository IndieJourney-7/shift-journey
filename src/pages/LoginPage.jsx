import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authService } from '../services/database';

/**
 * Login Page - Google OAuth sign-in
 * Optional sign-in for cross-device sync
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.signInWithGoogle();
      // Redirect happens automatically via OAuth flow
    } catch (err) {
      console.error('Google sign-in failed:', err);
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleContinueAnonymously = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="block text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 32 32" className="w-full h-full">
              <defs>
                <linearGradient id="loginLogoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c9a962" />
                  <stop offset="100%" stopColor="#d4b978" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="#1a1a1a" stroke="url(#loginLogoGold)" strokeWidth="1.5" />
              <path d="M10 18 Q16 10 22 18" stroke="url(#loginLogoGold)" strokeWidth="2" fill="none" />
              <circle cx="16" cy="12" r="2" fill="url(#loginLogoGold)" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-obsidian-100">Shift Ascent</h1>
          <p className="text-obsidian-400 text-sm mt-2">Your word is your identity</p>
        </Link>

        {/* Sign In Card */}
        <div className="bg-obsidian-900 border border-obsidian-800 rounded-xl p-6">
          <h2 className="text-lg font-medium text-obsidian-100 text-center mb-2">
            Welcome
          </h2>
          <p className="text-obsidian-400 text-sm text-center mb-6">
            Sign in to sync your progress across devices
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-obsidian-700" />
            <span className="text-obsidian-500 text-xs">or</span>
            <div className="flex-1 h-px bg-obsidian-700" />
          </div>

          {/* Continue Without Signing In */}
          <button
            onClick={handleContinueAnonymously}
            className="w-full px-4 py-3 text-obsidian-300 hover:text-obsidian-100 border border-obsidian-700 hover:border-obsidian-600 rounded-lg transition-colors text-sm font-medium"
          >
            Continue without signing in
          </button>
        </div>

        {/* Benefits */}
        <div className="mt-6 space-y-3">
          <p className="text-obsidian-500 text-xs text-center">
            Why sign in?
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-obsidian-400">
              <span className="text-green-500">✓</span>
              <span>Sync across devices</span>
            </div>
            <div className="flex items-center gap-2 text-obsidian-400">
              <span className="text-green-500">✓</span>
              <span>Never lose progress</span>
            </div>
            <div className="flex items-center gap-2 text-obsidian-400">
              <span className="text-green-500">✓</span>
              <span>Backup your data</span>
            </div>
            <div className="flex items-center gap-2 text-obsidian-400">
              <span className="text-green-500">✓</span>
              <span>Secure & private</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-obsidian-600 text-xs text-center mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
