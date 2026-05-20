import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Baseline,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  CircleUser,
  Clapperboard,
  Dumbbell,
  FileText,
  FileUser,
  GraduationCap,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  Lightbulb,
  LineChart,
  Link2,
  ListChecks,
  Mail,
  Megaphone,
  MessageCircle,
  Mic,
  MonitorPlay,
  Palette,
  PenTool,
  Scissors,
  Send,
  Sparkles,
  Stethoscope,
  Tag,
  Tags,
  Target,
  Terminal,
  Type,
  Utensils,
  Video,
  Wallet,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

// ── Right-hand "vertical ledger" — the running list of tools ─────────────────
const LEDGER: { label: string; icon: IconType }[] = [
  { label: "Hook Generator", icon: Sparkles },
  { label: "Caption Generator", icon: Type },
  { label: "Email Writer", icon: Mail },
  { label: "WhatsApp Writer", icon: MessageCircle },
  { label: "Product Copy", icon: Tag },
  { label: "Reel Script", icon: Clapperboard },
  { label: "Brand Names", icon: Tags },
  { label: "Gig Builder", icon: BriefcaseBusiness },
  { label: "Finance", icon: Wallet },
  { label: "Calendar", icon: Calendar },
  { label: "Growth Reports", icon: LineChart },
  { label: "Notes", icon: FileText },
  { label: "Link Saver", icon: Link2 },
  { label: "Offers", icon: Target },
  { label: "Meeting Summary", icon: ListChecks },
  { label: "Color Palette", icon: Palette },
  { label: "Font Pairing", icon: Baseline },
  { label: "Style Guide", icon: BookOpen },
  { label: "Moodboard", icon: ImageIcon },
  { label: "Web Sections", icon: LayoutTemplate },
  { label: "Portfolio Bio", icon: CircleUser },
  { label: "Thumbnails", icon: MonitorPlay },
  { label: "Ad Banners", icon: Megaphone },
  { label: "Video Ideas", icon: Video },
  { label: "Voiceover", icon: Mic },
  { label: "Script + CTA", icon: Send },
  { label: "Ideas", icon: Lightbulb },
  { label: "Restaurant", icon: Utensils },
  { label: "Gym", icon: Dumbbell },
  { label: "Real Estate", icon: Home },
  { label: "Salon", icon: Scissors },
  { label: "Clinic", icon: Stethoscope },
  { label: "Coaching", icon: GraduationCap },
];

const HERO_STATS: { label: string; value: string }[] = [
  { label: "AI tools", value: "52" },
  { label: "Workspaces", value: "06" },
  { label: "Exports", value: "PDF · DOCX · PPTX · XLSX" },
  { label: "Your data", value: "Owned, exportable" },
];

const LOGOS = ["NORTHWIND", "ASTERIA", "OAKLEY & CO", "PARALLAX", "MERIDIAN", "FIELDNOTE"];

const STEPS = [
  {
    n: "01",
    kicker: "SIGN IN",
    title: "Bring your own AI key.",
    text: "One key powers all 52 tools. No per-tool seats, no quota math, no surprise upgrades.",
  },
  {
    n: "02",
    kicker: "PICK A WORKSPACE",
    title: "Six places to do real work.",
    text: "Switch between Gigs, Finance, Reports, Resumes, Writing, and Projects without losing context.",
  },
  {
    n: "03",
    kicker: "SHIP",
    title: "Export, share, repeat.",
    text: "Every output comes in PDF, DOCX, XLSX, PPTX, or a public link. Nothing is locked inside the app.",
  },
];

const WORKSPACES: { title: string; tools: string; text: string; icon: IconType; to: string }[] = [
  { title: "Gig Builder", tools: "08", text: "Platform-ready gig copy, packages, FAQs & outreach.", icon: BriefcaseBusiness, to: "/gigs" },
  { title: "Finance", tools: "06", text: "Expenses, salary, budgets, savings — all in one ledger.", icon: Wallet, to: "/finance" },
  { title: "Growth Reports", tools: "04", text: "Turn a business URL into a practical next-step report.", icon: LineChart, to: "/business/reports" },
  { title: "Resume Studio", tools: "05", text: "Polished resumes from a single profile, multiple templates.", icon: FileUser, to: "/business/resumes" },
  { title: "AI Writing", tools: "18", text: "Hooks, captions, emails, scripts, descriptions, names.", icon: PenTool, to: "/business-ideas" },
  { title: "Projects", tools: "06", text: "Tasks, calendar, notes, links, ideas — your operating system.", icon: LayoutGrid, to: "/business" },
];

function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono uppercase tracking-[0.18em]", className)}>{children}</span>;
}

