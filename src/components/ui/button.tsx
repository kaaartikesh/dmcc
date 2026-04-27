"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-medium transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
  {
    variants: {
      variant: {
        default:
          "border-primary/70 bg-primary text-primary-foreground shadow-[0_10px_30px_rgba(77,171,247,0.22)] hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_14px_36px_rgba(77,171,247,0.28)]",
        secondary:
          "border-border bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:border-border-strong hover:bg-secondary/80",
        outline:
          "border-border bg-card/80 text-foreground hover:-translate-y-0.5 hover:border-border-strong hover:bg-card",
        ghost:
          "border-transparent bg-transparent text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
        destructive:
          "border-destructive/60 bg-destructive text-destructive-foreground shadow-[0_10px_28px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 hover:border-destructive hover:bg-destructive/95",
      },
      size: {
        default: "h-11 px-[1.125rem] py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 px-5 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";
