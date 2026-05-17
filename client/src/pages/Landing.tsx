import { Link } from "react-router-dom";
import { Hero } from "@/components/landing/Hero";
import { Footer } from "@/components/landing/Footer";
import { buttonVariants } from "@/components/ui/button";

export default function Landing() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[80vh]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 70%)",
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

      <div className="overflow-hidden">
        <Hero />
      </div>
      <Footer />
    </main>
  );
}
