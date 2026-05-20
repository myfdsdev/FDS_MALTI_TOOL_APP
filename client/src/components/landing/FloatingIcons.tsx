import { useEffect, useMemo, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import {
  BadgeDollarSign,
  BookOpen,
  Briefcase,
  CalendarDays,
  Clapperboard,
  Dumbbell,
  FileText,
  Film,
  GraduationCap,
  Hash,
  Home,
  Image as ImageIcon,
  LayoutTemplate,
  Lightbulb,
  LineChart,
  Link2,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  Mic,
  Palette,
  PlaySquare,
  Scissors,
  Sparkles,
  Stethoscope,
  Tag,
  Target,
  Type,
  UserCircle2,
  UtensilsCrossed,
  Video,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

type IconSpec = {
  id: string;
  label: string;
  Icon: LucideIcon;
  accent: keyof typeof ACCENTS;
};

const ACCENTS = {
  blue: {
    icon: "text-blue-500",
    tile: "border-blue-500/20 bg-blue-500/10",
    label: "bg-blue-600 text-white",
  },
  emerald: {
    icon: "text-emerald-500",
    tile: "border-emerald-500/20 bg-emerald-500/10",
    label: "bg-emerald-600 text-white",
  },
  amber: {
    icon: "text-amber-500",
    tile: "border-amber-500/20 bg-amber-500/10",
    label: "bg-amber-500 text-black",
  },
  rose: {
    icon: "text-rose-500",
    tile: "border-rose-500/20 bg-rose-500/10",
    label: "bg-rose-600 text-white",
  },
  violet: {
    icon: "text-violet-500",
    tile: "border-violet-500/20 bg-violet-500/10",
    label: "bg-violet-600 text-white",
  },
  slate: {
    icon: "text-muted-foreground",
    tile: "border-border bg-card/90",
    label: "bg-foreground text-background",
  },
} as const;

const ICONS: IconSpec[] = [
  { id: "hook-generator", label: "Hook Generator", Icon: Sparkles, accent: "blue" },
  { id: "caption-generator", label: "Caption Generator", Icon: Hash, accent: "violet" },
  { id: "email-writer", label: "Email Writer", Icon: Mail, accent: "emerald" },
  { id: "whatsapp-writer", label: "WhatsApp Writer", Icon: MessageCircle, accent: "emerald" },
  { id: "product-description", label: "Product Copy", Icon: Tag, accent: "amber" },
  { id: "reel-script", label: "Reel Script", Icon: Film, accent: "rose" },
  { id: "business-name", label: "Brand Names", Icon: Briefcase, accent: "blue" },
  { id: "gig-builder", label: "Gig Builder", Icon: BadgeDollarSign, accent: "emerald" },
  { id: "finance", label: "Finance", Icon: Wallet, accent: "emerald" },
  { id: "calendar", label: "Calendar", Icon: CalendarDays, accent: "blue" },
  { id: "reports", label: "Growth Reports", Icon: LineChart, accent: "amber" },
  { id: "notes", label: "Notes", Icon: FileText, accent: "slate" },
  { id: "link-saver", label: "Link Saver", Icon: Link2, accent: "blue" },
  { id: "offer-generator", label: "Offers", Icon: Target, accent: "rose" },
  { id: "meeting-summary", label: "Meeting Summary", Icon: ListChecks, accent: "slate" },
  { id: "color-palette", label: "Color Palette", Icon: Palette, accent: "violet" },
  { id: "font-pairing", label: "Font Pairing", Icon: Type, accent: "blue" },
  { id: "brand-style-guide", label: "Style Guide", Icon: BookOpen, accent: "amber" },
  { id: "moodboard-prompt", label: "Moodboard", Icon: ImageIcon, accent: "rose" },
  { id: "website-section", label: "Web Sections", Icon: LayoutTemplate, accent: "emerald" },
  { id: "portfolio-bio", label: "Portfolio Bio", Icon: UserCircle2, accent: "slate" },
  { id: "thumbnail-idea", label: "Thumbnails", Icon: PlaySquare, accent: "rose" },
  { id: "ad-banner-text", label: "Ad Banners", Icon: Megaphone, accent: "amber" },
  { id: "faceless-video", label: "Video Ideas", Icon: Video, accent: "blue" },
  { id: "voiceover-script", label: "Voiceover", Icon: Mic, accent: "violet" },
  { id: "hook-script-cta", label: "Script + CTA", Icon: Clapperboard, accent: "rose" },
  { id: "business-ideas", label: "Ideas", Icon: Lightbulb, accent: "amber" },
  { id: "restaurant", label: "Restaurant", Icon: UtensilsCrossed, accent: "rose" },
  { id: "gym", label: "Gym", Icon: Dumbbell, accent: "emerald" },
  { id: "real-estate", label: "Real Estate", Icon: Home, accent: "blue" },
  { id: "salon", label: "Salon", Icon: Scissors, accent: "violet" },
  { id: "doctor-clinic", label: "Clinic", Icon: Stethoscope, accent: "emerald" },
  { id: "coaching", label: "Coaching", Icon: GraduationCap, accent: "amber" },
];

function hash(n: number, seed: number) {
  const x = Math.sin(n * 9301 + seed * 49297) * 233280;
  return x - Math.floor(x);
}

type Placed = IconSpec & {
  left: number;
  top: number;
  size: number;
  driftX: number;
  driftY: number;
  rotate: number;
  duration: number;
  delay: number;
  depth: number;
  mobile: boolean;
};

export function FloatingIcons({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 55, damping: 18, mass: 0.35 });
  const pointerY = useSpring(rawY, { stiffness: 55, damping: 18, mass: 0.35 });
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (reduceMotion) return;

    function handlePointerMove(event: PointerEvent) {
      rawX.set(event.clientX / window.innerWidth - 0.5);
      rawY.set(event.clientY / window.innerHeight - 0.5);
    }

    function resetPointer() {
      rawX.set(0);
      rawY.set(0);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", resetPointer);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
    };
  }, [rawX, rawY, reduceMotion]);

  const placed: Placed[] = useMemo(() => {
    return ICONS.map((spec, index) => {
      const r1 = hash(index, 1);
      const r2 = hash(index, 2);
      const r3 = hash(index, 3);
      const r4 = hash(index, 4);
      const r5 = hash(index, 5);

      const ring = index % 3;
      const angle =
        (index / ICONS.length) * Math.PI * 2 + (ring - 1) * 0.2 + r1 * 0.28;
      const radiusX = ring === 0 ? 45 : ring === 1 ? 38 : 31;
      const radiusY = ring === 0 ? 37 : ring === 1 ? 31 : 25;
      const left = 50 + Math.cos(angle) * (radiusX + r2 * 5);
      const top = 50 + Math.sin(angle) * (radiusY + r3 * 5);
      const depth = 0.72 + ring * 0.16 + r5 * 0.16;
      const large = r4 > 0.78;

      return {
        ...spec,
        left,
        top,
        depth,
        size: large ? 62 : 46 + Math.round(r4 * 10),
        driftX: (r1 - 0.5) * (42 + ring * 10),
        driftY: (r2 - 0.5) * (48 + ring * 12),
        rotate: (r3 - 0.5) * 18,
        duration: 9 + r4 * 7 + ring,
        delay: r5 * 3.5,
        mobile: index % 3 !== 1,
      };
    });
  }, []);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <motion.div
        className="absolute left-1/2 top-1/2 hidden size-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/45 md:block"
        animate={reduceMotion ? {} : { rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 hidden size-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/30 lg:block"
        animate={reduceMotion ? {} : { rotate: -360 }}
        transition={{ duration: 95, repeat: Infinity, ease: "linear" }}
      />

      {placed.map((item) => (
        <FloatingIcon
          key={item.id}
          item={item}
          pointerX={pointerX}
          pointerY={pointerY}
          reduceMotion={!!reduceMotion}
          hovered={hovered === item.id}
          muted={hovered !== null && hovered !== item.id}
          onHover={(value) => setHovered(value ? item.id : null)}
        />
      ))}
    </div>
  );
}

