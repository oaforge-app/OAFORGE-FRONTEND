// src/hooks/useSessionRevoked.ts
// Only ever mounted inside ProtectedLayout — user is guaranteed authenticated.
// No path checks, no useUser call, no race conditions.
import { useEffect, useRef } from "react";
import { axiosServices } from "@/lib/axios";

export function useSessionRevoked() {
  const redirecting = useRef(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (redirecting.current) return;
      try {
        await axiosServices.get("/auth/me");
      } catch {
        redirecting.current = true;
        // axios interceptor handles the 401 → refresh → redirect chain
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, []);
}