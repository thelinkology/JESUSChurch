import { supabase } from './supabase';

export type NotificationType = 'info' | 'event' | 'sermon' | 'prayer' | 'general';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  is_broadcast: boolean;
  target_user_id?: string;
  created_at: string;
  is_read?: boolean; // computed client-side from notification_reads
}

export const getNotifications = async (userId?: string): Promise<Notification[]> => {
  // Fetch broadcast notifications
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  if (!notifications || notifications.length === 0) return [];

  if (!userId) {
    return notifications.map(n => ({ ...n, is_read: false }));
  }

  // Fetch which ones the user has read
  const notifIds = notifications.map(n => n.id);
  const { data: reads } = await supabase
    .from('notification_reads')
    .select('notification_id')
    .eq('user_id', userId)
    .in('notification_id', notifIds);

  const readSet = new Set((reads ?? []).map(r => r.notification_id));

  return notifications.map(n => ({
    ...n,
    is_read: readSet.has(n.id),
  }));
};

export const markAsRead = async (notificationId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('notification_reads')
    .upsert({ notification_id: notificationId, user_id: userId }, { onConflict: 'notification_id,user_id' });
  if (error) throw error;
};

export const markAllAsRead = async (userId: string, notificationIds: string[]): Promise<void> => {
  if (notificationIds.length === 0) return;
  const rows = notificationIds.map(id => ({ notification_id: id, user_id: userId }));
  const { error } = await supabase
    .from('notification_reads')
    .upsert(rows, { onConflict: 'notification_id,user_id' });
  if (error) throw error;
};

export const createNotification = async (
  notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>
): Promise<Notification> => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single();
  if (error) throw error;
  return { ...data, is_read: false };
};

export const deleteNotification = async (id: string): Promise<void> => {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) throw error;
};
