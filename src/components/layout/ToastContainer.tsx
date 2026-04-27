"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "@/store/useNotificationStore";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const colors = {
  info: { bg: "rgba(0,180,255,0.1)", border: "rgba(0,180,255,0.2)", text: "#00b4ff" },
  success: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)", text: "#34d399" },
  warning: { bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)", text: "#fbbf24" },
  error: { bg: "rgba(255,59,92,0.1)", border: "rgba(255,59,92,0.2)", text: "#ff3b5c" },
};

export function ToastContainer() {
  const { toasts, dismissToast } = useNotificationStore();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex max-w-sm flex-col gap-3" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          const color = colors[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="rounded-2xl p-4 backdrop-blur-xl shadow-[0_16px_48px_rgba(0,0,0,0.34)]"
              style={{ background: color.bg, border: `1px solid ${color.border}` }}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: color.text }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{toast.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{toast.message}</p>
                </div>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-muted-foreground transition-colors hover:text-white"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
