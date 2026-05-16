import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplatePreview } from "./TemplatePreview";
import { starterPlaceholderContent } from "./templates/shared/utils";
import { useCreateResume } from "@/lib/resume.queries";
import { TEMPLATE_DESCRIPTIONS, TEMPLATE_LABELS } from "@/types/resume";
import type { ResumeTemplate } from "@/types/resume";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  onCreated?: (id: string) => void;
}

const TEMPLATES: ResumeTemplate[] = [
  "modern",
  "classic",
  "minimal",
  "creative",
  "compact",
  "executive",
];

export function TemplateGallery({ onCreated }: Props) {
  const navigate = useNavigate();
  const create = useCreateResume();

  const onPick = async (template: ResumeTemplate) => {
    try {
      const resume = await create.mutateAsync({
        title: `${TEMPLATE_LABELS[template]} resume`,
        template,
        content: starterPlaceholderContent(),
      });
      toast.success("Resume created");
      onCreated?.(resume._id);
      navigate(`/business/resumes/${resume._id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't create resume"));
    }
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATES.map((template, index) => (
        <motion.div
          key={template}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
        >
          <TemplatePreview template={template} />
          <div>
            <p className="font-semibold">{TEMPLATE_LABELS[template]}</p>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {TEMPLATE_DESCRIPTIONS[template]}
            </p>
          </div>
          <Button
            type="button"
            disabled={create.isPending}
            onClick={() => void onPick(template)}
            className="w-full"
          >
            <Sparkles className="size-3.5" />
            Use this template
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
