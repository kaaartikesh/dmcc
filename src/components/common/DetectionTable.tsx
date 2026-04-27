"use client";

import type { ReactNode } from "react";
import { Fragment, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreatBadge, ThreatScorePill, SimilarityBadge } from "@/components/common/ThreatBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { StatusBadge } from "@/components/common/StatusBadge";

/* ─────────────────── Types ─────────────────── */

export type DetectionTableRow = {
  id: string;
  /** Preview image thumbnail URL */
  previewUrl?: string;
  /** Asset name */
  assetName: string;
  /** Platform where detected */
  platform: string;
  /** Similarity score 0-100 */
  similarityScore: number;
  /** Threat score 0-100 */
  threatScore: number;
  /** Raw threat level for badge coloring */
  threatLevel: "high" | "medium" | "low";
  /** Display status */
  status: string;
  /** When detection occurred */
  detectedAt: string;
  /** Formatted time display */
  timeAgo: string;

  /** Expandable details */
  explanation: string[];
  matchingLabels: string[];
  metadata: Record<string, string | number>;

  /** Source link */
  sourceUrl: string;
  sourceTitle: string;
};

export type SortKey =
  | "assetName"
  | "platform"
  | "similarityScore"
  | "threatScore"
  | "status"
  | "detectedAt";

export type SortConfig = {
  key: SortKey;
  dir: "asc" | "desc";
};

export type DetectionTableProps = {
  rows: DetectionTableRow[];
  sortConfig: SortConfig;
  onSort: (key: SortKey) => void;
  /** Additional actions rendered in the expanded row */
  renderActions?: (row: DetectionTableRow) => ReactNode;
  className?: string;
};

/* ─────────────── Column Header ─────────────── */

function ColumnHeader({
  children,
  sortKey,
  currentSort,
  onSort,
  align = "left",
}: {
  children: ReactNode;
  sortKey?: SortKey;
  currentSort: SortConfig;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const isActive = sortKey && currentSort.key === sortKey;

  const SortIcon = isActive
    ? currentSort.dir === "asc"
      ? ArrowUp
      : ArrowDown
    : ArrowUpDown;

  return (
    <th
      className={cn(
        "px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
        align === "right" && "text-right"
      )}
    >
      {sortKey ? (
        <button
          onClick={() => onSort(sortKey)}
          className={cn(
            "group inline-flex items-center gap-1.5 transition-colors hover:text-foreground",
            isActive && "text-foreground"
          )}
        >
          {children}
          <SortIcon
            className={cn(
              "h-3 w-3 transition-all",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

/* ─────────────── Preview Thumbnail ─────────── */

function PreviewThumbnail({ url, alt }: { url?: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-secondary/50">
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border bg-secondary/50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        onError={() => setHasError(true)}
        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
        loading="lazy"
      />
    </div>
  );
}

/* ─────────────── Expanded Detail ─────────────── */

function ExpandedRow({ row, renderActions }: { row: DetectionTableRow; renderActions?: (row: DetectionTableRow) => ReactNode }) {
  return (
    <tr className="border-t border-border/50">
      <td colSpan={8} className="px-0">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <div className="bg-gradient-to-b from-secondary/20 to-transparent px-6 py-5">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Match Explanation */}
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  Why it matched
                </h4>
                <ul className="space-y-2">
                  {row.explanation.map((reason, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm leading-relaxed text-foreground/90"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      {reason}
                    </li>
                  ))}
                </ul>
                {row.matchingLabels.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {row.matchingLabels.map((label) => (
                      <span
                        key={label}
                        className="rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-accent" />
                  Metadata
                </h4>
                <dl className="space-y-2.5">
                  {Object.entries(row.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4">
                      <dt className="text-xs text-muted-foreground">{key}</dt>
                      <dd className="text-right text-sm font-medium tabular-nums text-foreground">
                        {typeof value === "number" ? value.toLocaleString() : value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Source & Actions */}
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <h4 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-warning" />
                  Source
                </h4>
                <a
                  href={row.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  {row.sourceTitle || "View source"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                {renderActions && (
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                    {renderActions(row)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </td>
    </tr>
  );
}

/* ─────────────── Main Table ─────────────────── */

export function DetectionTable({
  rows,
  sortConfig,
  onSort,
  renderActions,
  className,
}: DetectionTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1020px] text-sm">
          {/* ──── Sticky Header ──── */}
          <thead className="sticky top-0 z-10 border-b border-border bg-[rgba(10,17,27,0.95)] backdrop-blur-md">
            <tr>
              <th className="w-10 px-4 py-3.5" />
              <ColumnHeader currentSort={sortConfig} onSort={onSort}>
                Preview
              </ColumnHeader>
              <ColumnHeader sortKey="assetName" currentSort={sortConfig} onSort={onSort}>
                Asset
              </ColumnHeader>
              <ColumnHeader sortKey="platform" currentSort={sortConfig} onSort={onSort}>
                Platform
              </ColumnHeader>
              <ColumnHeader sortKey="similarityScore" currentSort={sortConfig} onSort={onSort} align="right">
                Similarity
              </ColumnHeader>
              <ColumnHeader sortKey="threatScore" currentSort={sortConfig} onSort={onSort} align="right">
                Threat
              </ColumnHeader>
              <ColumnHeader sortKey="status" currentSort={sortConfig} onSort={onSort}>
                Status
              </ColumnHeader>
              <ColumnHeader sortKey="detectedAt" currentSort={sortConfig} onSort={onSort}>
                Detected
              </ColumnHeader>
            </tr>
          </thead>

          {/* ──── Body ──── */}
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/60">
                      <ImageIcon className="h-5 w-5 text-muted-foreground/60" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">No detections found</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Try adjusting your search or filter criteria
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {rows.map((row, index) => {
              const isExpanded = expandedId === row.id;

              return (
                <Fragment key={row.id}>
                  <motion.tr
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.02, 0.25),
                      duration: 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    onClick={() => toggleExpand(row.id)}
                    className={cn(
                      "group cursor-pointer border-t border-border/50 transition-all duration-150",
                      isExpanded
                        ? "bg-secondary/30"
                        : "bg-card/20 hover:bg-secondary/20"
                    )}
                  >
                    {/* Expand chevron */}
                    <td className="px-4 py-3.5">
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex h-6 w-6 items-center justify-center rounded-md transition-colors group-hover:bg-secondary/60"
                      >
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </motion.div>
                    </td>

                    {/* Preview */}
                    <td className="px-4 py-3.5">
                      <PreviewThumbnail url={row.previewUrl} alt={row.assetName} />
                    </td>

                    {/* Asset name */}
                    <td className="px-4 py-3.5">
                      <div className="max-w-[16rem] truncate font-semibold text-foreground">
                        {row.assetName}
                      </div>
                    </td>

                    {/* Platform */}
                    <td className="px-4 py-3.5">
                      <PlatformIcon platform={row.platform} />
                    </td>

                    {/* Similarity */}
                    <td className="px-4 py-3.5 text-right">
                      <SimilarityBadge score={row.similarityScore} />
                    </td>

                    {/* Threat */}
                    <td className="px-4 py-3.5 text-right">
                      <ThreatScorePill score={row.threatScore} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Detected */}
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {row.timeAgo}
                    </td>
                  </motion.tr>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <ExpandedRow row={row} renderActions={renderActions} />
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
