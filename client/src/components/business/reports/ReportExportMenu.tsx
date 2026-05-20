import { useState } from "react";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  FileType,
  FileType2,
  Loader2,
  Presentation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  downloadReportDocx,
  downloadReportPdf,
  exportCsv,
  exportHtml,
  exportPptx,
  exportTxt,
  exportXlsx,
} from "@/lib/reports.exporters";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import type { ReportContent } from "@/types/reports";

interface Props {
  reportId: string;
  content: ReportContent;
  websiteUrl: string;
}

type Format = "pdf" | "docx" | "pptx" | "xlsx" | "html" | "csv" | "txt";

const ITEMS: { format: Format; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { format: "pdf", label: "PDF", icon: FileType },
  { format: "docx", label: "Word (DOCX)", icon: FileText },
  { format: "pptx", label: "PowerPoint (PPTX)", icon: Presentation },
  { format: "xlsx", label: "Excel (XLSX)", icon: FileSpreadsheet },
  { format: "html", label: "HTML page", icon: FileType2 },
  { format: "csv", label: "CSV", icon: FileSpreadsheet },
  { format: "txt", label: "Plain text", icon: FileText },
];

export function ReportExportMenu({ reportId, content, websiteUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Format | null>(null);
  const title = content.websiteTitle || "growth-report";

  const run = async (format: Format) => {
    setBusy(format);
    try {
      switch (format) {
        case "pdf":
          await downloadReportPdf(reportId, title);
          break;
        case "docx":
          await downloadReportDocx(reportId, title);
          break;
        case "pptx":
          await exportPptx(content, websiteUrl);
          break;
        case "xlsx":
          await exportXlsx(content, websiteUrl);
          break;
        case "html":
          exportHtml(content, websiteUrl);
          break;
        case "csv":
          exportCsv(content, websiteUrl);
          break;
        case "txt":
          exportTxt(content, websiteUrl);
          break;
      }
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
        <Button type="button" size="sm" variant="outline">
          <Download className="size-3.5" /> Export
          <ChevronDown className="size-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1">
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
