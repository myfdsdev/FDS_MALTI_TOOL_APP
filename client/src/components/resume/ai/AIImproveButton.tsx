import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, Check, X, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useAiImproveField } from "@/lib/resume.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  resumeId: string;
  field: string;
  currentValue: string;
  context?: string;
  onAccept: (suggestion: string) => void;
  className?: string;
  label?: string;
}

export function AIImproveButton({
  resumeId,
  field,
  currentValue,
  context,
  onAccept,
  className,
  label = "Improve with AI",
}: Props) {
  const [open, setOpen] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const mutation = useAiImproveField(resumeId);

  const handleGenerate = async () => {
    try {
      const result = await mutation.mutateAsync({ field, context });
      setSuggestion(result.suggestion);
    } catch (err) {
      toast.error(extractErrorMessage(err, "AI improve failed"));
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value && !suggestion && !mutation.isPending) handleGenerate();
        if (!value) setSuggestion(null);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          title={label}
          className={cn(
            "inline-flex h-7 items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/15",
            className
          )}
        >
          <Sparkles className="size-3.5" />
          AI
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <p className="text-sm font-medium">AI suggestion</p>
          </div>

          <div className="rounded-md bg-muted p-3 text-xs">
            <p className="mb-1 font-medium text-muted-foreground">Original</p>
            <p className="whitespace-pre-wrap">{currentValue || "(empty)"}</p>
          </div>

          <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
            <p className="mb-1 font-medium text-primary">Suggestion</p>
            <AnimatePresence mode="wait">
              {mutation.isPending && !suggestion ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Loader2 className="size-3 animate-spin" />
                  Generating…
                </motion.div>
              ) : (
                <motion.p
                  key="text"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-pre-wrap"
                >
                  {suggestion || "—"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <X className="size-3.5" />
              Reject
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={mutation.isPending}
            >
              <RefreshCw className={cn("size-3.5", mutation.isPending && "animate-spin")} />
              Regenerate
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!suggestion || mutation.isPending}
              onClick={() => {
                if (suggestion) onAccept(suggestion);
                setOpen(false);
              }}
            >
              <Check className="size-3.5" />
              Accept
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
