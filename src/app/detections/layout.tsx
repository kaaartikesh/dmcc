import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function DetectionsLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
