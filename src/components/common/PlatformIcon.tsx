"use client";

import { cn } from "@/lib/utils";

const platformColors: Record<string, { bg: string; text: string; icon: string }> = {
  youtube: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    icon: "▶",
  },
  telegram: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    icon: "✈",
  },
  twitter: {
    bg: "bg-blue-400/10",
    text: "text-blue-400",
    icon: "𝕏",
  },
  "x / twitter": {
    bg: "bg-blue-400/10",
    text: "text-blue-400",
    icon: "𝕏",
  },
  reddit: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    icon: "⊕",
  },
  facebook: {
    bg: "bg-blue-600/10",
    text: "text-blue-500",
    icon: "f",
  },
  forum: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    icon: "◇",
  },
  news: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    icon: "◉",
  },
};

const defaultPlatform = {
  bg: "bg-white/5",
  text: "text-muted-foreground",
  icon: "●",
};

export function PlatformIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const key = platform.toLowerCase();
  const config = platformColors[key] ?? defaultPlatform;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold",
          config.bg,
          config.text
        )}
      >
        {config.icon}
      </span>
      <span className="text-sm text-foreground">{platform}</span>
    </div>
  );
}
