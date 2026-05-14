import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Tool } from "@/types/api";

/** Fields that should render as a multi-line textarea. */
const LONG_FIELDS = /notes|context|features|description|details|services|content/i;
/** Fields the backend treats as optional. */
const OPTIONAL_FIELDS = /^(url|recipient)$/i;

/** Known enum-like fields → fixed option lists for a nicer UX. */
const FIELD_OPTIONS: Record<string, string[]> = {
  platform: ["Instagram", "TikTok", "LinkedIn", "Facebook", "YouTube", "X / Twitter"],
  tone: ["Professional", "Casual", "Friendly", "Bold", "Playful", "Luxury"],
  duration: ["15 seconds", "30 seconds", "60 seconds"],
  style: ["Modern", "Minimal", "Playful", "Elegant", "Bold", "Vintage"],
  mood: ["Calm", "Energetic", "Warm", "Cool", "Dark", "Bright"],
};

function prettify(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function placeholderFor(key: string): string {
  const label = prettify(key).toLowerCase();
  return `Enter ${label}…`;
}

export function ToolForm({
  tool,
  onGenerate,
  isPending,
}: {
  tool: Tool;
  onGenerate: (values: Record<string, string>) => void;
  isPending: boolean;
}) {
  const schema = useMemo(() => {
    const shape: Record<string, z.ZodTypeAny> = {};
    for (const key of tool.inputs) {
      shape[key] = OPTIONAL_FIELDS.test(key)
        ? z.string().optional()
        : z.string().min(1, `${prettify(key)} is required`);
    }
    return z.object(shape);
  }, [tool.inputs]);

  const defaultValues = useMemo(
    () => Object.fromEntries(tool.inputs.map((k) => [k, ""])),
    [tool.inputs],
  );

  // The parent keys this component by tool.id, so a tool switch remounts it
  // and the form state resets cleanly.
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, string>>({
    resolver: zodResolver(schema) as Resolver<Record<string, string>>,
    defaultValues,
  });

  const submit = handleSubmit((values) => {
    const cleaned = Object.fromEntries(
      Object.entries(values).filter(([, v]) => v != null && String(v).trim() !== ""),
    ) as Record<string, string>;
    onGenerate(cleaned);
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {tool.inputs.map((key) => {
        const label = prettify(key);
        const error = errors[key]?.message as string | undefined;
        const options = FIELD_OPTIONS[key];
        const isLong = LONG_FIELDS.test(key);
        const optional = OPTIONAL_FIELDS.test(key);

        return (
          <div key={key} className="space-y-2">
            <Label htmlFor={`field-${key}`}>
              {label}
              {optional && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              )}
            </Label>

            {options ? (
              <Select
                id={`field-${key}`}
                aria-invalid={!!error}
                defaultValue=""
                {...register(key)}
              >
                <option value="" disabled>
                  Select {label.toLowerCase()}…
                </option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            ) : isLong ? (
              <Textarea
                id={`field-${key}`}
                placeholder={placeholderFor(key)}
                aria-invalid={!!error}
                {...register(key)}
              />
            ) : (
              <Input
                id={`field-${key}`}
                placeholder={placeholderFor(key)}
                aria-invalid={!!error}
                {...register(key)}
              />
            )}

            {error && (
              <p className="text-xs text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        );
      })}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {isPending ? "Generating…" : "Generate"}
      </Button>
    </form>
  );
}
