"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FolderOpen,
  LayoutDashboard,
  Radar,
  Search,
  Shield,
  Upload,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/components/ui/input";

const commands = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", category: "Navigate" },
  { id: "upload", label: "Upload assets", icon: Upload, href: "/upload", category: "Navigate" },
  { id: "detections", label: "Detection monitor", icon: Radar, href: "/detections", category: "Navigate" },
  { id: "assets", label: "Asset library", icon: FolderOpen, href: "/assets", category: "Navigate" },
  { id: "operations", label: "Protection center", icon: Shield, href: "/operations", category: "Navigate" },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const filtered = commands.filter((command) =>
    command.label.toLowerCase().includes(query.toLowerCase())
  );

  const execute = useCallback((command: (typeof commands)[0]) => {
    setCommandPaletteOpen(false);
    setQuery("");
    router.push(command.href);
  }, [router, setCommandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCommandPaletteOpen(false);
        setQuery("");
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((value) => Math.min(value + 1, filtered.length - 1));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((value) => Math.max(value - 1, 0));
      }
      if (event.key === "Enter" && filtered[selectedIndex]) {
        execute(filtered[selectedIndex]);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [commandPaletteOpen, execute, filtered, selectedIndex, setCommandPaletteOpen]);

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setCommandPaletteOpen(false);
              setQuery("");
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-[14%] z-50 w-full max-w-2xl -translate-x-1/2 px-3"
          >
            <div className="overflow-hidden rounded-[1.5rem] border border-border bg-popover shadow-[0_28px_82px_rgba(0,0,0,0.55)]">
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Type a command or search..."
                  className="h-auto flex-1 border-0 bg-transparent px-0 py-0 shadow-none hover:border-transparent focus-visible:ring-0"
                />
                <button
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    setQuery("");
                  }}
                  className="text-muted-foreground transition-colors hover:text-white"
                  aria-label="Close command palette"
                >
                  Esc
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto py-2">
                {filtered.length === 0 ? (
                  <p className="px-5 py-6 text-center text-sm text-muted-foreground">No results found</p>
                ) : (
                  <>
                    <div className="px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">Navigate</div>
                    {filtered.map((command, index) => {
                      const Icon = command.icon;
                      return (
                        <button
                          key={command.id}
                          onClick={() => execute(command)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`mx-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                            index === selectedIndex
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-secondary/70"
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1 text-sm">{command.label}</span>
                          <span className={`text-[10px] ${index === selectedIndex ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {command.category}
                          </span>
                          {index === selectedIndex && <ArrowRight className="h-3 w-3" />}
                        </button>
                      );
                    })}
                    <div className="mt-3 border-t border-border px-5 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                      Actions
                    </div>
                    <button className="mx-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl px-4 py-3 text-left text-foreground hover:bg-secondary/70">
                      <Radar className="h-4 w-4" />
                      <span className="text-sm">Run live scan</span>
                    </button>
                    <button className="mx-3 flex w-[calc(100%-24px)] items-center gap-3 rounded-xl px-4 py-3 text-left text-foreground hover:bg-secondary/70">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Issue takedown</span>
                    </button>
                  </>
                )}
              </div>
              <div className="flex items-center gap-4 border-t border-border px-5 py-3 text-[10px] text-muted-foreground">
                <span><kbd className="rounded-lg border border-border bg-secondary px-1.5 py-0.5">Up/Down</kbd> Navigate</span>
                <span><kbd className="rounded-lg border border-border bg-secondary px-1.5 py-0.5">Enter</kbd> Select</span>
                <span><kbd className="rounded-lg border border-border bg-secondary px-1.5 py-0.5">Esc</kbd> Close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
