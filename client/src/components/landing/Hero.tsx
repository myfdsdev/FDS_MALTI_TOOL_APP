import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

import { FloatingIcons } from "@/components/landing/FloatingIcons";

export function Hero() {
  return (
    <section className="relative mx-auto flex min-h-[72vh] max-w-6xl items-center justify-center px-6 py-12">
      <FloatingIcons />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-3xl text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          AI and business tools in one workspace
        </span>
        <h1 className="mt-5 text-balance text-5xl font-semibold leading-tight sm:text-6xl">
          Every tool your business needs, in one calm place.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-base leading-7 text-muted-foreground sm:text-lg">
          Generate gigs, organize finance, write better marketing, build resumes,
          save links, and create growth reports without jumping between apps.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Start free <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/login"
            className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium transition hover:bg-accent"
          >
            Sign in
          </Link>
        </div>

        <div className="mx-auto mt-10 grid max-w-xl grid-cols-3 divide-x divide-border rounded-lg border border-border bg-card/70 text-left shadow-sm backdrop-blur">
          <Metric value="52+" label="AI tools" />
          <Metric value="7" label="Workspaces" />
          <Metric value="1" label="AI key" />
        </div>
      </motion.div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
