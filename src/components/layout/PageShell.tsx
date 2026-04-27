"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("page-shell", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow ? <div className="text-label">{eyebrow}</div> : null}
        <div className="space-y-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-[2rem]">{title}</h1>
          {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function PageGrid({
  children,
  columns = "default",
  className,
}: {
  children: ReactNode;
  columns?: "default" | "wide" | "sidebar";
  className?: string;
}) {
  const map = {
    default: "grid gap-6 xl:grid-cols-3",
    wide: "grid gap-6 xl:grid-cols-[1.6fr_1fr]",
    sidebar: "grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]",
  };
  return <div className={cn(map[columns], className)}>{children}</div>;
}

export function SectionCard({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className={className}>
        <CardHeader title={title} description={description} action={action} />
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "positive" | "warning" | "danger";
}) {
  const accentClass = {
    default: "text-primary",
    positive: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
  }[tone];

  return (
    <Card className="interactive-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-label">{label}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</div>
          {hint ? <div className="mt-2 text-sm text-muted-foreground">{hint}</div> : null}
        </div>
        {icon ? <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary", accentClass)}>{icon}</div> : null}
      </div>
    </Card>
  );
}

export function PageLoadingState({
  title = "Loading workspace",
  metrics = 4,
  panels = 3,
}: {
  title?: string;
  metrics?: number;
  panels?: number;
}) {
  return (
    <PageShell>
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="text-label">{title}</div>
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-5 w-[32rem] max-w-full" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: metrics }).map((_, index) => (
            <Card key={index} className="p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-5 h-10 w-28" />
              <Skeleton className="mt-3 h-4 w-36" />
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {Array.from({ length: panels }).map((_, index) => (
            <Card key={index} className={cn("p-6", index === 0 && panels > 1 ? "xl:col-span-2" : undefined)}>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-4 w-56" />
              <Skeleton className="mt-6 h-64 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
