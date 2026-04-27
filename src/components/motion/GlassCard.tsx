"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "cyan" | "none";
  hover?: boolean;
  onClick?: () => void;
}

const glowMap = {
  blue: "hover:shadow-[0_0_30px_rgba(0,180,255,0.15)] hover:border-[rgba(0,180,255,0.2)]",
  purple: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-[rgba(139,92,246,0.2)]",
  cyan: "hover:shadow-[0_0_30px_rgba(0,229,204,0.15)] hover:border-[rgba(0,229,204,0.2)]",
  none: "",
};

export function GlassCard({
  children,
  className,
  glowColor = "blue",
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.005 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        "relative rounded-2xl p-6 panel-card",
        "transition-all duration-300",
        hover && glowMap[glowColor],
        hover && "cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
