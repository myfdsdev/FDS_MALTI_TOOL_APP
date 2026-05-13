import { Link } from "react-router-dom";
import { FloatingIcons } from "@/components/landing/FloatingIcons";
import { buttonVariants } from "@/components/ui/button";

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 40%, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 70%)",
        }}
      />

      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-7 rounded-md bg-primary" />
          <span className="font-semibold tracking-tight">Multitool</span>
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

      <section className="relative mx-auto flex h-[78vh] max-w-6xl items-center justify-center px-6">
        <FloatingIcons />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            28 AI tools · One workspace
          </span>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
            Every AI tool your business needs, in one place.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Hooks, captions, emails, brand kits, video scripts, local ads — generate them
            all from a single, fast workspace.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
            >
              Start free
            </Link>
            <Link
              to="/login"
              className="inline-flex h-11 items-center justify-center rounded-md border border-border bg-card px-6 text-sm font-medium hover:bg-accent"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
