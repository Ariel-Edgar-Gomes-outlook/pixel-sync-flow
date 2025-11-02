import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  daysRemaining: number;
}

export function useSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user?.id) {
        return {
          isActive: false,
          isExpired: true,
          subscriptionStartDate: null,
          subscriptionEndDate: null,
          daysRemaining: 0,
        };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_start_date, subscription_end_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!profile?.subscription_end_date) {
        // Sem data de fim = acesso completo
        return {
          isActive: true,
          isExpired: false,
          subscriptionStartDate: profile?.subscription_start_date || null,
          subscriptionEndDate: null,
          daysRemaining: -1, // -1 indica acesso ilimitado
        };
      }

      const now = new Date();
      const endDate = new Date(profile.subscription_end_date);
      const isActive = now <= endDate;
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        isActive,
        isExpired: !isActive,
        subscriptionStartDate: profile.subscription_start_date,
        subscriptionEndDate: profile.subscription_end_date,
        daysRemaining,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
