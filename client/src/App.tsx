import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import BusinessIdeas from "@/pages/BusinessIdeas";
import CategoryPage from "@/pages/CategoryPage";
import Tool from "@/pages/Tool";
import History from "@/pages/History";
import Profile from "@/pages/Profile";
import VerifyEmail from "@/pages/VerifyEmail";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import { AppShell } from "@/components/layout/AppShell";

import { useMe } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth.store";
import { setAuthFailureHandler } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";

export default function App() {
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const reset = useAuthStore((s) => s.reset);

  useMe();
  useTheme(); // apply persisted theme on mount

  useEffect(() => {
    setAuthFailureHandler(() => reset());
  }, [reset]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split("/")[1] || "root"}>
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={status === "authenticated" ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={status === "authenticated" ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/business-ideas" element={<BusinessIdeas />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/tools/:toolId" element={<Tool />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }
  if (status !== "authenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
