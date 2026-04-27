import { Badge } from "@/components/ui/badge";

const tones: Record<string, "danger" | "warning" | "info" | "success" | "neutral"> = {
  active: "danger",
  unauthorized: "danger",
  review: "warning",
  investigating: "info",
  resolved: "success",
  false_positive: "neutral",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return <Badge variant={tones[key] ?? "neutral"} className="capitalize">{status.replaceAll("_", " ")}</Badge>;
}
