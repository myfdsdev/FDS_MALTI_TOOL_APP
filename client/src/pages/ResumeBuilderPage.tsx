import { useParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { ResumeBuilder } from "@/components/resume/builder/ResumeBuilder";
import { useResume } from "@/lib/resume.queries";

export default function ResumeBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const { data: resume, isLoading, isError, error } = useResume(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading resume…
        </div>
      </div>
    );
  }

  if (isError || !resume) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-24 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-lg font-semibold">Resume not found</p>
        <p className="text-sm text-muted-foreground">
          {(error as Error | undefined)?.message ||
            "This resume doesn't exist or you don't have access to it."}
        </p>
      </div>
    );
  }

  return <ResumeBuilder key={resume._id} resume={resume} />;
}
