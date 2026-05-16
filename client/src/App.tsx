import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useQueryClient } from "@tanstack/react-query";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Business from "@/pages/Business";
import BusinessManagement from "@/pages/BusinessManagement";
import BusinessNotes from "@/pages/BusinessNotes";
import BusinessLinkSaver from "@/pages/BusinessLinkSaver";
import BusinessIdeas from "@/pages/BusinessIdeas";
import Resumes from "@/pages/Resumes";
import ResumeBuilderPage from "@/pages/ResumeBuilderPage";
import PublicResume from "@/pages/PublicResume";
import ReportsListPage from "@/pages/business/ReportsListPage";
import NewReportPage from "@/pages/business/NewReportPage";
import ReportViewerPage from "@/pages/business/ReportViewerPage";
import BusinessCalendarPage from "@/pages/business/BusinessCalendarPage";
import PublicReport from "@/pages/PublicReport";
import CategoryPage from "@/pages/CategoryPage";
import Tool from "@/pages/Tool";
import History from "@/pages/History";
import Project from "@/pages/Project";
import Profile from "@/pages/Profile";
import VerifyEmail from "@/pages/VerifyEmail";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import { AppShell } from "@/components/layout/AppShell";

import { useMe } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth.store";
import { setAuthFailureHandler } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
import { clearPrivateQueryData } from "@/lib/query-scope";

export default function App() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const reset = useAuthStore((s) => s.reset);
  const previousUserId = useRef<string | null>(userId);

  useMe();
  useTheme(); // apply persisted theme on mount

  useEffect(() => {
    setAuthFailureHandler(() => {
      reset();
      clearPrivateQueryData(queryClient);
    });
  }, [queryClient, reset]);

  useEffect(() => {
    if (previousUserId.current === userId) return;
    clearPrivateQueryData(queryClient, userId);
    previousUserId.current = userId;
  }, [queryClient, userId]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname.split("/")[1] || "root"}>
        <Route
          path="/"
          element={status === "authenticated" ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
        <Route
          path="/login"
          element={status === "authenticated" ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={status === "authenticated" ? <Navigate to="/dashboard" replace /> : <Register />}
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/r/:slug" element={<PublicResume />} />
        <Route path="/reports/r/:slug" element={<PublicReport />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/business" element={<BusinessManagement />} />
          <Route path="/business/projects" element={<Business />} />
          <Route path="/business/calendar" element={<BusinessCalendarPage />} />
          <Route path="/business/reports" element={<ReportsListPage />} />
          <Route path="/business/reports/new" element={<NewReportPage />} />
          <Route path="/business/reports/:id" element={<ReportViewerPage />} />
          <Route path="/business/notes" element={<BusinessNotes />} />
          <Route path="/business/link-saver" element={<BusinessLinkSaver />} />
          <Route path="/business/resumes" element={<Resumes />} />
          <Route path="/business/resumes/templates" element={<Navigate to="/business/resumes" replace />} />
          <Route path="/business/resumes/:id" element={<ResumeBuilderPage />} />
          <Route path="/business/projects/:projectId" element={<Project />} />
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
