import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '../services/database';

/**
 * Auth Callback Page - Handles OAuth redirect from Google
 * Links anonymous data to Google account and redirects to dashboard
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState(null);
  const handledRef = useRef(false); // Prevent duplicate handling

  useEffect(() => {
    let errorTimeout = null;

    const handleSuccess = async (user) => {
      if (handledRef.current) return;
      handledRef.current = true;

      try {
        // Link/create user in our users table
        await authService.getOrCreateAuthUser(user);
        setStatus('success');

        // Redirect to app after a brief delay
        setTimeout(() => {
          navigate('/app', { replace: true });
        }, 1000);
      } catch (err) {
        console.error('Auth callback error:', err);
        handledRef.current = false;
        setError(err.message || 'Failed to complete sign-in');
        setStatus('error');
      }
    };

    const handleCallback = async () => {
      try {
        // Get the session - authService.getSession() returns just the session object
        const session = await authService.getSession();

        if (session?.user) {
          await handleSuccess(session.user);
        }
        // If no session yet, the auth state change listener will handle it
      } catch (err) {
        console.error('Auth callback error:', err);
        // Delay error display to give auth state change listener a chance
        errorTimeout = setTimeout(() => {
          if (!handledRef.current) {
            setError(err.message || 'Authentication failed');
            setStatus('error');
          }
        }, 2000);
      }
    };

    handleCallback();

    // Listen for auth state changes - this is more reliable than getSession for OAuth callbacks
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Clear any pending error timeout
        if (errorTimeout) clearTimeout(errorTimeout);
        await handleSuccess(session.user);
      }
    });

    // Fallback timeout - if nothing happens after 10 seconds, show error
    const fallbackTimeout = setTimeout(() => {
      if (!handledRef.current && status === 'processing') {
        setError('Authentication timed out. Please try again.');
        setStatus('error');
      }
    }, 10000);

    return () => {
      subscription?.unsubscribe();
      if (errorTimeout) clearTimeout(errorTimeout);
      clearTimeout(fallbackTimeout);
    };
  }, [navigate, status]);

  const handleRetry = () => {
    navigate('/login', { replace: true });
  };

  const handleContinueAnonymously = () => {
    navigate('/app', { replace: true });
  };

  return (
    <div className="min-h-screen bg-obsidian-950 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        {/* Processing State */}
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-gold-500 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-medium text-obsidian-100 mb-2">
              Signing you in...
            </h1>
            <p className="text-obsidian-400 text-sm">
              Please wait while we complete the authentication.
            </p>
          </>
        )}

        {/* Success State */}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-medium text-obsidian-100 mb-2">
              Welcome!
            </h1>
            <p className="text-obsidian-400 text-sm">
              You're signed in. Redirecting to your dashboard...
            </p>
          </>
        )}

        {/* Error State */}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-medium text-obsidian-100 mb-2">
              Sign-in failed
            </h1>
            <p className="text-obsidian-400 text-sm mb-6">
              {error || 'Something went wrong during authentication.'}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full px-4 py-3 bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-medium rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleContinueAnonymously}
                className="w-full px-4 py-3 text-obsidian-300 hover:text-obsidian-100 border border-obsidian-700 hover:border-obsidian-600 rounded-lg transition-colors text-sm"
              >
                Continue without signing in
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
