import { motion } from "framer-motion";
import type { ActivityItem } from "@/lib/frontend-data";

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <div className="text-sm text-muted-foreground">No recent activity yet.</div>;
  }

  return (
    <div className="relative pl-5">
      <div className="absolute bottom-2 left-1.5 top-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
      <ul className="space-y-4">
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className="relative"
          >
            <span className="absolute -left-[18px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
            <div className="text-xs">
              <span className="font-medium">{item.user}</span>{" "}
              <span className="text-muted-foreground">{item.action}</span>{" "}
              <span className="font-mono text-primary">{item.target}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-muted-foreground">{item.ts}</div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
