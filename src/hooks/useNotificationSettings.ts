import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NotificationSettings {
  id: string;
  user_id: string;
  job_reminders: boolean;
  lead_follow_up: boolean;
  payment_overdue: boolean;
  maintenance_reminder: boolean;
  new_lead: boolean;
  job_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useNotificationSettings(userId: string | undefined) {
  return useQuery({
    queryKey: ['notification_settings', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, ...updates }: { userId: string } & Partial<NotificationSettings>) => {
      const { data: existing } = await supabase
        .from('notification_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('notification_settings')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('notification_settings')
          .insert({ user_id: userId, ...updates })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notification_settings', data.user_id] });
      toast.success('Configurações de notificação atualizadas');
    },
    onError: () => {
      toast.error('Erro ao atualizar configurações');
    },
  });
}
