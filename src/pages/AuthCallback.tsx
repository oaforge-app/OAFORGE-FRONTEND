// src/pages/AuthCallback.tsx
// Called after Google OAuth redirect.
// Backend redirects to: FRONTEND_URL/auth/callback?success=true
// OR: FRONTEND_URL/auth/callback?error=some_error
//
// This matches your existing AuthCallback component exactly.

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { QUERY_KEY } from "@/lib/config";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      toast.success("Successfully signed in with Google!");

      // Cookie is already set by backend.
      // Invalidate user query so ProtectedRoute fetches /auth/me.
      queryClient.invalidateQueries({ queryKey: QUERY_KEY.me });

      // Small delay to ensure cookies are properly set
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 500);
    } else if (error) {
      toast.error("Authentication failed. Please try again.");
      navigate("/login", { replace: true });
    } else {
      toast.error("Authentication error. Please try again.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, queryClient]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">Completing sign in...</h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
}