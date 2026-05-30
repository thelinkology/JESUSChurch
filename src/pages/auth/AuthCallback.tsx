import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Handles the OAuth redirect from Supabase / Google.
 *
 * Supabase's _initialize() calls _saveSession() BEFORE firing the SIGNED_IN
 * event (via setTimeout). So by the time this component mounts and getSession()
 * resolves (after initializePromise), the session is reliably in localStorage.
 *
 * We intentionally do NOT register an onAuthStateChange listener here because
 * AuthContext already has one. Two competing SIGNED_IN handlers racing to call
 * getUserProfile() and then setUser() was the root cause of the logout-on-refresh bug.
 */
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }).catch(() => {
      navigate('/login', { replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-church-cream flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-church-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-church-earth-light font-medium">Signing you in…</p>
      </div>
    </div>
  );
}

