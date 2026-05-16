import { useState } from "react";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { LinkPreview } from "@/types/business";
import { LinkPreviewCard } from "./LinkPreviewCard";

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

function ShortUrlSection({ data }: { data: Record<string, unknown> }) {
  const shortUrl = typeof data.shortUrl === "string" ? data.shortUrl : "";
  const originalUrl = typeof data.originalUrl === "string" ? data.originalUrl : "";
  const code = typeof data.code === "string" ? data.code : "";
  const clicks = typeof data.clicks === "number" ? data.clicks : 0;

  if (!shortUrl) return <ObjectSection data={data} />;

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Short URL
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            This link redirects to the original URL and belongs to your account.
          </p>
        </div>
        <CopyButton value={shortUrl} />
      </div>

      <div className="rounded-md border border-border bg-background p-3">
        <div className="flex items-start gap-2">
          <Link2 className="mt-0.5 size-4 shrink-0 text-primary" />
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 break-all text-sm font-medium text-primary hover:underline"
          >
            {shortUrl}
          </a>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-accent"
        >
          <ExternalLink className="size-3.5" />
          Open
        </a>
        <CopyButton value={shortUrl} className="h-9 px-3" label="Copy link" />
      </div>

      <dl className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
        <div className="rounded-md border border-border bg-background p-3">
          <dt className="font-medium uppercase tracking-wide">Code</dt>
          <dd className="mt-1 break-all text-foreground">{code}</dd>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <dt className="font-medium uppercase tracking-wide">Clicks</dt>
          <dd className="mt-1 tabular-nums text-foreground">{clicks}</dd>
        </div>
      </dl>

      {originalUrl && (
        <div className="mt-3 rounded-md border border-border bg-background p-3 text-xs">
          <p className="font-medium uppercase tracking-wide text-muted-foreground">Original URL</p>
          <p className="mt-1 break-all text-foreground">{originalUrl}</p>
        </div>
      )}
    </section>
  );
}

export function ToolOutput({
  output,
  toolId,
  isLoading = false,
}: {
  output: unknown;
  toolId?: string;
  isLoading?: boolean;
}) {
  if (toolId === "link-saver") {
    return (
      <LinkPreviewCard
        preview={(output as LinkPreview | null | undefined) ?? null}
        isLoading={isLoading}
      />
    );
  }

  if (toolId === "url-shortener" && isPlainObject(output)) {
    return <ShortUrlSection data={output} />;
  }

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
