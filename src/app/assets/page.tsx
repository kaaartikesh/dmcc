"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { MetricCard, PageHeader, PageLoadingState, PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AssetsResponseRow } from "@/lib/frontend-data";

export default function AssetsPage() {
  const [assets, setAssets] = useState<AssetsResponseRow[] | null>(null);

  useEffect(() => {
    let mounted = true;
    void fetch("/api/assets")
      .then((res) => res.json() as Promise<{ assets: AssetsResponseRow[] }>)
      .then((body) => {
        if (mounted) {
          setAssets(body.assets ?? []);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!assets) {
    return <PageLoadingState title="Loading asset library" panels={2} />;
  }

  const totalMatches = assets.reduce((sum, asset) => sum + asset.matches, 0);
  const openCases = assets.reduce((sum, asset) => sum + (asset.openCases ?? 0), 0);

  return (
    <PageShell>
      <div className="space-y-8">
        <PageHeader
          eyebrow="Protected library"
          title="Your monitored asset inventory"
          description="Every protected upload, its fingerprint, and the enforcement pressure attached to it live here."
          actions={
            <Button asChild>
              <Link href="/upload">
                <Sparkles className="h-3.5 w-3.5" />
                Add protected asset
              </Link>
            </Button>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label="Protected assets" value={assets.length} hint="Tracked in the current workspace" icon={<FileSearch className="h-5 w-5" />} />
          <MetricCard label="Total matches" value={totalMatches} hint="Combined detections across all assets" icon={<ShieldCheck className="h-5 w-5" />} tone="warning" />
          <MetricCard label="Open cases" value={openCases} hint="Assets linked to unresolved review work" icon={<Sparkles className="h-5 w-5" />} tone="danger" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {assets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.03, 0.24) }}
            >
              <Card className="interactive-card overflow-hidden">
                <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-surface-elevated">
                  <Image src={asset.imageUrl} alt={asset.fileName} fill className="object-cover transition-transform duration-300 hover:scale-[1.03]" />
                </div>

                <div className="space-y-5 p-5">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-base font-semibold tracking-tight text-foreground">{asset.fileName}</div>
                        <div className="mt-1 text-sm text-muted-foreground">{new Date(asset.createdAt).toLocaleDateString()}</div>
                      </div>
                      <Badge variant={asset.highestThreat && asset.highestThreat >= 85 ? "danger" : asset.matches > 0 ? "warning" : "success"}>
                        {asset.matches > 0 ? `${asset.matches} matches` : "Protected"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-secondary/50 p-3">
                      <MiniStat label="Threat" value={asset.highestThreat ? `${asset.highestThreat}` : "0"} />
                      <MiniStat label="Cases" value={asset.openCases ?? 0} />
                      <MiniStat label="Labels" value={asset.fingerprint.labels.length} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="line-clamp-1 text-xs text-muted-foreground">
                      {asset.ownershipVerification?.notes?.[0] ?? "Protected fingerprint recorded"}
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/assets/${asset.id}`}>
                        View
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-label">{label}</div>
      <div className="mt-2 text-lg font-semibold tabular-nums text-foreground">{value}</div>
    </div>
  );
}
