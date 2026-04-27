import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  Radar,
  FileSearch,
  Shield,
  Settings,
  ChevronLeft,
  Activity,
} from "lucide-react";
import { useUIStore } from "@/store/ui";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/detections", label: "Detection Monitor", icon: Radar, badge: 12 },
  { to: "/assets/AST-001", label: "Asset Detail", icon: FileSearch },
] as const;

const secondary = [
  { to: "/", label: "Protection", icon: Shield },
  { to: "/", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { location } = useRouterState();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative hidden md:flex h-screen sticky top-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground z-30"
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-4 border-b border-sidebar-border">
        <div className="relative h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
          <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <AnimatePresence initial={false}>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <div className="text-sm font-semibold tracking-tight">DMCC</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Control Center
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <SidebarSection
          label="Workspace"
          items={nav as unknown as NavItem[]}
          collapsed={sidebarCollapsed}
          pathname={location.pathname}
        />
        <SidebarSection
          label="Account"
          items={secondary as unknown as NavItem[]}
          collapsed={sidebarCollapsed}
          pathname={location.pathname}
        />
      </nav>

      {/* User */}
      <div className="border-t border-sidebar-border p-3">
        <div className={cn("flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-sidebar-accent transition-colors cursor-pointer", sidebarCollapsed && "justify-center")}>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
            SC
          </div>
          <AnimatePresence initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <div className="text-xs font-medium truncate">Sarah Chen</div>
                <div className="text-[10px] text-muted-foreground truncate">UEFA · Admin</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse handle */}
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-surface-elevated text-muted-foreground hover:text-foreground hover:border-border-strong flex items-center justify-center transition-all shadow-md"
      >
        <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </motion.div>
      </button>
    </motion.aside>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  exact?: boolean;
}

function SidebarSection({
  label,
  items,
  collapsed,
  pathname,
}: {
  label: string;
  items: NavItem[];
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <div>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
      <ul className="space-y-1">
        {items.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to) && item.to !== "/";
          const isHome = item.to === "/" && pathname === "/";
          const isActive = item.exact ? pathname === item.to : active || isHome;
          return (
            <li key={item.label}>
              <Link
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/60",
                  collapsed && "justify-center px-2"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-primary shadow-glow"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      className="flex-1 truncate"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge !== undefined && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
