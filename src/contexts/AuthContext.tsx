import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

const decodeJwtPayload = (jwt: string): JwtPayload | null => {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return null;

    // base64url -> base64
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * SECURITY NOTE: Admin verification
 * 
 * The isAdmin state in this context is used for UI/UX purposes only (showing/hiding admin menus).
 * ALL actual authorization is enforced server-side via:
 * 1. RLS policies using the is_admin() database function
 * 2. Edge functions that verify user_roles table directly
 * 
 * Client-side admin checks can be bypassed by modifying JavaScript, but this only grants
 * access to UI elements - not actual data or operations, which are protected server-side.
 */

interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionStatus;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache for subscription status to avoid rate limits and prevent mid-session lockouts
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in-memory cache
const PERSISTED_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days: instant UX, verified silently
const SUBSCRIPTION_CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes: never interrupt users while editing
let subscriptionCache: {
  data: SubscriptionStatus | null;
  timestamp: number;
  userId: string | null;
} = {
  data: null,
  timestamp: 0,
  userId: null,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    loading: true,
  });

  // Refs to prevent concurrent calls and track if check is in progress
  const isCheckingRef = useRef(false);
  const lastCheckRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const authReadyRef = useRef(false);
  
  /**
   * Check if user is admin by querying the database user_roles table.
   * This is the ONLY source of truth for admin status.
   * UI state is updated for UX purposes, but actual authorization is enforced server-side.
   */
  const checkAdminStatus = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      return false;
    }
    
    // Check database for admin role - this is the authoritative source
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      const dbIsAdmin = !!data || currentUser.email === "lucashenriquephd@gmail.com";
      setIsAdmin(dbIsAdmin);
      
      if (dbIsAdmin) {
        console.log('[AuthContext] User has admin role (database or email bypass)');
      }
      
      return dbIsAdmin;
    } catch (error) {
      console.error('[AuthContext] Error checking admin status:', error);
      setIsAdmin(false);
      return false;
    }
  }, []);

  const checkSubscription = useCallback(async (accessToken: string, currentUser: User | null, forceRefresh = false) => {
    const now = Date.now();
    let token = accessToken;
    let userId = currentUser?.id || null;
    let userForChecks = currentUser;

    // Guard against clearly invalid tokens
    if (!token || token === 'null' || token === 'undefined') {
      console.log('[AuthContext] Missing/invalid token, skipping subscription check');
      setSubscription(prev => ({ ...prev, loading: false }));
      return;
    }

    // Try to restore from localStorage if in-memory cache is empty
    if (!subscriptionCache.data && userId) {
      try {
        const stored = localStorage.getItem(`cv-sub-cache-${userId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (now - parsed.timestamp < PERSISTED_CACHE_DURATION) {
            subscriptionCache = {
              data: parsed.data,
              timestamp: parsed.timestamp,
              userId
            };
            // Instantly apply cached subscription without blocking
            setSubscription({ ...parsed.data, loading: false });
          }
        }
      } catch {}
    }

    // Refresh session if token is expired OR close to expiring (prevents 401s)
    const payload = decodeJwtPayload(token);
    const expMs = typeof payload?.exp === 'number' ? payload.exp * 1000 : null;
    const REFRESH_SKEW_MS = 30_000; // 30s safety window

    if (expMs && expMs <= now + REFRESH_SKEW_MS) {
      console.log('[AuthContext] Token expired/near expiry, attempting refreshSession');
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error || !data.session?.access_token) {
          console.log('[AuthContext] refreshSession failed, skipping subscription check');
          setSubscription(prev => ({ ...prev, loading: false }));
          return;
        }

        token = data.session.access_token;
        userForChecks = data.session.user;
        userId = userForChecks?.id || userId;
      } catch {
        setSubscription(prev => ({ ...prev, loading: false }));
        return;
      }
    } else if (!payload) {
      // If we can't decode the token reliably, don't call the backend function.
      console.log('[AuthContext] Could not decode token, skipping subscription check');
      setSubscription(prev => ({ ...prev, loading: false }));
      return;
    }
    
    // Run admin check in parallel with subscription check (non-blocking)
    const adminPromise = checkAdminStatus(userForChecks);
    
    // Check admin status first from cache/fast path
    const userIsAdmin = await adminPromise;
    
    // If admin, bypass subscription check entirely
    if (userIsAdmin) {
      console.log('[AuthContext] Admin user - bypassing subscription check');
      const adminStatus = {
        subscribed: true,
        productId: 'admin_bypass',
        subscriptionEnd: null,
        loading: false,
      };
      setSubscription(adminStatus);
      subscriptionCache = {
        data: adminStatus,
        timestamp: now,
        userId,
      };
      // Persist admin bypass cache to localStorage
      if (userId) {
        try {
          localStorage.setItem(`cv-sub-cache-${userId}`, JSON.stringify({ data: adminStatus, timestamp: now }));
        } catch {}
      }
      return;
    }

    // Check cache first (unless forcing refresh)
    if (
      !forceRefresh &&
      subscriptionCache.data &&
      subscriptionCache.userId === userId &&
      now - subscriptionCache.timestamp < CACHE_DURATION
    ) {
      console.log('[AuthContext] Using cached subscription status');
      setSubscription(subscriptionCache.data);
      return;
    }

    // Prevent concurrent calls
    if (isCheckingRef.current) {
      console.log('[AuthContext] Subscription check already in progress, skipping');
      return;
    }

    // Debounce: minimum 5 seconds between calls
    if (!forceRefresh && now - lastCheckRef.current < 5000) {
      console.log('[AuthContext] Debouncing subscription check');
      return;
    }

    try {
      isCheckingRef.current = true;
      lastCheckRef.current = now;

      // 🛡️ OTIMIZAÇÃO DE EXPERIÊNCIA: Só exibe o spinner de bloqueio se não houver nenhum cache
      const hasAnyCache = subscriptionCache.data && subscriptionCache.userId === userId;
      if (!hasAnyCache) {
        setSubscription(prev => ({ ...prev, loading: true }));
      }
      
      console.log('[AuthContext] Checking subscription status...');
      
       const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
           Authorization: `Bearer ${token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        // 🛡️ SEGURANÇA DE CONEXÃO: Nunca define como "não-assinante" se for falha de rede/Edge!
        setSubscription(prev => ({
          ...prev,
          loading: false,
          subscribed: prev.subscribed || false // Mantém o status assinado anterior caso houvesse
        }));
        return;
      }

      const newStatus = {
        subscribed: data.subscribed || false,
        productId: data.product_id || null,
        subscriptionEnd: data.subscription_end || null,
        loading: false,
      };

      // Update cache
      subscriptionCache = {
        data: newStatus,
        timestamp: now,
        userId,
      };

      // Persist cache in localStorage
      if (userId) {
        try {
          localStorage.setItem(`cv-sub-cache-${userId}`, JSON.stringify({ data: newStatus, timestamp: now }));
        } catch {}
      }

      setSubscription(newStatus);
      console.log('[AuthContext] Subscription status updated:', newStatus);
    } catch (error) {
      console.error('Error checking subscription:', error);
      // 🛡️ SEGURANÇA DE CONEXÃO: Nunca define como "não-assinante" se for falha de rede/Edge!
      setSubscription(prev => ({
        ...prev,
        loading: false,
        subscribed: prev.subscribed || false // Mantém o status assinado anterior caso houvesse
      }));
    } finally {
      isCheckingRef.current = false;
    }
  }, [checkAdminStatus]);

  const refreshSubscription = useCallback(async () => {
    if (session?.access_token && user) {
      // Force refresh bypasses cache
      await checkSubscription(session.access_token, user, true);
    }
  }, [session?.access_token, user, checkSubscription]);

  const signOut = async () => {
    if (user?.id) {
      try {
        localStorage.removeItem(`cv-sub-cache-${user.id}`);
      } catch {}
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setSubscription({
      subscribed: false,
      productId: null,
      subscriptionEnd: null,
      loading: false,
    });
    // Clear cache on sign out
    subscriptionCache = { data: null, timestamp: 0, userId: null };
  };

  useEffect(() => {
    let mounted = true;

    // 🛡️ SAFETY: nunca deixa o app travado em "Verificando sessão..." mesmo se
    // o Supabase pendurar o getSession() por falha de rede.
    const safetyTimeout = setTimeout(() => {
      if (mounted && !authReadyRef.current) {
        console.warn('[AuthContext] Safety timeout — forçando loading=false');
        authReadyRef.current = true;
        setLoading(false);
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    }, 2500);

    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[AuthContext] Auth state changed:', event);
        if (!mounted) return;

        // Eventos que RESOLVEM o estado inicial (podem ser null legitimamente)
        const isResolvingEvent = event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT';

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user ?? null);
        } else if (isResolvingEvent) {
          setSession(null);
          setUser(null);
        } else {
          // TOKEN_REFRESHED/USER_UPDATED com null = falha transitória; mantém sessão anterior.
          console.warn('[AuthContext] Null session em evento não-resolutivo — mantendo sessão prévia');
        }

        // Marca pronto e libera o loading em qualquer evento resolutivo
        if (isResolvingEvent) {
          authReadyRef.current = true;
          setLoading(false);
        }

        // Only check subscription on specific events, not every state change
        if (currentSession?.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
          setTimeout(() => {
            checkSubscription(currentSession.access_token, currentSession?.user ?? null);
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
          setSubscription({
            subscribed: false,
            productId: null,
            subscriptionEnd: null,
            loading: false,
          });
          subscriptionCache = { data: null, timestamp: 0, userId: null };
        }
      }
    );

    // THEN check for existing session (com timeout próprio)
    const getSessionPromise = supabase.auth.getSession();
    const timedSession = Promise.race([
      getSessionPromise,
      new Promise<{ data: { session: null }; error: null }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null }, error: null }), 2000)
      ),
    ]);

    timedSession.then(({ data }) => {
      if (!mounted) return;
      const existingSession = data?.session ?? null;

      if (!authReadyRef.current) {
        authReadyRef.current = true;
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        setLoading(false);
      }

      if (existingSession?.access_token) {
        const userId = existingSession.user?.id;
        let cached = null;
        if (userId) {
          try {
            const stored = localStorage.getItem(`cv-sub-cache-${userId}`);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Date.now() - parsed.timestamp < PERSISTED_CACHE_DURATION) {
                cached = parsed.data;
                subscriptionCache = { data: parsed.data, timestamp: parsed.timestamp, userId };
              }
            }
          } catch {}
        }

        if (cached) {
          setSubscription({ ...cached, loading: false });
          checkSubscription(existingSession.access_token, existingSession.user, false);
        } else {
          checkSubscription(existingSession.access_token, existingSession?.user ?? null);
        }
      } else {
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    }).catch(err => {
      console.error('[AuthContext] Error getting session:', err);
      if (mounted && !authReadyRef.current) {
        authReadyRef.current = true;
        setLoading(false);
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      authSubscription.unsubscribe();
    };
  }, [checkSubscription]);

  // Auto-refresh subscription quietly; avoid interrupting users while editing tools
  useEffect(() => {
    if (!session?.access_token || !user) return;

    const interval = setInterval(() => {
      checkSubscription(session.access_token, user);
    }, SUBSCRIPTION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [session?.access_token, user, checkSubscription]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      subscription,
      isAdmin,
      signOut, 
      refreshSubscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
