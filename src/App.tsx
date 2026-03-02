// src/App.tsx

import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/utility/ProtectedRoutes";
import { logoutApiHandler, refreshTokenApiHandler } from "@/api/auth.query";

import LoginPage           from "@/pages/auth/Login";
import RegisterPage        from "@/pages/auth/Register";
import AuthCallback        from "@/pages/AuthCallback";
import Dashboard           from "@/pages/Dashboard";
import CreateAssessmentPage from "@/pages/assessments/CreateAssessment";
import AssessmentPlanPage  from "@/pages/assessments/AssessmentPlan";
import TestScreenPage from "./pages/test/TestScreen";
import ResultDetailPage    from "@/pages/results/ResultDetail";
import SettingsPage from "./pages/auth/Settings";
import { AuthGate } from "./utility/AuthGate";
import ResultsPage from "./pages/results/Results";
import { ThemeProvider } from "next-themes";
import NotFoundPage from "./pages/NotFound";

// ── Root layout ───────────────────────────────────────────────────────────────

const RootLayout = () => (
  <>
    <Outlet />
    <Toaster />
  </>
);

// ── Router ────────────────────────────────────────────────────────────────────

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
       {
        path: "",
        element: <AuthGate/>,
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
          { path: "dashboard",                       element: <Dashboard />            },
          { path: "settings",                        element: <SettingsPage />         },

          // Assessment flow
          { path: "assessment/new",                  element: <CreateAssessmentPage /> },
          { path: "assessment/:id/plan",             element: <AssessmentPlanPage />   },
          { path: "assessment/:id/test",             element: <TestScreenPage />        },

           // Results
          { path: "results",                         element: <ResultsPage />          },
          { path: "results/:resultId",               element: <ResultDetailPage />     },
        ],
      },

      // ── 404 ──────────────────────────────────────────────────────────────
      {
        path: "*",
        element: <NotFoundPage/>
      },
    ],
  },
]);

// ── AppWrapper ────────────────────────────────────────────────────────────────

const AppWrapper = () => {
    const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry(failureCount, error) {
          if ((error as any).status === 401) {
            try {
              refreshTokenApiHandler();
            } catch {
              logoutApiHandler();
            }
          }
          return true;
        },
      },
      mutations: {
        onError: async (error: any) => {
          if (error?.status === 401) {
            try {
              refreshTokenApiHandler();
            } catch {
              logoutApiHandler();
            }
          }
        },
      },
    },
  });

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
    </ThemeProvider>
  );
};

export default AppWrapper;