export default function Landing() {
  // Rotate the "now exploring" tool name to make the console feel alive.
  const [exploreIdx, setExploreIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setExploreIdx((i) => (i + 1) % LEDGER.length), 1900);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <style>{LEDGER_CSS}</style>

      {/* hairline grid backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_55%,transparent)_1px,transparent_1px)] bg-[size:80px_80px] opacity-[0.35]" />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
              <Terminal className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">Multitool</span>
          </Link>
          <span className="hidden items-center gap-1.5 sm:flex">
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
            <Mono className="text-[10px] text-muted-foreground">All systems normal</Mono>
          </span>
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          {["Product", "Pricing", "Docs"].map((item) => (
            <a key={item} href="#inside" className="text-xs">
              <Mono className="text-[11px] text-muted-foreground transition-colors hover:text-foreground">
                {item}
              </Mono>
            </a>
          ))}
          <Link to="/login">
            <Mono className="text-[11px] text-muted-foreground transition-colors hover:text-foreground">
              Login
            </Mono>
          </Link>
        </nav>

        <Link to="/register" className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
          Get started <ArrowRight className="size-3.5" />
        </Link>
      </header>

      {/* ── Hero (split) ─────────────────────────────────────────────────── */}
      <section className="relative z-10 mx-auto grid max-w-6xl items-start gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pt-12">
        {/* left: copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
            <Terminal className="size-3 text-primary" />
            <Mono className="text-[10px] text-muted-foreground">For independent operators</Mono>
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            The workspace for the
            <br />
            <span className="text-primary">one-person company.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Run your gigs, your books, your reports, and your writing from a single, calm canvas.
            Multitool is fifty-two AI tools and six workspaces, fused into one product, powered by
            one key — yours.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/register" className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
              Create account <ArrowRight className="size-4" />
            </Link>
            <a href="#how" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
              Read the manifesto →
            </a>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="bg-card p-4">
                <dt>
                  <Mono className="text-[9px] text-muted-foreground">{s.label}</Mono>
                </dt>
                <dd className="mt-1.5 font-mono text-sm font-semibold leading-snug">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* right: vertical ledger */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-400/70" />
                <span className="size-2 rounded-full bg-amber-400/70" />
                <span className="size-2 rounded-full bg-emerald-400/70" />
              </div>
              <Mono className="text-[9px] text-muted-foreground">tools.ledger</Mono>
            </div>

            <div className="ledger-mask relative h-[420px] overflow-hidden">
              <div className="ledger-track">
                {[...LEDGER, ...LEDGER].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={`${item.label}-${i}`}
                      className="flex items-center gap-3 border-b border-border/60 px-4 py-3"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                      <Mono className="ml-auto text-[9px] text-muted-foreground">ready</Mono>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* now exploring panel */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <Mono className="text-[9px] text-muted-foreground">Now exploring</Mono>
            <p className="mt-1 text-lg font-semibold tracking-tight">{LEDGER[exploreIdx].label}</p>
            <div className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
              {[
                ["Type", "AI Writing"],
                ["Outputs", "×8 variants"],
                ["Ship", "2.4s avg"],
              ].map(([k, v]) => (
                <div key={k} className="bg-card p-3">
                  <Mono className="text-[8px] text-muted-foreground">{k}</Mono>
                  <p className="mt-1 font-mono text-xs font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo strip ───────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-7 text-center">
          <Mono className="text-[10px] text-muted-foreground">In use by independent operators at</Mono>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {LOGOS.map((l) => (
              <span key={l} className="font-mono text-sm font-semibold tracking-tight text-muted-foreground/70">
                {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <header className="max-w-2xl">
          <Mono className="text-[10px] text-primary">How it works</Mono>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Three commands. The rest is craft.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Multitool is opinionated about the boring parts so you can be opinionated about the work.
          </p>
        </header>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="bg-card p-6">
              <span className="font-mono text-3xl font-semibold text-muted-foreground/40">{step.n}</span>
              <div className="mt-4">
                <Mono className="text-[10px] text-primary">{step.kicker}</Mono>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── What's inside ────────────────────────────────────────────────── */}
      <section id="inside" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <header className="max-w-2xl">
            <Mono className="text-[10px] text-primary">What&apos;s inside</Mono>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Six workspaces. One rhythm.
            </h2>
          </header>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WORKSPACES.map((w) => {
              const Icon = w.icon;
              return (
                <Link
                  key={w.title}
                  to={w.to}
                  className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-md border border-border bg-background text-primary">
                      <Icon className="size-5" />
                    </span>
                    <Mono className="text-[9px] text-muted-foreground">{w.tools} tools</Mono>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <h3 className="font-semibold">{w.title}</h3>
                    <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{w.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── BYOK CTA ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col items-start justify-between gap-8 rounded-2xl border border-border bg-foreground px-8 py-12 text-background lg:flex-row lg:items-center">
          <div>
            <Mono className="text-[10px] text-background/60">Free forever, BYOK</Mono>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Bring your own key.
              <br />
              Keep all your work.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 rounded-md bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:opacity-90"
            >
              Create account <ArrowRight className="size-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 rounded-md border border-background/30 px-5 py-2.5 text-sm font-medium text-background transition hover:bg-background/10"
            >
              Read the docs
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-background">
              <Terminal className="size-3.5" />
            </span>
            <span className="font-semibold tracking-tight">Multitool</span>
          </div>
          <p>
            <Mono className="text-[10px] text-muted-foreground">
              © 2026 Multitool — run by one operator, used by many
            </Mono>
          </p>
          <nav className="flex items-center gap-5">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Sign in</Link>
            <a href="#inside" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">Changelog</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
          </nav>
        </div>
      </footer>
    </main>
  );
}

// Vertical marquee for the ledger. The list is rendered twice and the track
// scrolls up by 50% for a seamless loop. Pauses for reduced-motion users.
const LEDGER_CSS = `
.ledger-mask {
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
}
.ledger-track {
  display: flex;
  flex-direction: column;
  animation: ledger-scroll 36s linear infinite;
}
.ledger-track:hover { animation-play-state: paused; }
@keyframes ledger-scroll {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .ledger-track { animation: none; }
}
`;
