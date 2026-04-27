"use client";

import { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { CommandPalette } from "./CommandPalette";
import { NotificationsPanel } from "./NotificationsPanel";
import { ToastContainer } from "./ToastContainer";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { sidebarCollapsed } = useAppStore();
  const sidebarWidth = sidebarCollapsed ? 88 : 272;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div
        className="min-h-screen transition-[padding-left] duration-300 ease-out md:pl-[var(--sidebar-offset)]"
        style={{ ["--sidebar-offset" as string]: `${sidebarWidth}px` }}
      >
        <TopBar />
        <main className="relative min-h-[calc(100vh-var(--topbar-height))]">
          <div className="pointer-events-none absolute inset-0 app-shell-grid opacity-60" />
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
      <NotificationsPanel />
      <ToastContainer />
    </div>
  );
}
