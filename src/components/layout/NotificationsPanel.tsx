"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useNotificationStore } from "@/store/useNotificationStore";

const icons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

export function NotificationsPanel() {
  const { notificationsOpen, setNotificationsOpen } = useAppStore();
  const { notifications, markRead, markAllRead, unreadCount } = useNotificationStore();

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
            onClick={() => setNotificationsOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="glass-panel fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l border-border"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <div>
                <div className="text-sm font-semibold">Notifications</div>
                <div className="text-xs text-muted-foreground">{notifications.length} recent events</div>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount() > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary transition-colors hover:text-foreground"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-3">
              {notifications.map((notification, index) => {
                const Icon = icons[notification.type];
                return (
                  <motion.button
                    key={notification.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    onClick={() => markRead(notification.id)}
                    className="w-full rounded-2xl border border-border bg-secondary/45 p-3 text-left transition-colors hover:border-border-strong"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-card">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-medium">{notification.title}</div>
                          {!notification.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{notification.message}</div>
                        <div className="mt-1.5 text-[10px] text-muted-foreground">
                          {formatRelativeTime(notification.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
