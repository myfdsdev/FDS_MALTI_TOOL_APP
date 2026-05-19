import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
  successMessage?: string;
  ariaLabel?: string;
}

export function CopyButton({
  value,
  label,
  className,
  size = "sm",
  successMessage = "Copied",
  ariaLabel,
}: Props) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const Icon = copied ? Check : Copy;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || label || "Copy"}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
        size === "sm" ? "h-7 px-2 text-[11px]" : "h-9 px-3 text-xs",
        className,
      )}
    >
      <Icon className={cn(size === "sm" ? "size-3" : "size-3.5")} />
      {label}
    </button>
  );
}
