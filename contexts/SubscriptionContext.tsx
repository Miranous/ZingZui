import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { SubscriptionTier, getTierLimits, FeatureLimits } from '@/lib/subscription';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  limits: FeatureLimits;
  isLoading: boolean;
  refreshTier: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserTier = async () => {
    if (!user) {
      setTier('free');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      setTier((data?.subscription_tier as SubscriptionTier) || 'free');
    } catch (error) {
      console.error('Error fetching subscription tier:', error);
      setTier('free');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTier();
  }, [user]);

  const refreshTier = async () => {
    setIsLoading(true);
    await fetchUserTier();
  };

  const limits = getTierLimits(tier);

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        limits,
        isLoading,
        refreshTier,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
