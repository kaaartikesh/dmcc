"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface KineticTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
  stagger?: number;
}

export function KineticText({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
  stagger = 0.03,
}: KineticTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(" ");

  return (
    <Tag
      ref={ref}
      className={cn("flex flex-wrap gap-x-[0.3em]", className)}
      aria-label={text}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex overflow-hidden">
          {word.split("").map((char, ci) => {
            const idx = words.slice(0, wi).join(" ").length + ci + wi;
            return (
              <motion.span
                key={`${wi}-${ci}`}
                initial={{ y: "100%", opacity: 0 }}
                animate={inView ? { y: "0%", opacity: 1 } : undefined}
                transition={{
                  duration: 0.5,
                  delay: delay + idx * stagger,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
