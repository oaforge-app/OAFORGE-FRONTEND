import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "@/utility/ProtectedRoutes";


import LoginPage            from "@/pages/auth/Login";
import RegisterPage         from "@/pages/auth/Register";
import AuthCallback         from "@/pages/AuthCallback";
import Dashboard            from "@/pages/Dashboard";
import CreateAssessmentPage from "@/pages/assessments/CreateAssessment";
import AssessmentPlanPage   from "@/pages/assessments/AssessmentPlan";
import TestScreenPage       from "./pages/test/TestScreen";
import ResultDetailPage     from "@/pages/results/ResultDetail";
import SettingsPage         from "./pages/auth/Settings";
import AuthGate             from "./utility/AuthGate";
import ResultsPage          from "./pages/results/Results";
import { ThemeProvider }    from "next-themes";
import NotFoundPage         from "./pages/NotFound";
import ForgotPasswordForm   from "./pages/auth/ForgotPass";
import LandingPage          from "./pages/LandingPage";
import { useSessionRevoked } from "./lib/useSessionRevoked";

// ── Root layout — no auth logic here ─────────────────────────────────────────
const RootLayout = () => (
  <>
    <Outlet />
    <Toaster />
  </>
);

// ── Protected layout — only mounts when user is authenticated ─────────────────
// useSessionRevoked is safe here because ProtectedRoute already confirmed
// the user is logged in before this component ever renders
const ProtectedLayout = () => {
  useSessionRevoked();
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { path: "", element: <AuthGate /> },

      // ── Public routes ─────────────────────────────────────────────────────
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
        path: "forgot-password",
        element: (
          <ProtectedRoute allowAuthenticated={false} redirectTo="/dashboard">
            <ForgotPasswordForm />
          </ProtectedRoute>
        ),
      },
      { path: "auth/callback", element: <AuthCallback /> },

      // ── Protected routes ──────────────────────────────────────────────────
      {
        element: (
          <ProtectedRoute allowAuthenticated={true} redirectTo="/login">
            <ProtectedLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard",           element: <Dashboard />            },
          { path: "settings",            element: <SettingsPage />         },
          { path: "assessment/new",      element: <CreateAssessmentPage /> },
          { path: "assessment/:id/plan", element: <AssessmentPlanPage />   },
          { path: "assessment/:id/test", element: <TestScreenPage />       },
          { path: "results",             element: <ResultsPage />          },
          { path: "results/:resultId",   element: <ResultDetailPage />     },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const AppWrapper = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  </ThemeProvider>
);

export default AppWrapper;