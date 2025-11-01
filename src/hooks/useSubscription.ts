import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SubscriptionStatus {
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
  isReadOnly: boolean;
}

export function useSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user?.id) {
        return {
          isActive: false,
          startDate: null,
          endDate: null,
          daysRemaining: 0,
          isReadOnly: true,
        };
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_start_date, subscription_end_date')
        .eq('user_id', user.id)
        .single();

      if (error || !profile) {
        return {
          isActive: false,
          startDate: null,
          endDate: null,
          daysRemaining: 0,
          isReadOnly: true,
        };
      }

      const now = new Date();
      const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
      const isActive = endDate ? now <= endDate : false;
      
      let daysRemaining = 0;
      if (endDate && isActive) {
        const diff = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      return {
        isActive,
        startDate: profile.subscription_start_date,
        endDate: profile.subscription_end_date,
        daysRemaining,
        isReadOnly: !isActive,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Atualiza a cada minuto
  });
}
