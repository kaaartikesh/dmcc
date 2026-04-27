import { cn } from "@/lib/utils";
import type { DetectionStatus } from "@/lib/mock-data";

const map: Record<DetectionStatus, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-destructive/15 text-destructive border-destructive/30" },
  investigating: { label: "Investigating", className: "bg-warning/15 text-warning border-warning/30" },
  resolved: { label: "Resolved", className: "bg-success/15 text-success border-success/30" },
  false_positive: { label: "False positive", className: "bg-muted text-muted-foreground border-border" },
};

export function StatusBadge({ status, className }: { status: DetectionStatus; className?: string }) {
  const cfg = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium",
        cfg.className,
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      {cfg.label}
    </span>
  );
}
