import { useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, X, Sparkles, Loader2 } from "lucide-react";
import { nanoid } from "nanoid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAiSuggestSkills } from "@/lib/resume.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { Resume } from "@/types/resume";

interface Props {
  resumeId: string;
}

export function SkillsSection({ resumeId }: Props) {
  const { control, watch, setValue } = useFormContext<Resume>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "content.skills",
    keyName: "_rhfId",
  });

  const jobTitle = watch("content.personal.jobTitle");
  const currentSkills = (watch("content.skills") ?? []).flatMap((g) => g.items ?? []);
  const suggest = useAiSuggestSkills(resumeId);

  const onSuggest = async () => {
    if (!jobTitle) {
      toast.info("Add a job title in the Personal section first.");
      return;
    }
    try {
      const result = await suggest.mutateAsync({ jobTitle, currentSkills });
      for (const group of result.skills) {
        append({ id: nanoid(8), category: group.category, items: group.items });
      }
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't suggest skills"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onSuggest} disabled={suggest.isPending}>
          {suggest.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          Suggest skills
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">Add categories like "Languages", "Frameworks", "Soft skills".</p>
      )}

      {fields.map((field, index) => {
        const items = watch(`content.skills.${index}.items`) ?? [];
        return (
          <div key={field._rhfId} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name={`content.skills.${index}.category`}
                render={({ field: ctl }) => (
                  <Input value={ctl.value ?? ""} onChange={(e) => ctl.onChange(e.target.value)} placeholder="Category" className="font-medium" />
                )}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} aria-label="Remove category">
                <Trash2 className="size-3.5" />
              </Button>
            </div>
            <Label className="mt-3 mb-1.5 block text-xs">Skills</Label>
            <TokenInput
              tokens={items}
              onChange={(next) => setValue(`content.skills.${index}.items`, next, { shouldDirty: true })}
              placeholder="Type a skill and press Enter"
            />
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ id: nanoid(8), category: "", items: [] })
        }
      >
        <Plus className="size-3.5" /> Add category
      </Button>
    </div>
  );
}

function TokenInput({
  tokens,
  onChange,
  placeholder,
}: {
  tokens: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  const addToken = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (tokens.includes(trimmed)) {
      setInput("");
      return;
    }
    onChange([...tokens, trimmed]);
    setInput("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-2">
      {tokens.map((token, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
        >
          {token}
          <button
            type="button"
            aria-label={`Remove ${token}`}
            onClick={() => onChange(tokens.filter((_, i) => i !== index))}
            className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onBlur={addToken}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addToken();
          } else if (e.key === "Backspace" && input === "" && tokens.length) {
            onChange(tokens.slice(0, -1));
          }
        }}
        placeholder={placeholder}
        className="min-w-[120px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
