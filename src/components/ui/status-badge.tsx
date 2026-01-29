import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Loader2 
} from "lucide-react";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        ok: "badge-ok",
        warning: "badge-warning",
        error: "badge-error",
        pending: "badge-pending",
        processing: "badge-pending animate-pulse",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "pending",
      size: "default",
    },
  }
);

const iconMap = {
  ok: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
  pending: Clock,
  processing: Loader2,
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  showIcon?: boolean;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ className, variant, size, showIcon = true, children, ...props }, ref) => {
    const Icon = iconMap[variant || "pending"];
    
    return (
      <span
        ref={ref}
        className={cn(statusBadgeVariants({ variant, size }), className)}
        {...props}
      >
        {showIcon && (
          <Icon 
            className={cn(
              "h-3 w-3",
              variant === "processing" && "animate-spin"
            )} 
          />
        )}
        {children}
      </span>
    );
  }
);

StatusBadge.displayName = "StatusBadge";

export { StatusBadge, statusBadgeVariants };
