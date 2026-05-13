import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** Output shapes the backend may return. The component picks a renderer
 *  by structural matching, falling back to plain text for anything else. */
type PaletteEntry = { name?: string; hex: string };
type ActionItem = string | { text: string; done?: boolean };

interface KnownShapes {
  hooks?: string[];
  names?: string[];
  palette?: PaletteEntry[];
  heading?: string;
  body?: string;
  notes?: string;
  summary?: string;
  actionItems?: ActionItem[];
  text?: string;
}

export function ToolOutput({ output }: { output: unknown }) {
  if (output == null) return null;
  const o = output as KnownShapes;

  if (Array.isArray(o.hooks)) return <HooksList items={o.hooks} />;
  if (Array.isArray(o.names)) return <NamesGrid items={o.names} />;
  if (Array.isArray(o.palette)) return <Palette items={o.palette} />;
  if (typeof o.summary === "string" && Array.isArray(o.actionItems))
    return <SummaryWithActions summary={o.summary} items={o.actionItems} />;
  if (typeof o.heading === "string" || typeof o.body === "string")
    return <FontPreview heading={o.heading} body={o.body} notes={o.notes} />;
  if (typeof o.text === "string") return <TextBlock text={o.text} />;

  if (typeof output === "string") return <TextBlock text={output} />;

  return <TextBlock text={JSON.stringify(output, null, 2)} />;
}

/* ───── Copy button ─────────────────────────────────────── */

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

/* ───── Renderers ───────────────────────────────────────── */

function HooksList({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2">
      {items.map((h, i) => (
        <li
          key={i}
          className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-2.5"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {i + 1}
          </span>
          <p className="min-w-0 flex-1 text-sm">{h}</p>
          <CopyButton value={h} />
        </li>
      ))}
    </ol>
  );
}

function NamesGrid({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((n, i) => (
        <button
          type="button"
          key={i}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(n);
              toast.success(`Copied “${n}”`);
            } catch {
              toast.error("Couldn't copy");
            }
          }}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent"
        >
          {n}
        </button>
      ))}
    </div>
  );
}

function Palette({ items }: { items: PaletteEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((c, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
        >
          <div
            className="h-20 w-full"
            style={{ backgroundColor: c.hex }}
            aria-hidden
          />
          <div className="flex items-center justify-between gap-2 p-2.5">
            <div className="min-w-0">
              {c.name && (
                <p className="truncate text-xs font-medium">{c.name}</p>
              )}
              <p className="font-mono text-[11px] uppercase text-muted-foreground">
                {c.hex}
              </p>
            </div>
            <CopyButton value={c.hex} label="Copy" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FontPreview({
  heading,
  body,
  notes,
}: {
  heading?: string;
  body?: string;
  notes?: string;
}) {
  const headingFont = extractFontFamily(heading) ?? "Inter, system-ui, sans-serif";
  const bodyFont = extractFontFamily(body) ?? "Inter, system-ui, sans-serif";

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Heading — {heading ?? "—"}
        </p>
        <p
          className="mt-2 text-3xl font-semibold leading-tight"
          style={{ fontFamily: headingFont }}
        >
          The quick brown fox jumps
        </p>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Body — {body ?? "—"}
        </p>
        <p
          className="mt-2 text-base leading-relaxed text-foreground"
          style={{ fontFamily: bodyFont }}
        >
          Typography is what language looks like. A good pairing balances
          contrast with harmony.
        </p>
      </div>
      {notes && (
        <p className="text-xs text-muted-foreground">{notes}</p>
      )}
    </div>
  );
}

function extractFontFamily(value?: string): string | undefined {
  if (!value) return undefined;
  // Strip qualifiers like "Inter (sans-serif)" and just use the first family
  const name = value.split(/[(,]/)[0].trim();
  return name ? `'${name}', system-ui, sans-serif` : undefined;
}

function SummaryWithActions({
  summary,
  items,
}: {
  summary: string;
  items: ActionItem[];
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Summary
        </p>
        <p className="mt-1.5 whitespace-pre-line text-sm text-foreground">{summary}</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Action items
          </p>
          <CopyButton
            value={items
              .map((it) => (typeof it === "string" ? it : it.text))
              .map((s) => `• ${s}`)
              .join("\n")}
            label="Copy all"
          />
        </div>
        <ul className="space-y-1.5">
          {items.map((it, i) => {
            const text = typeof it === "string" ? it : it.text;
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 inline-block size-4 shrink-0 rounded-sm border border-border" />
                <span>{text}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function TextBlock({ text }: { text: string }) {
  return (
    <div className="relative rounded-lg border border-border bg-card p-4">
      <CopyButton value={text} className="absolute right-2 top-2" />
      <pre className="whitespace-pre-wrap break-words pr-20 font-sans text-sm leading-relaxed text-foreground">
        {text}
      </pre>
    </div>
  );
}
