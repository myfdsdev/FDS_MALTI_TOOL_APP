import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <Card>
          <CardHeader className="space-y-1.5">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to continue to your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <LoginForm />
            <Divider>or</Divider>
            <GoogleButton onSuccess={() => navigate("/dashboard", { replace: true })} />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in you agree to our{" "}
          <Link to="/" className="underline-offset-4 hover:underline">Terms</Link>{" "}
          and{" "}
          <Link to="/" className="underline-offset-4 hover:underline">Privacy Policy</Link>.
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <BackgroundGradient />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <div className="size-7 rounded-md bg-primary" />
            <span className="font-semibold tracking-tight">Multitool</span>
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center px-6 pb-16">{children}</main>
      </div>
    </div>
  );
}

function BackgroundGradient() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(40% 30% at 80% 90%, color-mix(in oklch, var(--primary) 10%, transparent) 0%, transparent 70%)",
        }}
      />
    </>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center text-xs uppercase tracking-wide text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span className="px-3">{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
