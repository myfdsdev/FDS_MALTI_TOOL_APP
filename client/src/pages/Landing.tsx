import { Link } from "react-router-dom";
import { ArrowRight, BriefcaseBusiness, LineChart, Wallet } from "lucide-react";

import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/landing/Footer";
import { buttonVariants } from "@/components/ui/button";

const HIGHLIGHTS = [
  {
    title: "Gig Builder",
    text: "Create platform-ready gig copy, packages, FAQs, and outreach.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Finance",
    text: "Track expenses, salary, budgets, and savings goals in one place.",
    icon: Wallet,
  },
  {
    title: "Growth Reports",
    text: "Turn business URLs into practical ideas and next-step reports.",
    icon: LineChart,
  },
];

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,color-mix(in_oklch,var(--border)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--border)_55%,transparent)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary" />
          <span className="font-semibold">Multitool</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Sign in
          </Link>
          <Link to="/register" className={buttonVariants({ size: "sm" })}>
            Get started
          </Link>
        </nav>
      </header>

      <div className="overflow-hidden">
        <Hero />
      </div>

      <section className="mx-auto grid max-w-6xl gap-3 px-6 pb-16 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              to={item.title === "Gig Builder" ? "/gigs" : item.title === "Finance" ? "/finance" : "/business/reports"}
              className="group rounded-lg border border-border bg-card/80 p-5 shadow-sm backdrop-blur transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold">{item.title}</h2>
                <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </Link>
          );
        })}
      </section>

      <Footer />
    </main>
  );
}
