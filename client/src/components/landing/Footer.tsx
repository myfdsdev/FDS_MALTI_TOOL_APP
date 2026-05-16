import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-6 rounded-md bg-primary" />
          <span className="text-sm font-semibold tracking-tight">Multitool</span>
        </Link>
        <p className="text-xs text-muted-foreground">
          {new Date().getFullYear()} Multitool. AI and business tools, one workspace.
        </p>
        <nav className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/login" className="hover:text-foreground">
            Sign in
          </Link>
          <Link to="/register" className="hover:text-foreground">
            Get started
          </Link>
        </nav>
      </div>
    </footer>
  );
}
