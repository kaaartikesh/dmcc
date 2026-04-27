import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function UploadLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
