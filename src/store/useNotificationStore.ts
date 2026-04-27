import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
}

interface NotificationState {
  notifications: Notification[];
  toasts: Notification[];
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismissToast: (id: string) => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    { id: "1", title: "New Detection", message: "Critical match found on YouTube — Manchester United FC", type: "error", timestamp: new Date(Date.now() - 300000), read: false },
    { id: "2", title: "Takedown Success", message: "Content removed from Instagram — FC Barcelona", type: "success", timestamp: new Date(Date.now() - 1800000), read: false },
    { id: "3", title: "Asset Uploaded", message: "New asset processed successfully", type: "info", timestamp: new Date(Date.now() - 3600000), read: true },
  ],
  toasts: [],
  addNotification: (n) => {
    const notification: Notification = {
      ...n,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
      read: false,
    };
    set((s) => ({
      notifications: [notification, ...s.notifications],
      toasts: [...s.toasts, notification],
    }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== notification.id) }));
    }, 5000);
  },
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
