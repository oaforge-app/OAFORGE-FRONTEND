// src/utility/ProtectedRoutes.tsx
//
// ROOT CAUSE OF THE LOOP (part 2):
// If ProtectedRoute renders a <Navigate> WHILE useUser() is still loading
// (isLoading=true, user=null), it redirects to /login immediately —
// before the /auth/me response even comes back.
// This causes the login page to load, then /auth/me resolves, sees the user,
// redirects back to /dashboard... or worse, loops.
//
// FIX:
// - While isLoading is true → show a spinner, render nothing
// - Only redirect AFTER the query has settled (isLoading = false)

import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@/api/auth.query";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  // allowAuthenticated=true  → only logged-in users can access (e.g. /dashboard)
  // allowAuthenticated=false → only logged-OUT users can access (e.g. /login)
  allowAuthenticated: boolean;
  redirectTo: string;
}

export default function ProtectedRoute({
  children,
  allowAuthenticated,
  redirectTo,
}: ProtectedRouteProps) {
  console.log(redirectTo);
  
  // On public routes (login/register) disable the /auth/me query entirely
  // so we don't fire an unnecessary request that always 401s.
  const isPublicRoute = !allowAuthenticated;
  const { user, loading } = useUser(!isPublicRoute);

  // ── While auth state is being determined, show nothing / spinner ──────────
  // This is the key fix: never redirect while loading=true.
  // Without this, the route redirects to /login before /auth/me responds,
  // then /auth/me comes back with user data, causing a redirect back, etc.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-7 h-7" />
      </div>
    );
  }

  // ── Auth settled ──────────────────────────────────────────────────────────

  // Protected route (allowAuthenticated=true): needs a logged-in user
  if (allowAuthenticated && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Public route (allowAuthenticated=false): should NOT be accessible when logged in
  if (!allowAuthenticated && user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children or nested routes
  return children ? <>{children}</> : <Outlet />;
}