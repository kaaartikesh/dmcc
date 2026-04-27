import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/mock-data";

const map: Record<Severity, { label: string; className: string }> = {
  critical: { label: "Critical", className: "bg-destructive/15 text-destructive border-destructive/30" },
  high: { label: "High", className: "bg-warning/15 text-warning border-warning/30" },
  medium: { label: "Medium", className: "bg-primary/15 text-primary border-primary/30" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-border" },
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  const cfg = map[severity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        cfg.className,
        className
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
