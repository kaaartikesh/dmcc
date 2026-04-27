"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRight,
  ChevronLeft,
  FileSearch,
  LayoutDashboard,
  Radar,
  Shield,
  Upload,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const navItems = [
  { id: "dashboard", label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: "upload", label: "Protected Intake", href: "/upload", icon: Upload },
  { id: "detections", label: "Detections", href: "/detections", icon: Radar },
  { id: "assets", label: "Asset Library", href: "/assets", icon: FileSearch },
  { id: "operations", label: "Operations", href: "/operations", icon: Shield },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    sidebarCollapsed,
    mobileSidebarOpen,
    toggleSidebar,
    setMobileSidebarOpen,
  } = useAppStore();

  const width = sidebarCollapsed ? 88 : 272;

  return (
    <>
      <motion.aside
        animate={{ width }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-sidebar-border md:flex"
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          pathname={pathname}
          onNavigate={() => undefined}
          onCollapse={toggleSidebar}
        />
      </motion.aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden"
              aria-label="Close navigation"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel fixed inset-y-0 left-0 z-50 flex w-[18rem] max-w-[85vw] border-r border-sidebar-border md:hidden"
            >
              <SidebarContent
                collapsed={false}
                pathname={pathname}
                onNavigate={() => setMobileSidebarOpen(false)}
                mobile
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({
  collapsed,
  pathname,
  onNavigate,
  onCollapse,
  mobile = false,
}: {
  collapsed: boolean;
  pathname: string | null;
  onNavigate: () => void;
  onCollapse?: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="flex h-[var(--topbar-height)] items-center justify-between border-b border-sidebar-border px-4">
        <div className={cn("flex min-w-0 items-center gap-3", collapsed && !mobile && "justify-center")}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground shadow-[0_10px_32px_rgba(77,172,247,0.24)]">
            <Shield className="h-5 w-5" />
          </div>
          {(!collapsed || mobile) && (
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold tracking-tight text-foreground">DMCC</div>
              <div className="truncate text-xs text-muted-foreground">Digital Media Control Center</div>
            </div>
          )}
        </div>

        {mobile ? (
          <button
            onClick={onNavigate}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={onCollapse}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronLeft className="h-4 w-4" />
            </motion.div>
          </button>
        )}
      </div>

      <div className="px-3 pt-4">
        <div className={cn("rounded-2xl border border-border bg-secondary/50 p-3", collapsed && !mobile && "px-2")}>
          <div className={cn("flex items-center gap-3", collapsed && !mobile && "justify-center")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-sm font-semibold text-foreground">DM</div>
            {(!collapsed || mobile) && (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">Rights Workspace</div>
                <div className="truncate text-xs text-muted-foreground">Threat detection and response</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className={cn("mb-3 px-3", collapsed && !mobile && "px-0 text-center")}>
          <div className="text-label">Workspace</div>
        </div>

        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = item.href === "/dashboard" ? pathname === item.href : pathname?.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all duration-200",
                    collapsed && !mobile && "justify-center px-2",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-foreground"
                  )}
                >
                  {isActive ? (
                    <motion.div
                      layoutId="active-sidebar-pill"
                      className="absolute inset-0 rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/12 to-transparent"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <Icon className={cn("relative h-[1.125rem] w-[1.125rem] shrink-0", isActive && "text-primary")} />
                  {(!collapsed || mobile) && <span className="relative flex-1 truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className={cn("rounded-2xl border border-border bg-secondary/50 p-3", collapsed && !mobile && "px-2")}>
          <div className={cn("flex items-center gap-3", collapsed && !mobile && "justify-center")}>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-card text-muted-foreground">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            {(!collapsed || mobile) && (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">Coverage Engine</div>
                <div className="truncate text-xs text-muted-foreground">Live sources synchronized</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
