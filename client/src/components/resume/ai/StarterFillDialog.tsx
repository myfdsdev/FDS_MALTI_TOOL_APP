import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiStarterFill } from "@/lib/resume.queries";
import { extractErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  resumeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUSES = [
  "Drafting your summary…",
  "Building your experience…",
  "Curating skills…",
  "Reviewing the draft…",
];

export function StarterFillDialog({ resumeId, open, onOpenChange }: Props) {
  const [bio, setBio] = useState("");
  const [statusIdx, setStatusIdx] = useState(0);
  const fill = useAiStarterFill(resumeId);

  useEffect(() => {
    if (!fill.isPending) {
      setStatusIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUSES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [fill.isPending]);

  const onSubmit = async () => {
    if (bio.trim().length < 20) {
      toast.error("Add at least 20 characters about yourself.");
      return;
    }
    try {
      await fill.mutateAsync(bio.trim());
      toast.success("AI filled your resume. Review and edit each section.");
      onOpenChange(false);
      setBio("");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Couldn't generate a starter resume"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" /> Let AI fill your resume
          </DialogTitle>
          <DialogDescription>
            Paste 2–5 sentences about yourself — current role, years of experience, top
            skills, what you're looking for next. We'll draft a starter resume you can edit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 px-6 py-4">
          <Textarea
            value={bio}
            rows={6}
            maxLength={1000}
            onChange={(e) => setBio(e.target.value)}
            placeholder="I'm a senior backend engineer with 8 years of experience in Node and Go. I've led platform teams at two startups and I'm looking for a staff role at a product-led SaaS company…"
          />
          <p className="text-right text-[10px] text-muted-foreground">{bio.length}/1000</p>

          <AnimatePresence>
            {fill.isPending && (
              <motion.p
                key={statusIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <Loader2 className="size-3 animate-spin" />
                {STATUSES[statusIdx]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit} disabled={fill.isPending}>
            {fill.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
