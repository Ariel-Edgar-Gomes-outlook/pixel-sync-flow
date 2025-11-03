import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm hover:shadow-md",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
        primary: "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/90 shadow-success/20",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/90 shadow-warning/20",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/90 shadow-info/20",
        accent: "border-transparent bg-accent text-accent-foreground hover:bg-accent/90 shadow-accent/20",
        outline: "text-foreground border-border hover:bg-accent/10",
        gradient: "border-transparent gradient-primary text-primary-foreground hover:opacity-90 shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
