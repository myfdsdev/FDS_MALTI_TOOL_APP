import {
  User,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  BadgeCheck,
  Languages as LanguagesIcon,
  Trophy,
  Eye,
  EyeOff,
} from "lucide-react";
import type { SectionKey } from "@/types/resume";
import { SECTION_LABELS } from "@/types/resume";
import { cn } from "@/lib/utils";

interface Props {
  active: SectionKey | "personal";
  onJump: (key: SectionKey | "personal") => void;
  hiddenSections: SectionKey[];
  onToggleHidden: (key: SectionKey) => void;
}

const ITEMS: { key: SectionKey | "personal"; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "personal", label: "Personal", icon: User },
  { key: "summary", label: SECTION_LABELS.summary, icon: AlignLeft },
  { key: "experience", label: SECTION_LABELS.experience, icon: Briefcase },
  { key: "education", label: SECTION_LABELS.education, icon: GraduationCap },
  { key: "skills", label: SECTION_LABELS.skills, icon: Wrench },
  { key: "projects", label: SECTION_LABELS.projects, icon: FolderGit2 },
  { key: "certifications", label: SECTION_LABELS.certifications, icon: BadgeCheck },
  { key: "languages", label: SECTION_LABELS.languages, icon: LanguagesIcon },
  { key: "awards", label: SECTION_LABELS.awards, icon: Trophy },
];

export function BuilderSidebar({ active, onJump, hiddenSections, onToggleHidden }: Props) {
  return (
    <nav className="hidden min-w-0 lg:block">
      <div className="sticky top-[5.25rem] rounded-xl border border-border bg-background p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Sections</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {ITEMS.length}
          </span>
        </div>
        <ul className="space-y-1">
          {ITEMS.map((item) => {
            const isActive = item.key === active;
            const isHideable = item.key !== "personal";
            const isHidden = isHideable && hiddenSections.includes(item.key as SectionKey);
            const Icon = item.icon;

            return (
              <li key={item.key} className="group flex items-center">
                <button
                  type="button"
                  onClick={() => onJump(item.key)}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className={cn("truncate", isHidden && "line-through opacity-60")}>{item.label}</span>
                </button>
                {isHideable && (
                  <button
                    type="button"
                    onClick={() => onToggleHidden(item.key as SectionKey)}
                    aria-label={`${isHidden ? "Show" : "Hide"} ${item.label}`}
                    className="ml-1 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100 focus:opacity-100"
                  >
                    {isHidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
