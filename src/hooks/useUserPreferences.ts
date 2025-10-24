import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserPreferences {
  id: string;
  user_id: string;
  currency: string;
  timezone: string;
  language: string;
  date_format: string;
  created_at: string;
  updated_at: string;
}

export function useUserPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ['user_preferences', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, ...updates }: { userId: string } & Partial<UserPreferences>) => {
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('user_preferences')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('user_preferences')
          .insert({ user_id: userId, ...updates })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user_preferences', data.user_id] });
      toast.success('Preferências atualizadas');
    },
    onError: () => {
      toast.error('Erro ao atualizar preferências');
    },
  });
}
