// src/hooks/useSessionRevoked.ts
import { useEffect, useRef } from "react";
import { axiosServices } from "@/lib/axios";
import { useUser } from "@/api/auth.query";

export function useSessionRevoked() {
  const { user, loading } = useUser();
  const redirecting = useRef(false);

  useEffect(() => {
    // Don't poll if not logged in or still loading
    if (loading || !user) return;

    const PUBLIC_PATHS = ["/login", "/register", "/forgot-password"];
    if (PUBLIC_PATHS.some(p => window.location.pathname.startsWith(p))) return;

    const interval = setInterval(async () => {
      if (redirecting.current) return;
      try {
        await axiosServices.get("/auth/me");
      } catch {
        redirecting.current = true;
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [user, loading]); // re-runs when auth state changes
}