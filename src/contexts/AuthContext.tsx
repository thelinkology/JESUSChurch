import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserProfile, getUserProfile, logout as logoutApi } from '../lib/authStore';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isLeader: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef<UserProfile | null>(null);
  // Set to true in logout() so we know the SIGNED_OUT event is intentional
  const intentionalLogoutRef = useRef(false);

  // Keep ref in sync so event listeners can read current user without stale closure
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    let mounted = true;

    // ── Step 1: Authoritative initial session check ──────────────────────────
    // getSession() reads localStorage and silently refreshes the access token
    // if it's expired. This is the ONLY reliable way to get the true initial
    // state on page reload — onAuthStateChange fires INITIAL_SESSION with null
    // while the refresh is in-flight, which looks identical to "not logged in".
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        let profile: Awaited<ReturnType<typeof getUserProfile>> = null;
        try {
          profile = await getUserProfile(session.user.id);
        } catch { /* network error — use session fallback below */ }

        if (mounted) {
          // If the profile row doesn't exist yet (new user, DB race) or the
          // fetch failed, still mark the user as signed in using session data.
          // Never call setUser(null) when a valid session exists.
          setUser(profile ?? {
            id: session.user.id,
            email: session.user.email ?? '',
            full_name:
              (session.user.user_metadata?.full_name as string | undefined) ??
              session.user.email?.split('@')[0] ??
              'User',
            role: 'Member',
          });
        }
      }
      if (mounted) setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    // ── Step 2: Listen for subsequent auth events only ───────────────────────
    // INITIAL_SESSION is skipped — handled by getSession() above.
    // TOKEN_REFRESHED is skipped — user is still signed in, no state change needed.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION') return;
      if (event === 'TOKEN_REFRESHED') return;

      if (!session?.user) {
        // SIGNED_OUT — but autoRefreshToken can fire this spuriously on transient
        // network errors while the stored session is still valid. Double-check
        // before clearing the user so a brief connectivity blip doesn't log them out.
        supabase.auth.getSession().then(({ data: { session: current } }) => {
          if (!current?.user && mounted) {
            intentionalLogoutRef.current = false;
            setUser(null);
            setLoading(false);
          }
          // If session IS still valid, the SIGNED_OUT was spurious — ignore it.
        }).catch(() => { /* network error — don't clear user */ });
        return;
      }

      // SIGNED_IN or USER_UPDATED — load/refresh profile.
      // IMPORTANT: use functional setUser so we never overwrite an already-set
      // user with null. The getSession() call above may have already set the user
      // (race: both paths call getUserProfile in parallel on OAuth redirect).
      // If getUserProfile fails, fall back to session metadata — never log the
      // user out when their session is valid.
      const sessionFallback = {
        id: session.user.id,
        email: session.user.email ?? '',
        full_name:
          (session.user.user_metadata?.full_name as string | undefined) ??
          session.user.email?.split('@')[0] ??
          'User',
        role: 'Member' as const,
      };
      try {
        const profile = await getUserProfile(session.user.id);
        if (mounted) {
          // If profile is null (DB error / RLS), keep existing user or use fallback.
          setUser(prev => profile ?? prev ?? sessionFallback);
          setLoading(false);
        }
      } catch {
        // Network / timeout error — keep existing user or use fallback, never null.
        if (mounted) {
          setUser(prev => prev ?? sessionFallback);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Recover auth state when the tab becomes visible or network comes back online.
  // This handles tabs that were backgrounded/frozen (browser throttles JS timers,
  // so Supabase's own refresh timer may not have fired).
  //
  // IMPORTANT RULES:
  //  1. Use getSession() — it reads from localStorage and auto-refreshes only when
  //     the access token is expired. Never use refreshSession() here because it
  //     makes a forced network POST that can CLEAR the stored session on any failure.
  //  2. Never call setUser(null) in this handler. If the session truly expired,
  //     Supabase fires onAuthStateChange(SIGNED_OUT) which already owns that path.
  //  3. Only re-hydrate when the session is valid but React state is missing
  //     (e.g., the tab was suspended and state was GC'd on low-memory devices).
  useEffect(() => {
    const recoverSession = async () => {
      try {
        // getSession() reads the stored session and auto-refreshes the access
        // token if expired — safe, no forced network call when token is still valid.
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && !userRef.current) {
          // Valid session but React user state is gone — re-hydrate silently.
          getUserProfile(session.user.id)
            .then(profile => { if (profile) setUser(profile); })
            .catch(() => {});
        }
        // Do NOT setUser(null) here under any condition.
      } catch {
        // Network error or SDK error — leave state as-is and try again next time.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') recoverSession();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', recoverSession);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', recoverSession);
    };
  }, []);

  const logout = async () => {
    intentionalLogoutRef.current = true; // mark as intentional so SIGNED_OUT clears immediately
    await logoutApi();
    setUser(null);
  };

  const isAdmin = user?.role === 'Admin';
  const isLeader = user?.role === 'Leader' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, isAdmin, isLeader }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
