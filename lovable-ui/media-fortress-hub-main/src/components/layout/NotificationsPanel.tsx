import { AnimatePresence, motion } from "framer-motion";
import { X, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { useUIStore } from "@/store/ui";
import { alerts } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/common/SeverityBadge";

export function NotificationsPanel() {
  const { notificationsOpen, setNotificationsOpen } = useUIStore();

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
            className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-border bg-surface flex flex-col"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <div>
                <div className="text-sm font-semibold">Notifications</div>
                <div className="text-xs text-muted-foreground">{alerts.length} recent events</div>
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                className="h-8 w-8 rounded-md hover:bg-secondary flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {alerts.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-lg border border-border bg-card p-3 hover:border-border-strong transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-md bg-secondary flex items-center justify-center">
                      {a.severity === "critical" || a.severity === "high" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : a.severity === "low" ? (
                        <ShieldCheck className="h-4 w-4 text-success" />
                      ) : (
                        <Activity className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium truncate">{a.title}</div>
                        <SeverityBadge severity={a.severity} />
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{a.description}</div>
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{a.source}</span>
                        <span>•</span>
                        <span>{a.ts}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
