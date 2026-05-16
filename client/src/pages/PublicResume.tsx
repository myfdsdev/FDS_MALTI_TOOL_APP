import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AlertCircle, Download, FileUser, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTemplateComponent } from "@/components/resume/templates";
import { usePublicResume } from "@/lib/resume.queries";
import { publicPdfUrl } from "@/lib/resume.api";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;

export default function PublicResume() {
  const { slug } = useParams<{ slug: string }>();
  const { data: resume, isLoading, isError } = usePublicResume(slug);
  const [downloading, setDownloading] = useState(false);

  const TemplateComponent = useMemo(
    () => (resume ? getTemplateComponent(resume.template) : null),
    [resume]
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading resume…
        </div>
      </div>
    );
  }

  if (isError || !resume || !TemplateComponent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/40 px-4 text-center">
        <AlertCircle className="size-10 text-destructive" />
        <p className="text-lg font-semibold">Resume not found</p>
        <p className="max-w-md text-sm text-muted-foreground">
          This link may have been disabled or never existed.
        </p>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">
          Go home
        </Link>
      </div>
    );
  }

  const handleDownload = () => {
    setDownloading(true);
    const url = publicPdfUrl(slug as string);
    // The endpoint sets Content-Disposition attachment, so a simple anchor click is enough.
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(resume.title || "resume").replace(/[^a-z0-9-_]+/gi, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => setDownloading(false), 600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <FileUser className="size-4 text-primary" />
            <p className="text-sm font-semibold">{resume.content.personal.fullName || resume.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" size="sm" onClick={handleDownload} disabled={downloading}>
              {downloading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
              Download PDF
            </Button>
            <Link to="/" className="text-xs text-muted-foreground hover:underline">
              Made with Multitool — Build yours free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center overflow-x-auto p-6">
        <div
          className="bg-white shadow-2xl"
          style={{ width: PAGE_WIDTH, minHeight: PAGE_HEIGHT }}
        >
          <TemplateComponent
            content={resume.content}
            themeColor={resume.themeColor}
            fontFamily={resume.fontFamily}
            isExportMode
          />
        </div>
      </main>
    </div>
  );
}
