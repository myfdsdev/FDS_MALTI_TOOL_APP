import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function prettifyKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stringifyValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => stringifyValue(item)).join("\n\n");
  if (isPlainObject(value)) {
    return Object.entries(value)
      .map(([key, entry]) => `${prettifyKey(key)}:\n${stringifyValue(entry)}`)
      .join("\n\n");
  }
  return String(value ?? "");
}

function CopyButton({
  value,
  className,
  label = "Copy",
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Couldn't copy");
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground",
        className,
      )}
      aria-label={label}
    >
      {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label}
    </button>
  );
}

function TextSection({ label, value }: { label: string; value: string }) {
  return (
    <section className="relative rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </h3>
        <CopyButton value={value} />
      </div>
      <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
        {value}
      </pre>
    </section>
  );
}

function ListSection({ label, items }: { label: string; items: unknown[] }) {
  const textItems = items.map((item) => stringifyValue(item));

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </h3>
        <CopyButton value={textItems.join("\n\n")} label="Copy all" />
      </div>
      <ol className="space-y-2">
        {textItems.map((item, index) => (
          <li
            key={`${label}-${index}`}
            className="flex items-start gap-3 rounded-md border border-border bg-background px-3 py-2.5"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </span>
            <pre className="min-w-0 flex-1 whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground">
              {item}
            </pre>
            <CopyButton value={item} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function ObjectSection({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => {
        const label = prettifyKey(key);

        if (typeof value === "string") {
          return <TextSection key={key} label={label} value={value} />;
        }

        if (Array.isArray(value)) {
          return <ListSection key={key} label={label} items={value} />;
        }

        if (isPlainObject(value)) {
          return (
            <section key={key} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {label}
                </h3>
                <CopyButton value={stringifyValue(value)} label="Copy" />
              </div>
              <ObjectSection data={value} />
            </section>
          );
        }

        return <TextSection key={key} label={label} value={String(value ?? "")} />;
      })}
    </div>
  );
}

export function ToolOutput({ output }: { output: unknown }) {
  if (output == null) return null;

  if (typeof output === "string") {
    return <TextSection label="Output" value={output} />;
  }

  if (Array.isArray(output)) {
    return <ListSection label="Output" items={output} />;
  }

  if (isPlainObject(output)) {
    if (typeof output.text === "string" && Object.keys(output).length === 1) {
      return <TextSection label="Output" value={output.text} />;
    }
    return <ObjectSection data={output} />;
  }

  return <TextSection label="Output" value={String(output)} />;
}
