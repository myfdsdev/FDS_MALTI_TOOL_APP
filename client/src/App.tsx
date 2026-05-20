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
import FinanceDashboardPage from "@/pages/finance/FinanceDashboardPage";
import FinanceTransactionsPage from "@/pages/finance/TransactionsPage";
import FinanceBudgetsPage from "@/pages/finance/BudgetsPage";
import FinanceSavingsGoalsPage from "@/pages/finance/SavingsGoalsPage";
import PublicReport from "@/pages/PublicReport";
import GigsLibrary from "@/pages/gigs/GigsLibrary";
import NewGigPage from "@/pages/gigs/NewGigPage";
import GigViewerPage from "@/pages/gigs/GigViewerPage";
import PublicGig from "@/pages/PublicGig";
import CategoryPage from "@/pages/CategoryPage";
import Tool from "@/pages/Tool";
import History from "@/pages/History";
import Project from "@/pages/Project";
import Profile from "@/pages/Profile";
import VerifyEmail from "@/pages/VerifyEmail";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import { AppShell } from "@/components/layout/AppShell";
import { WorkspaceGate } from "@/components/common/WorkspaceGate";

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
        <Route path="/gigs/g/:slug" element={<PublicGig />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/business" element={<BusinessManagement />} />
          <Route path="/business/projects" element={<WorkspaceGate workspace="projects"><Business /></WorkspaceGate>} />
          <Route path="/business/calendar" element={<WorkspaceGate workspace="calendar"><BusinessCalendarPage /></WorkspaceGate>} />
          <Route path="/business/reports" element={<WorkspaceGate workspace="reports"><ReportsListPage /></WorkspaceGate>} />
          <Route path="/business/reports/new" element={<WorkspaceGate workspace="reports"><NewReportPage /></WorkspaceGate>} />
          <Route path="/business/reports/:id" element={<WorkspaceGate workspace="reports"><ReportViewerPage /></WorkspaceGate>} />
          <Route path="/business/notes" element={<WorkspaceGate workspace="notes"><BusinessNotes /></WorkspaceGate>} />
          <Route path="/business/link-saver" element={<WorkspaceGate workspace="link-saver"><BusinessLinkSaver /></WorkspaceGate>} />
          <Route path="/business/resumes" element={<WorkspaceGate workspace="resumes"><Resumes /></WorkspaceGate>} />
          <Route path="/business/resumes/templates" element={<Navigate to="/business/resumes" replace />} />
          <Route path="/business/resumes/:id" element={<WorkspaceGate workspace="resumes"><ResumeBuilderPage /></WorkspaceGate>} />
          <Route path="/business/projects/:projectId" element={<WorkspaceGate workspace="projects"><Project /></WorkspaceGate>} />
          <Route path="/finance" element={<WorkspaceGate workspace="finance"><FinanceDashboardPage /></WorkspaceGate>} />
          <Route path="/finance/transactions" element={<WorkspaceGate workspace="finance"><FinanceTransactionsPage /></WorkspaceGate>} />
          <Route path="/finance/budgets" element={<WorkspaceGate workspace="finance"><FinanceBudgetsPage /></WorkspaceGate>} />
          <Route path="/finance/savings-goals" element={<WorkspaceGate workspace="finance"><FinanceSavingsGoalsPage /></WorkspaceGate>} />
          <Route path="/business-ideas" element={<WorkspaceGate workspace="ideas"><BusinessIdeas /></WorkspaceGate>} />
          <Route path="/gigs" element={<GigsLibrary />} />
          <Route path="/gigs/new" element={<NewGigPage />} />
          <Route path="/gigs/:id" element={<GigViewerPage />} />
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
    return <Navigate to="/" replace state={{ from: location }} />;
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
