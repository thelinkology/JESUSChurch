import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
    'Add them to your .env file. The app will fall back to local storage.'
  );
}

// Custom fetch with a hard 12-second timeout.
// Without this, Supabase's autoRefreshToken can queue ALL in-flight queries
// while it refreshes the JWT — if the refresh hangs (slow network after tab
// restore), every data query hangs forever and pages get stuck on the skeleton.
const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  return fetch(input, { ...init, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

// Authenticated client — used for writes and user-specific reads.
// autoRefreshToken is true, so this client queues requests while refreshing
// an expired session. Never use this for public reads that should work instantly.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseKey || 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    global: { fetch: fetchWithTimeout },
  }
);

// Public (anon) client — used for all public SELECT queries.
// No session, no token refresh, no request queuing — queries fire instantly
// whether the user is signed in or not. This solves the "data not loading"
// bug caused by the authenticated client queuing requests while refreshing
// an expired JWT in the background.
// storageKey uses a unique name so this client never reads the authenticated
// user's session from localStorage — it always runs as the anon role.
export const publicSupabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'public-anon-client',
    },
    global: { fetch: fetchWithTimeout },
  }
);

/** Sign in with Google (Gmail OAuth — must be enabled in Supabase Auth dashboard) */
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
