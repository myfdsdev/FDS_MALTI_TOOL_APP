import { useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAiGenerateBullets } from "@/lib/resume.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  resumeId: string;
  role: string;
  company: string;
  existingBullets: string[];
  onAdd: (bullets: string[]) => void;
}

export function BulletGenerator({ resumeId, role, company, existingBullets, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [bullets, setBullets] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const mutation = useAiGenerateBullets(resumeId);

  const generate = async () => {
    setBullets([]);
    setSelected(new Set());
    try {
      const result = await mutation.mutateAsync({ role, company, existingBullets });
      setBullets(result.bullets);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't generate bullets"));
    }
  };

  const toggle = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value && bullets.length === 0 && !mutation.isPending) void generate();
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={!role}>
          <Sparkles className="size-3.5" />
          Generate bullets
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(28rem,calc(100vw-2rem))]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">AI bullet ideas</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void generate()}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Regenerate"}
            </Button>
          </div>

          {mutation.isPending && bullets.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              Drafting bullets…
            </p>
          ) : (
            <ul className="space-y-2">
              {bullets.map((bullet, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    className="flex w-full items-start gap-2 rounded-md border border-border p-2 text-left text-xs hover:bg-accent"
                  >
                    <span
                      className={`mt-0.5 flex size-4 items-center justify-center rounded ${
                        selected.has(index)
                          ? "bg-primary text-primary-foreground"
                          : "border border-border"
                      }`}
                    >
                      {selected.has(index) && <Check className="size-3" />}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">{bullet}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={selected.size === 0}
              onClick={() => {
                const picked = Array.from(selected).map((i) => bullets[i]);
                onAdd(picked);
                setOpen(false);
              }}
            >
              Add {selected.size || ""} bullet{selected.size === 1 ? "" : "s"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
