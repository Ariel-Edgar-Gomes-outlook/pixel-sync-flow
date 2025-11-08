import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          // Invalidate queries when notifications change
          queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user.id] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-list', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

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
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('unread-notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          // Invalidate unread notifications query when notifications change
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-list', user.id] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

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
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onMutate: async (notificationId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot the previous value
      const previousNotifications = queryClient.getQueryData(['notifications', user?.id]);
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread', user?.id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['notifications', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((n: any) => 
          n.id === notificationId ? { ...n, read: true } : n
        );
      });

      queryClient.setQueryData(['notifications', 'unread', user?.id], (old: any) => {
        if (typeof old === 'number' && old > 0) {
          return old - 1;
        }
        return old;
      });

      // Return a context object with the snapshotted value
      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, notificationId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', user?.id], context.previousNotifications);
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread', user?.id], context.previousUnreadCount);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-list'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['notifications'] });

      // Snapshot the previous values
      const previousNotifications = queryClient.getQueryData(['notifications', user?.id]);
      const previousUnreadCount = queryClient.getQueryData(['notifications', 'unread', user?.id]);

      // Optimistically update all notifications to read
      queryClient.setQueryData(['notifications', user?.id], (old: any) => {
        if (!old) return old;
        return old.map((n: any) => ({ ...n, read: true }));
      });

      // Set unread count to 0
      queryClient.setQueryData(['notifications', 'unread', user?.id], 0);

      return { previousNotifications, previousUnreadCount };
    },
    onError: (err, variables, context) => {
      // Roll back on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['notifications', user?.id], context.previousNotifications);
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(['notifications', 'unread', user?.id], context.previousUnreadCount);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-list'] });
    },
  });
}