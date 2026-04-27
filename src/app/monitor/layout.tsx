import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function MonitorLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
