import { motion } from "framer-motion";
import { activities } from "@/lib/mock-data";

export function ActivityTimeline() {
  return (
    <div className="relative pl-5">
      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />
      <ul className="space-y-4">
        {activities.map((a, i) => (
          <motion.li
            key={a.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="relative"
          >
            <span className="absolute -left-[18px] top-1.5 h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
            <div className="text-xs">
              <span className="font-medium">{a.user}</span>{" "}
              <span className="text-muted-foreground">{a.action}</span>{" "}
              <span className="font-mono text-primary">{a.target}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{a.ts}</div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
