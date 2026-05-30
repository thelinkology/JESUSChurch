import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/**
 * Handles the OAuth redirect from Supabase / Google.
 * Supabase appends the session tokens as a hash fragment to this URL.
 * The Supabase client picks them up via detectSessionInUrl, then we redirect home.
 */
export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase automatically processes the hash tokens on client load.
    // Listen for the session to be established, then navigate home.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate('/', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    // Fallback: if already signed in or no event fires within 5 s, go home.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/', { replace: true });
    });

    return () => subscription.unsubscribe();
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
