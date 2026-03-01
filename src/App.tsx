// src/App.tsx
//
// Additional loop-prevention here:
// - queryClient is created ONCE with useMemo (not on every render)
// - refreshTokenApiHandler is called once on mount in AppWrapper
//   but its failure is completely silent — no redirect
// - RouterProvider is the direct child of QueryClientProvider

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useMemo, useEffect } from "react";

import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/utility/ProtectedRoutes";
import { refreshTokenApiHandler } from "@/api/auth.query";
import { createQueryClient } from "@/lib/queryClient";

import LoginPage        from "@/pages/Login";
import RegisterPage     from "@/pages/Register";
import AuthCallback     from "@/pages/AuthCallback";
import Dashboard        from "@/pages/Dashboard";
import TestScreenPage   from "@/pages/TestScreen";
import ResultDetailPage from "@/pages/ResultDetail";

// ── Root layout ───────────────────────────────────────────────────────────────

const RootLayout = () => (
  <>
    <Outlet />
    <Toaster />
  </>
);

// ── Router (defined outside component — stable reference, never recreated) ────

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      // Root: unauthenticated → show login, authenticated → go to dashboard
      {
        index: true,
        element: (
          <ProtectedRoute allowAuthenticated={false} redirectTo="/dashboard">
            <LoginPage />
          </ProtectedRoute>
        ),
      },

      // ── Public routes (logged-OUT only) ──────────────────────────────────
      {
        path: "login",
        element: (
          <ProtectedRoute allowAuthenticated={false} redirectTo="/dashboard">
            <LoginPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "register",
        element: (
          <ProtectedRoute allowAuthenticated={false} redirectTo="/dashboard">
            <RegisterPage />
          </ProtectedRoute>
        ),
      },
      {
        // Google OAuth lands here — always accessible regardless of auth state
        path: "auth/callback",
        element: <AuthCallback />,
      },

      // ── Protected routes (logged-IN only) ────────────────────────────────
      {
        element: (
          <ProtectedRoute allowAuthenticated={true} redirectTo="/login">
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard",         element: <Dashboard /> },
          { path: "test/:sessionId",   element: <TestScreenPage /> },
          { path: "results/:resultId", element: <ResultDetailPage /> },
        ],
      },

      // ── 404 ──────────────────────────────────────────────────────────────
      {
        path: "*",
        element: (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-3">
              <h1 className="text-5xl font-bold">404</h1>
              <p className="text-muted-foreground">Page not found</p>
              <a href="/login" className="text-sm text-primary hover:underline block">
                ← Go to Login
              </a>
            </div>
          </div>
        ),
      },
    ],
  },
]);

// ── AppWrapper ────────────────────────────────────────────────────────────────

const AppWrapper = () => {
  // useMemo so the QueryClient is created ONCE, not on every render
  const queryClient = useMemo(() => createQueryClient(), []);

  useEffect(() => {
    // Attempt a silent token refresh on first app load.
    // If it fails, do NOTHING — no redirect, no error.
    // ProtectedRoute will handle redirecting to /login if the user is unauthenticated.
    refreshTokenApiHandler().catch(() => {
      // Silently ignore — user just doesn't have a refresh token yet
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
};

export default AppWrapper;