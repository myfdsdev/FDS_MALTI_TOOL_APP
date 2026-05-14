import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Tool, ToolInput } from "@/types/api";

function inputSchemaFor(field: ToolInput) {
  const base = z.string();
  return field.required === false
    ? base.optional()
    : base.min(1, `${field.label} is required`);
}

function fallbackPlaceholder(field: ToolInput) {
  switch (field.type) {
    case "select":
      return `Select ${field.label.toLowerCase()}...`;
    case "textarea":
      return `Enter ${field.label.toLowerCase()}...`;
    default:
      return `Enter ${field.label.toLowerCase()}...`;
  }
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
    for (const input of tool.inputs) {
      shape[input.key] = inputSchemaFor(input);
    }
    return z.object(shape);
  }, [tool.inputs]);

  const defaultValues = useMemo(
    () => Object.fromEntries(tool.inputs.map((input) => [input.key, ""])),
    [tool.inputs],
  );

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
      Object.entries(values).filter(([, value]) => value != null && String(value).trim() !== ""),
    ) as Record<string, string>;
    onGenerate(cleaned);
  });

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {tool.inputs.map((input) => {
        const error = errors[input.key]?.message as string | undefined;
        const placeholder = input.placeholder || fallbackPlaceholder(input);

        return (
          <div key={input.key} className="space-y-2">
            <Label htmlFor={`field-${input.key}`}>
              {input.label}
              {input.required === false && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              )}
            </Label>

            {input.type === "select" ? (
              <Select
                id={`field-${input.key}`}
                aria-invalid={!!error}
                defaultValue=""
                {...register(input.key)}
              >
                <option value="" disabled>
                  {placeholder}
                </option>
                {input.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            ) : input.type === "textarea" ? (
              <Textarea
                id={`field-${input.key}`}
                placeholder={placeholder}
                aria-invalid={!!error}
                {...register(input.key)}
              />
            ) : (
              <Input
                id={`field-${input.key}`}
                type={input.type === "url" ? "url" : "text"}
                placeholder={placeholder}
                aria-invalid={!!error}
                {...register(input.key)}
              />
            )}

            {input.helpText && !error && (
              <p className="text-xs text-muted-foreground">{input.helpText}</p>
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
        {isPending ? "Generating..." : "Generate"}
      </Button>
    </form>
  );
}
