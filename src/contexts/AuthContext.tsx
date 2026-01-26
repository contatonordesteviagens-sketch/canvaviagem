import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

// Cache for subscription status to avoid rate limits
const CACHE_DURATION = 30000; // 30 seconds cache
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
      
      const dbIsAdmin = !!data;
      setIsAdmin(dbIsAdmin);
      
      if (dbIsAdmin) {
        console.log('[AuthContext] User has admin role in database');
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
    const userId = currentUser?.id || null;
    
    // Check admin status first (server-side verification via database query)
    const userIsAdmin = await checkAdminStatus(currentUser);
    
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
      setSubscription(prev => ({ ...prev, loading: true }));
      
      console.log('[AuthContext] Checking subscription status...');
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        const errorStatus = {
          subscribed: false,
          productId: null,
          subscriptionEnd: null,
          loading: false,
        };
        setSubscription(errorStatus);
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

      setSubscription(newStatus);
      console.log('[AuthContext] Subscription status updated:', newStatus);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({
        subscribed: false,
        productId: null,
        subscriptionEnd: null,
        loading: false,
      });
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
    // Prevent double initialization in StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('[AuthContext] Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Only check subscription on specific events, not every state change
        if (currentSession?.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setTimeout(() => {
            checkSubscription(currentSession.access_token, currentSession?.user ?? null);
          }, 100);
        } else if (!currentSession) {
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
      
      if (existingSession?.access_token) {
        checkSubscription(existingSession.access_token, existingSession?.user ?? null);
      } else {
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    });

    return () => authSubscription.unsubscribe();
  }, [checkSubscription]);

  // Auto-refresh subscription every 2 minutes (reduced frequency)
  useEffect(() => {
    if (!session?.access_token || !user) return;

    const interval = setInterval(() => {
      checkSubscription(session.access_token, user);
    }, 120000); // 2 minutes instead of 1

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
