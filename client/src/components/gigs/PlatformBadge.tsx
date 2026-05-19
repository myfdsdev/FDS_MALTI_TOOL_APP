import { cn } from "@/lib/utils";
import { PLATFORM_LABEL, type GigPlatform } from "@/types/gigs";

interface Props {
  platform: GigPlatform;
  className?: string;
}

const STYLES: Record<GigPlatform, string> = {
  fiverr: "bg-emerald-100 text-emerald-700",
  upwork: "bg-green-100 text-green-700",
  linkedin: "bg-sky-100 text-sky-700",
  instagram: "bg-pink-100 text-pink-700",
  freelancer: "bg-blue-100 text-blue-700",
};

export function PlatformBadge({ platform, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        STYLES[platform],
        className,
      )}
    >
      {PLATFORM_LABEL[platform]}
    </span>
  );
}