function FloatingIcon({
  item,
  pointerX,
  pointerY,
  reduceMotion,
  hovered,
  muted,
  onHover,
}: {
  item: Placed;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  reduceMotion: boolean;
  hovered: boolean;
  muted: boolean;
  onHover: (value: boolean) => void;
}) {
  const { Icon, label, size, left, top, driftX, driftY, rotate, duration, delay, depth } =
    item;
  const accent = ACCENTS[item.accent];
  const [mounted, setMounted] = useState(false);

  const parallaxX = useTransform(
    pointerX,
    [-0.5, 0.5],
    reduceMotion ? [0, 0] : [-22 * depth, 22 * depth],
  );
  const parallaxY = useTransform(
    pointerY,
    [-0.5, 0.5],
    reduceMotion ? [0, 0] : [-18 * depth, 18 * depth],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 40 + delay * 80);
    return () => window.clearTimeout(timer);
  }, [delay]);

  const drift = reduceMotion
    ? {}
    : {
        x: [0, driftX, -driftX * 0.45, 0],
        y: [0, driftY, -driftY * 0.55, 0],
        rotate: [0, rotate, -rotate * 0.7, 0],
      };

  return (
    <motion.div
      className={cn(
        "absolute pointer-events-auto",
        item.mobile ? "block" : "hidden sm:block",
      )}
      style={{
        left: `${left}%`,
        top: `${top}%`,
        x: parallaxX,
        y: parallaxY,
        zIndex: hovered ? 40 : Math.round(depth * 10),
      }}
    >
      <motion.div
        className="relative"
        style={{ transform: "translate(-50%, -50%)" }}
        animate={drift}
        transition={
          reduceMotion
            ? { duration: 0.2 }
            : {
                x: { duration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                y: {
                  duration: duration * 1.08,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                },
                rotate: {
                  duration: duration * 1.2,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                },
              }
        }
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{
            opacity: mounted ? (hovered ? 1 : muted ? 0.28 : 0.78) : 0,
            scale: hovered ? 1.14 : 1,
          }}
          transition={{
            opacity: { duration: 0.28 },
            scale: { type: "spring", stiffness: 420, damping: 24 },
          }}
          onHoverStart={() => onHover(true)}
          onHoverEnd={() => onHover(false)}
          className={cn(
            "flex items-center justify-center rounded-lg border bg-card/90 shadow-sm backdrop-blur-md transition-colors",
            "hover:border-foreground/20 hover:bg-card",
            accent.tile,
          )}
          style={{
            width: size,
            height: size,
            boxShadow: hovered
              ? "0 18px 55px rgba(0,0,0,0.16)"
              : "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <Icon
            className={cn(
              "transition-colors",
              hovered ? "text-foreground" : accent.icon,
            )}
            size={Math.round(size * 0.43)}
            strokeWidth={1.7}
          />
        </motion.div>

        <motion.span
          initial={false}
          animate={{
            opacity: hovered ? 1 : 0,
            y: hovered ? 8 : 2,
            scale: hovered ? 1 : 0.96,
          }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className={cn(
            "absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium shadow-lg",
            accent.label,
          )}
        >
          {label}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

export default FloatingIcons;
