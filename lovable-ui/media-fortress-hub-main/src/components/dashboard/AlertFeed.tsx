import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { alerts } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/common/SeverityBadge";

export function AlertFeed() {
  return (
    <div className="space-y-2">
      {alerts.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ x: 2 }}
          className="group flex items-start gap-3 rounded-lg border border-transparent p-2.5 hover:border-border hover:bg-surface/60 cursor-pointer transition-colors"
        >
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
              <div className="text-xs font-medium truncate">{a.title}</div>
              <SeverityBadge severity={a.severity} />
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground truncate">{a.description}</div>
            <div className="mt-1 text-[10px] text-muted-foreground">
              {a.source} · {a.ts}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
