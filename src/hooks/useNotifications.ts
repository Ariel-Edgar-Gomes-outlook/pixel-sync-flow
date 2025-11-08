import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  payload: any;
  read: boolean;
  delivered: boolean;
  sent_at: string;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });
}

export function useUnreadNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'unread-list', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });
}

export function useUnreadNotificationsCount() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'unread', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      console.log('🔥 MUTATION FUNCTION STARTED:', notificationId);
      
      if (!user?.id) {
        console.error('🔥 NO USER ID');
        throw new Error('User not authenticated');
      }

      console.log('🔥 USER ID:', user.id);
      console.log('🔥 NOTIFICATION ID:', notificationId);
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select();

      console.log('🔥 SUPABASE RESPONSE:', { data, error });

      if (error) {
        console.error('🔥 SUPABASE ERROR:', error);
        throw error;
      }
      
      console.log('🔥 SUCCESS, DATA:', data);
      return data;
    },
    onSuccess: () => {
      console.log('🔥 ON SUCCESS CALLBACK');
      // Simplesmente invalidar tudo
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('🔥 ON ERROR CALLBACK:', error);
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      console.log('🔥 MARK ALL MUTATION STARTED');
      
      if (!user?.id) {
        console.error('🔥 NO USER ID FOR MARK ALL');
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false)
        .select();

      console.log('🔥 MARK ALL RESPONSE:', { data, error });

      if (error) {
        console.error('🔥 MARK ALL ERROR:', error);
        throw error;
      }

      console.log('🔥 MARK ALL SUCCESS:', data);
      return data;
    },
    onSuccess: () => {
      console.log('🔥 MARK ALL ON SUCCESS');
      // Simplesmente invalidar tudo
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('🔥 MARK ALL ON ERROR:', error);
    },
  });
}