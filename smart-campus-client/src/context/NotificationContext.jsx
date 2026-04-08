import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (token === 'mock_token_123') {
        // Dev Mode Mock Data
        const mockData = [
          { id: 1, type: 'BOOKING_APPROVED', title: 'Auditorium Booking', message: 'Your booking for Main Auditorium was approved.', isRead: false, createdAt: new Date().toISOString() },
          { id: 2, type: 'TICKET_ASSIGNED', title: 'Maintenance Ticket', message: 'Ticket #404 was assigned to a technician.', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: 3, type: 'SYSTEM_ANNOUNCEMENT', title: 'System Maintenance', message: 'OASIS will be down from 2am to 4am.', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        ];
        setNotifications(mockData);
        setUnreadCount(2);
        return;
      }

      const [allRes, countRes] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);
      setNotifications(allRes.data);
      setUnreadCount(countRes.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Connect to WebSocket using STOMP
  useEffect(() => {
    if (!user) return;
    
    // First fetch current notifications
    fetchNotifications();

    let stompClient = null;
    let subscription = null;

    const connectWebSocket = async () => {
      // Import dynamically to avoid SSR issues or loading bugs
      const { Stomp } = await import('@stomp/stompjs');
      const SockJS = (await import('sockjs-client')).default;
      
      const token = localStorage.getItem('accessToken');
      if (!token || token === 'mock_token_123') return;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085';
      const socket = new SockJS(`${API_BASE_URL}/ws?token=${token}`);
      
      stompClient = Stomp.over(socket);
      
      // Disable debug logging in production
      stompClient.debug = () => {};

      stompClient.connect(
        { Authorization: `Bearer ${token}` }, // Headers
        () => {
          subscription = stompClient.subscribe('/user/queue/notifications', (message) => {
            if (message.body) {
              const newNotification = JSON.parse(message.body);
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          });
        },
        (error) => {
          console.error("STOMP connection error:", error);
          // Optional: Reconnection logic could go here
        }
      );
    };

    connectWebSocket();

    return () => {
      if (subscription) subscription.unsubscribe();
      if (stompClient) stompClient.disconnect();
    };
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      const target = notifications.find((n) => n.id === id);
      await notificationApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (target && !target.isRead) setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      fetchNotifications, markAsRead, markAllAsRead, deleteNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};
