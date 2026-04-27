import { useEffect } from "react";
import { Search, Bell, Command as CmdIcon, Menu, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useUIStore } from "@/store/ui";
import { Button } from "@/components/ui/button";

export function TopBar() {
  const { setCommandOpen, setNotificationsOpen, toggleSidebar } = useUIStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen]);

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border glass-strong">
      <div className="flex h-full items-center gap-4 px-4 md:px-6">
        <button
          onClick={toggleSidebar}
          className="md:hidden h-9 w-9 rounded-lg border border-border bg-surface flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative flex h-2 w-2"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </motion.span>
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            All systems operational
          </span>
        </div>

        {/* Search */}
        <button
          onClick={() => setCommandOpen(true)}
          className="ml-auto md:ml-6 group flex items-center gap-2 h-9 w-full max-w-md rounded-lg border border-border bg-surface px-3 text-sm text-muted-foreground hover:border-border-strong hover:text-foreground transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search assets, detections, regions…</span>
          <span className="sm:hidden">Search</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 rounded border border-border-strong bg-background/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <CmdIcon className="h-3 w-3" /> K
          </kbd>
        </button>

        <div className="ml-auto md:ml-0 flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationsOpen(true)}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse-glow" />
          </Button>
          <Button
            size="sm"
            className="hidden sm:inline-flex bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-glow"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            New scan
          </Button>
        </div>
      </div>
    </header>
  );
}
