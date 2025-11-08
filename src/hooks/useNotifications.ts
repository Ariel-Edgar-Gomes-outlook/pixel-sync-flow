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
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🔄 Marking notification as read:', notificationId);
      
      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user.id)
        .select();

      if (error) {
        console.error('❌ Error marking notification as read:', error);
        throw error;
      }
      
      console.log('✅ Notification marked as read:', data);
      return data;
    },
    onSuccess: (data, notificationId) => {
      console.log('✅ Mutation success, invalidating queries');
      
      // Remove from unread list immediately
      queryClient.setQueryData(['notifications', 'unread-list', user?.id], (old: any) => {
        if (!old) return old;
        return old.filter((n: any) => n.id !== notificationId);
      });

      // Update in all notifications list
      queryClient.setQueryData(['notifications', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((n: any) => 
          n.id === notificationId ? { ...n, read: true } : n
        );
      });

      // Update count
      queryClient.setQueryData(['notifications', 'unread', user?.id], (old: any) => {
        if (typeof old === 'number' && old > 0) {
          return old - 1;
        }
        return old;
      });
    },
    onError: (error) => {
      console.error('❌ Mutation error:', error);
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-list', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user?.id] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('🔄 Marking all notifications as read');

      const { data, error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false)
        .select();

      if (error) {
        console.error('❌ Error marking all notifications as read:', error);
        throw error;
      }

      console.log('✅ All notifications marked as read:', data);
      return data;
    },
    onSuccess: () => {
      console.log('✅ Mark all mutation success');
      
      // Clear unread list
      queryClient.setQueryData(['notifications', 'unread-list', user?.id], []);

      // Update all notifications to read
      queryClient.setQueryData(['notifications', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((n: any) => ({ ...n, read: true }));
      });

      // Set count to 0
      queryClient.setQueryData(['notifications', 'unread', user?.id], 0);
    },
    onError: (error) => {
      console.error('❌ Mark all mutation error:', error);
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-list', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user?.id] });
    },
  });
}