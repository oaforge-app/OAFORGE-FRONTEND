// src/utility/HomeRedirect.tsx
import { useUser } from "@/api/auth.query";
import { Navigate } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import { Spinner } from "@/components/ui/spinner";

export default function AuthGate() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-7 h-7" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
}