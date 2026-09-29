import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  // rounded-[var(--radius-badge)] — a fixed, small radius shared by both
  // apps (not --radius, which is card/button-sized and reads as a full
  // pill at badge height). See tokens/base.css.
  "inline-flex items-center rounded-[var(--radius-badge)] border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-muted-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        serious: "border-transparent bg-serious text-serious-foreground",
        danger: "border-transparent bg-danger text-danger-foreground",
        info: "border-transparent bg-info text-info-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
