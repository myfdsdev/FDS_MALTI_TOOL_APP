import { useState } from "react";
import { ChevronDown, Download, FileText, FileType, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { exportGigDocx, exportGigPdf } from "@/lib/gigs.exporters";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  gigId: string;
  title: string;
  disabled?: boolean;
}

type Format = "pdf" | "docx";

const ITEMS: { format: Format; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { format: "pdf", label: "PDF", icon: FileType },
  { format: "docx", label: "Word (DOCX)", icon: FileText },
];

export function GigExportMenu({ gigId, title, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Format | null>(null);

  const run = async (format: Format) => {
    setBusy(format);
    try {
      if (format === "pdf") await exportGigPdf(gigId, title);
      else await exportGigDocx(gigId, title);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, `${format.toUpperCase()} export failed`));
    } finally {
      setBusy(null);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="outline" disabled={disabled}>
          <Download className="size-3.5" /> Export
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isBusy = busy === item.format;
          return (
            <button
              key={item.format}
              type="button"
              onClick={() => void run(item.format)}
              disabled={busy !== null}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4 text-muted-foreground" />}
              {item.label}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
