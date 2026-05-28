import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[88px] w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-placeholder focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:opacity-60",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
