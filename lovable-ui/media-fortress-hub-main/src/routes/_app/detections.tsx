import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, ChevronDown, Search, Filter, ExternalLink, Eye } from "lucide-react";
import { detections, type Detection, type Severity } from "@/lib/mock-data";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/detections")({
  head: () => ({
    meta: [
      { title: "Detection Monitor — DMCC" },
      { name: "description", content: "Real-time view of detected matches across global platforms." },
    ],
  }),
  component: DetectionsPage,
});

const PAGE_SIZE = 20;

function DetectionsPage() {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [sort, setSort] = useState<{ key: keyof Detection; dir: "asc" | "desc" }>({
    key: "detectedAt",
    dir: "desc",
  });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let r = detections.filter((d) => {
      if (severity !== "all" && d.severity !== severity) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          d.id.toLowerCase().includes(q) ||
          d.asset.toLowerCase().includes(q) ||
          d.platform.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q)
        );
      }
      return true;
    });
    r = [...r].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av < bv) return sort.dir === "asc" ? -1 : 1;
      if (av > bv) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [query, severity, sort]);

  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const toggleSort = (key: keyof Detection) => {
    setSort((cur) =>
      cur.key === key ? { key, dir: cur.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );
  };

  return (
    <div className="px-4 md:px-8 py-8 max-w-[1600px] mx-auto space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Detection monitor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="text-foreground font-medium tabular-nums">{filtered.length}</span> matches across {detections.length} total events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search ID, asset, platform…"
              className="pl-8 h-9 w-72"
            />
          </div>
          <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-0.5">
            {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSeverity(s);
                  setPage(0);
                }}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  severity === s
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-3.5 w-3.5 mr-1.5" /> More
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="w-8 py-3 px-3" />
                <Th onClick={() => toggleSort("id")}>ID</Th>
                <Th onClick={() => toggleSort("asset")}>Asset</Th>
                <Th onClick={() => toggleSort("platform")}>Platform</Th>
                <Th onClick={() => toggleSort("country")}>Region</Th>
                <Th onClick={() => toggleSort("matchScore")} align="right">Match</Th>
                <Th>Severity</Th>
                <Th>Status</Th>
                <Th onClick={() => toggleSort("detectedAt")}>Detected</Th>
                <th className="py-3 px-3" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((d, i) => {
                const isExp = expanded === d.id;
                const isAnomaly = d.severity === "critical" && d.matchScore > 90;
                return (
                  <>
                    <motion.tr
                      key={d.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.015, 0.2) }}
                      className={cn(
                        "border-b border-border/60 hover:bg-surface/40 transition-colors cursor-pointer",
                        isExp && "bg-surface/40",
                        isAnomaly && "bg-destructive/[0.04]"
                      )}
                      onClick={() => setExpanded(isExp ? null : d.id)}
                    >
                      <td className="py-3 px-3">
                        <motion.div animate={{ rotate: isExp ? 180 : 0 }}>
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                        </motion.div>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-primary">{d.id}</td>
                      <td className="py-3 px-3">
                        <div className="font-medium truncate max-w-[260px]">{d.asset}</div>
                        <div className="text-[10px] text-muted-foreground capitalize">{d.assetType}</div>
                      </td>
                      <td className="py-3 px-3 text-muted-foreground">{d.platform}</td>
                      <td className="py-3 px-3">
                        <div className="text-xs">{d.country}</div>
                        <div className="text-[10px] text-muted-foreground">{d.region}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 font-medium tabular-nums",
                          d.matchScore > 90 ? "text-destructive" : d.matchScore > 75 ? "text-warning" : "text-foreground"
                        )}>
                          {d.matchScore.toFixed(1)}%
                        </div>
                      </td>
                      <td className="py-3 px-3"><SeverityBadge severity={d.severity} /></td>
                      <td className="py-3 px-3"><StatusBadge status={d.status} /></td>
                      <td className="py-3 px-3 text-xs text-muted-foreground tabular-nums">
                        {timeAgo(d.detectedAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link to="/assets/$assetId" params={{ assetId: "AST-001" }} onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </motion.tr>
                    <AnimatePresence>
                      {isExp && (
                        <tr className="border-b border-border/60 bg-surface/20">
                          <td colSpan={10} className="px-3">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
                                <Detail label="URL" value={
                                  <a href="#" className="inline-flex items-center gap-1 text-primary hover:underline truncate max-w-full">
                                    {d.url} <ExternalLink className="h-3 w-3 shrink-0" />
                                  </a>
                                } />
                                <Detail label="Views" value={d.views.toLocaleString()} />
                                <Detail label="Region" value={`${d.country} · ${d.region}`} />
                                <Detail label="Detected at" value={new Date(d.detectedAt).toLocaleString()} />
                              </div>
                              <div className="flex items-center gap-2 pb-4">
                                <Button size="sm" className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Issue takedown
                                </Button>
                                <Button size="sm" variant="outline">Mark safe</Button>
                                <Button size="sm" variant="ghost">Escalate</Button>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs">
          <div className="text-muted-foreground">
            Page <span className="text-foreground font-medium">{page + 1}</span> of {totalPages} ·{" "}
            {filtered.length} results
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
              Previous
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children, onClick, align = "left" }: { children: React.ReactNode; onClick?: () => void; align?: "left" | "right" }) {
  return (
    <th className={cn("py-3 px-3 font-medium", align === "right" && "text-right")}>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        disabled={!onClick}
      >
        {children}
        {onClick && <ArrowUpDown className="h-3 w-3 opacity-50" />}
      </button>
    </th>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm truncate">{value}</div>
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
