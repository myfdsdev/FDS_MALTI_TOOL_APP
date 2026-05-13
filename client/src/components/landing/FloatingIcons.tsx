import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Megaphone, Mail, MessageCircle, Sparkles, Hash, Film,
  Briefcase, FileText, Target, ListChecks,
  Palette, Type, BookOpen, Image as ImageIcon, LayoutTemplate, UserCircle2, PlaySquare, Tag,
  Video, Mic, Clapperboard,
  UtensilsCrossed, Dumbbell, Home, Scissors, Stethoscope, GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type IconSpec = {
  id: string;
  label: string;
  Icon: LucideIcon;
};

const ICONS: IconSpec[] = [
  { id: "hook-generator", label: "Hook Generator", Icon: Sparkles },
  { id: "caption-generator", label: "Caption Generator", Icon: Hash },
  { id: "email-writer", label: "Email Writer", Icon: Mail },
  { id: "whatsapp-writer", label: "WhatsApp Writer", Icon: MessageCircle },
  { id: "product-description", label: "Product Copy", Icon: Tag },
  { id: "reel-script", label: "Reel Script", Icon: Film },
  { id: "business-name", label: "Brand Names", Icon: Briefcase },
  { id: "logo-idea", label: "Logo Ideas", Icon: Palette },
  { id: "business-report", label: "Business Report", Icon: FileText },
  { id: "offer-generator", label: "Offers", Icon: Target },
  { id: "meeting-summary", label: "Meeting Summary", Icon: ListChecks },
  { id: "color-palette", label: "Color Palette", Icon: Palette },
  { id: "font-pairing", label: "Font Pairing", Icon: Type },
  { id: "brand-style-guide", label: "Style Guide", Icon: BookOpen },
  { id: "moodboard-prompt", label: "Moodboard", Icon: ImageIcon },
  { id: "website-section", label: "Web Sections", Icon: LayoutTemplate },
  { id: "portfolio-bio", label: "Portfolio Bio", Icon: UserCircle2 },
  { id: "thumbnail-idea", label: "Thumbnails", Icon: PlaySquare },
  { id: "ad-banner-text", label: "Ad Banners", Icon: Megaphone },
  { id: "faceless-video", label: "Video Ideas", Icon: Video },
  { id: "voiceover-script", label: "Voiceover", Icon: Mic },
  { id: "hook-script-cta", label: "Script + CTA", Icon: Clapperboard },
  { id: "restaurant", label: "Restaurant", Icon: UtensilsCrossed },
  { id: "gym", label: "Gym", Icon: Dumbbell },
  { id: "real-estate", label: "Real Estate", Icon: Home },
  { id: "salon", label: "Salon", Icon: Scissors },
  { id: "doctor-clinic", label: "Clinic", Icon: Stethoscope },
  { id: "coaching", label: "Coaching", Icon: GraduationCap },
];

function hash(n: number, seed: number) {
  const x = Math.sin(n * 9301 + seed * 49297) * 233280;
  return x - Math.floor(x);
}

type Placed = IconSpec & {
  left: number;
  top: number;
  size: number;
  dx: number;
  dy: number;
  dr: number;
  dur: number;
  delay: number;
  big: boolean;
};

export function FloatingIcons({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  const placed: Placed[] = useMemo(() => {
    // Distribute around an ellipse with some jitter, avoiding the center.
    return ICONS.map((spec, i) => {
      const r1 = hash(i, 1);
      const r2 = hash(i, 2);
      const r3 = hash(i, 3);
      const r4 = hash(i, 4);
      const r5 = hash(i, 5);

      // angle around center
      const angle = (i / ICONS.length) * Math.PI * 2 + r1 * 0.6;
      // radius from center — keep a hole in the middle
      const radiusX = 30 + r2 * 18; // % of container width from center
      const radiusY = 26 + r3 * 18; // % of container height from center
      const left = 50 + Math.cos(angle) * radiusX;
      const top = 50 + Math.sin(angle) * radiusY;

      const big = r5 > 0.75;
      const size = big ? 60 : 48 + Math.floor(r4 * 8);

      return {
        ...spec,
        left,
        top,
        size,
        dx: (r1 - 0.5) * 70,
        dy: (r2 - 0.5) * 70,
        dr: (r3 - 0.5) * 16,
        dur: 8 + r4 * 6,
        delay: r5 * 4,
        big,
      };
    });
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden="true"
    >
      {placed.map((p) => (
        <FloatingIcon
          key={p.id}
          p={p}
          reduceMotion={!!reduceMotion}
          hovered={hovered === p.id}
          onHover={(v) => setHovered(v ? p.id : null)}
        />
      ))}
    </div>
  );
}

function FloatingIcon({
  p,
  reduceMotion,
  hovered,
  onHover,
}: {
  p: Placed;
  reduceMotion: boolean;
  hovered: boolean;
  onHover: (v: boolean) => void;
}) {
  const { Icon, label, size, left, top, dx, dy, dr, dur, delay, big } = p;

  // Mount opacity pulse via state so opacity doesn't fight transform animation values
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const drift = reduceMotion
    ? {}
    : {
        x: [0, dx, -dx * 0.6, 0],
        y: [0, dy, -dy * 0.7, 0],
        rotate: [0, dr, -dr, 0],
      };

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: mounted ? (hovered ? 1 : big ? 0.85 : 0.65) : 0,
          scale: hovered ? 1.1 : 1,
          ...drift,
        }}
        transition={
          reduceMotion
            ? { duration: 0.3 }
            : {
                opacity: { duration: 0.6, delay: delay * 0.15 },
                scale: { type: "spring", stiffness: 300, damping: 20 },
                x: { duration: dur, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay },
                y: { duration: dur * 1.1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay },
                rotate: { duration: dur * 1.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay },
              }
        }
        onHoverStart={() => onHover(true)}
        onHoverEnd={() => onHover(false)}
        className={cn(
          "flex items-center justify-center rounded-xl border bg-card shadow-sm backdrop-blur-sm",
          "border-border",
          "transition-colors",
        )}
        style={{ width: size, height: size }}
      >
        <Icon
          className={cn(
            "transition-colors",
            hovered ? "text-foreground" : big ? "text-foreground/80" : "text-muted-foreground",
          )}
          size={Math.round(size * 0.45)}
          strokeWidth={1.6}
        />
      </motion.div>

      <motion.span
        initial={false}
        animate={{ opacity: hovered ? 1 : 0, y: hovered ? 4 : 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-md"
      >
        {label}
      </motion.span>
    </div>
  );
}

export default FloatingIcons;
