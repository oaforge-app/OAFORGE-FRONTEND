// src/hooks/useSessionRevoked.ts
// Add this hook to your root layout or App component.
// It polls /auth/me every 30s — if it gets a 401 that the interceptor
// can't recover from (refresh token gone), the interceptor already
// redirects to /login. This hook handles the edge case where the user
// is idle (no requests firing) when their session is revoked.

import { useEffect } from "react";
import { axiosServices } from "@/lib/axios";

export function useSessionRevoked() {
  useEffect(() => {
    // Poll silently every 30 seconds
    const interval = setInterval(async () => {
      try {
        await axiosServices.get("/auth/me");
      } catch {
        // If /me fails AND refresh fails, axios interceptor handles redirect.
        // Nothing to do here — the interceptor does window.location.href = "/login"
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);
}