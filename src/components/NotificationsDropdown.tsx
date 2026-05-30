import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Megaphone, Calendar, BookOpen, Heart, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getNotifications,
  markAsRead as markRead,
  markAllAsRead as markAllRead,
  Notification,
} from '../lib/notificationsStore';

const TYPE_ICONS: Record<string, React.ElementType> = {
  event: Calendar,
  sermon: BookOpen,
  prayer: Heart,
  info: Info,
  general: Megaphone,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationsDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getNotifications(user?.id);
      setNotifications(data);
    } catch {
      // silently fail — notifications are non-critical
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Refresh every 2 minutes
  useEffect(() => {
    const interval = setInterval(load, 120000);
    return () => clearInterval(interval);
  }, [load]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await markRead(id, user.id).catch(() => {});
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await markAllRead(user.id, unreadIds).catch(() => {});
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-church-earth hover:text-church-gold transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-church-earth/10 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-church-earth/10 flex items-center justify-between bg-gradient-to-r from-church-gold/10 to-church-cream/30">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-church-gold" />
                  <h3 className="font-bold text-church-earth-dark text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-church-gold text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-church-gold hover:text-church-gold-dark font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-6 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-8 h-8 bg-church-cream rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-church-cream rounded w-2/3" />
                          <div className="h-2 bg-church-cream rounded w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <Bell className="w-8 h-8 text-church-earth/20 mx-auto mb-3" />
                    <p className="text-church-earth-light text-sm">All caught up!</p>
                    <p className="text-church-earth-light/60 text-xs mt-1">No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y divide-church-earth/5">
                    {notifications.map(notification => {
                      const Icon = TYPE_ICONS[notification.type] ?? Megaphone;
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 hover:bg-church-cream/40 transition-colors cursor-pointer ${!notification.is_read ? 'bg-church-gold/5' : ''}`}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <div className="flex gap-3 items-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notification.is_read ? 'bg-church-gold/20' : 'bg-church-cream'}`}>
                              <Icon className={`w-4 h-4 ${!notification.is_read ? 'text-church-gold' : 'text-church-earth-light'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className={`text-sm font-semibold leading-tight ${!notification.is_read ? 'text-church-earth-dark' : 'text-church-earth'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.is_read && (
                                  <span className="w-2 h-2 bg-church-gold rounded-full mt-1 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-church-earth-light mt-0.5 line-clamp-2 leading-relaxed">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] text-church-earth-light/60 uppercase tracking-wider">
                                  {timeAgo(notification.created_at)}
                                </span>
                                {notification.link && (
                                  <Link
                                    to={notification.link}
                                    onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                                    className="text-[10px] text-church-gold hover:underline font-medium"
                                  >
                                    View →
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {!user && (
                <div className="px-4 py-3 border-t border-church-earth/10 bg-church-cream/20 text-center">
                  <p className="text-xs text-church-earth-light">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-church-gold hover:underline">
                      Sign in
                    </Link>{' '}
                    to track your read notifications
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

