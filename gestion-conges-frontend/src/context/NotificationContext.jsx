import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const addNotification = (notification) => {
    if (notification) {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + (notification.is_read ? 0 : 1));
    }
  };

  const removeNotification = async (id) => {
    const current = notifications.find((notification) => notification.id === id);

    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    if (current && !current.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await api.delete(`/notifications/${id}`);
    } catch {
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true, read_at: new Date().toISOString() }
          : notification,
      ),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        is_read: true,
        read_at: notification.read_at || new Date().toISOString(),
      })),
    );
    setUnreadCount(0);

    try {
      await api.patch("/notifications/mark-all-read");
    } catch {
      fetchNotifications();
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        removeNotification,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }

  return context;
};
