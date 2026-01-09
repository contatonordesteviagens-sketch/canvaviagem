import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  const checkSubscription = useCallback(async (accessToken: string, forceRefresh = false) => {
    const now = Date.now();
    const userId = session?.user?.id || null;

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
  }, [session?.user?.id]);

  const refreshSubscription = useCallback(async () => {
    if (session?.access_token) {
      // Force refresh bypasses cache
      await checkSubscription(session.access_token, true);
    }
  }, [session?.access_token, checkSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
            checkSubscription(currentSession.access_token);
          }, 100);
        } else if (!currentSession) {
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
        checkSubscription(existingSession.access_token);
      } else {
        setSubscription(prev => ({ ...prev, loading: false }));
      }
    });

    return () => authSubscription.unsubscribe();
  }, [checkSubscription]);

  // Auto-refresh subscription every 2 minutes (reduced frequency)
  useEffect(() => {
    if (!session?.access_token) return;

    const interval = setInterval(() => {
      checkSubscription(session.access_token);
    }, 120000); // 2 minutes instead of 1

    return () => clearInterval(interval);
  }, [session?.access_token, checkSubscription]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      subscription, 
      signOut, 
      refreshSubscription 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
