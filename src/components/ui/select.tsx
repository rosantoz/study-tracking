import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-md border border-border bg-input px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
