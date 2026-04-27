import { Badge } from "@/components/ui/badge";

type Severity = "critical" | "high" | "medium" | "low";

const tones: Record<Severity, "danger" | "warning" | "info" | "success"> = {
  critical: "danger",
  high: "warning",
  medium: "info",
  low: "success",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <Badge variant={tones[severity]} className="capitalize">{severity}</Badge>;
}
