// src/lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import { refreshTokenApiHandler } from "@/api/auth.query";

/**
 * Factory function — call once per app mount, not a module-level singleton.
 * This matches your AppWrapper pattern: new QueryClient() inside the component.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          if (error?.response?.status === 401) return false;
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60, // 1 minute
      },
      mutations: {
        onError: async (error: any) => {
          if (error?.response?.status === 401) {
            try {
              await refreshTokenApiHandler();
            } catch {
              window.location.href = "/login";
            }
          }
        },
      },
    },
  });