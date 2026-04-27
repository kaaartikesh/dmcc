"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Bell, Command as CommandIcon, Menu, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

const titles: Record<string, { section: string; title: string }> = {
  "/dashboard": { section: "Workspace", title: "Protection overview" },
  "/upload": { section: "Assets", title: "Protected intake" },
  "/detections": { section: "Detection", title: "Detection review" },
  "/assets": { section: "Library", title: "Asset inventory" },
  "/operations": { section: "Operations", title: "Protection operations" },
};

export function TopBar() {
  const pathname = usePathname();
  const {
    setCommandPaletteOpen,
    setNotificationsOpen,
    setMobileSidebarOpen,
  } = useAppStore();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandPaletteOpen]);

  const meta = useMemo(() => {
    if (!pathname) return titles["/dashboard"];
    if (pathname.startsWith("/assets/")) return { section: "Asset", title: "Asset intelligence" };
    return titles[pathname] ?? { section: "Workspace", title: "Digital Media Control Center" };
  }, [pathname]);

  return (
    <header className="glass-panel sticky top-0 z-30 border-b border-border">
      <div className="flex h-[var(--topbar-height)] items-center gap-3 px-4 md:px-6">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <div className="text-label">{meta.section}</div>
          <div className="truncate text-sm font-semibold text-foreground">{meta.title}</div>
        </div>

        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="ml-auto hidden h-11 min-w-[16rem] items-center gap-3 rounded-xl border border-border bg-surface/85 px-3.5 text-left text-sm text-muted-foreground transition-all duration-200 hover:border-border-strong hover:text-foreground lg:flex"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search assets, detections, or actions</span>
          <span className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
            <CommandIcon className="h-3 w-3" />
            K
          </span>
        </button>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <div className="hidden items-center gap-2 rounded-full border border-success/15 bg-success/10 px-3 py-2 text-xs text-success xl:flex">
            <span className="h-2 w-2 rounded-full bg-success" />
            Monitoring is live
          </div>

          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-muted-foreground transition-all duration-200 hover:border-border hover:bg-secondary hover:text-foreground"
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <Button size="sm" className="hidden sm:inline-flex">
            <Sparkles className="h-3.5 w-3.5" />
            Start scan
          </Button>
        </div>
      </div>
    </header>
  );
}
