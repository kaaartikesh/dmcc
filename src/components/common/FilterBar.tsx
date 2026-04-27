"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Filter, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─────────────────────── Types ─────────────────────── */

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

export type FilterBarProps = {
  /** Current search text */
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder?: string;

  /** Chip‑style filter group */
  filterLabel?: string;
  filterOptions: FilterOption[];
  activeFilter: string;
  onFilterChange: (value: string) => void;

  /** Additional controls (e.g. bulk actions) */
  trailing?: ReactNode;
  className?: string;
};

/* ─────────────────────── Component ─────────────────── */

export function FilterBar({
  query,
  onQueryChange,
  searchPlaceholder = "Search…",
  filterLabel = "Severity",
  filterOptions,
  activeFilter,
  onFilterChange,
  trailing,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* LEFT: search + filter chips */}
      <div className="flex flex-1 flex-wrap items-center gap-3">
        {/* Search input */}
        <div className="relative min-w-[16rem]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "h-9 w-full rounded-xl border border-border bg-secondary/50 pl-9 pr-9 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "outline-none ring-ring/40 transition-all duration-200",
              "focus:border-primary/30 focus:bg-secondary/70 focus:ring-2"
            )}
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Separator */}
        <div className="hidden h-5 w-px bg-border sm:block" />

        {/* Filter label */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          {filterLabel}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onFilterChange(option.value)}
                className={cn(
                  "relative rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200",
                  isActive
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border/60 bg-secondary/40 text-muted-foreground hover:border-border hover:bg-secondary/70 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="filter-active"
                    className="absolute inset-0 rounded-full border border-primary/25 bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {option.label}
                  {option.count !== undefined && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-white/5 text-muted-foreground"
                      )}
                    >
                      {option.count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: trailing actions */}
      {trailing && <div className="flex items-center gap-2">{trailing}</div>}
    </div>
  );
}
