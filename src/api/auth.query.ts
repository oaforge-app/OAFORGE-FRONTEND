// src/api/auth.query.ts  (replace your existing file with this)
//
// Key fix in useUser():
// - enabled param controls whether /auth/me fires at all
// - ProtectedRoute passes enabled=false on public routes (login/register)
//   so the query never runs and never 401s on those pages
// - retry: false means a 401 is NOT retried (no 3x hammering the server)
// - getMeHandler catches 401 and returns null instead of throwing
//   so the query settles to { data: null } instead of { error: 401 }

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";
import type { User } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LoginPayload    { email: string; password: string; }
export interface RegisterPayload { firstName: string; lastName?: string; email: string; password: string; branch?: string; }

// ── Raw handlers ──────────────────────────────────────────────────────────────

export const getMeHandler = async (): Promise<User | null> => {
  try {
    const res = await axiosServices.get<User>("/auth/me");
    return res.data;
  } catch (err: any) {
    // Return null on 401 — don't throw.
    // This means useQuery settles to data=null (unauthenticated) instead of error state.
    // ProtectedRoute then sees user=null and does a clean Navigate redirect.
    if (err.response?.status === 401) return null;
    throw err;
  }
};

export const loginApiHandler    = async (d: LoginPayload) =>
  (await axiosServices.post("/auth/login", d)).data;

export const registerApiHandler = async (d: RegisterPayload) =>
  (await axiosServices.post("/auth/register", d)).data;

export const logoutApiHandler = async () =>
  (await axiosServices.get("/auth/logout")).data;

export const forgotPasswordApiHandler = async (d: { email: string }) =>
  (await axiosServices.post("/auth/forgot-password", d)).data;

export const resetPasswordApiHandler = async (d: {
  email: string; otp: string; newPassword: string;
}) => (await axiosServices.post("/auth/reset-password", d)).data;

export const refreshTokenApiHandler = async () =>
  (await axiosServices.get("/auth/refresh-token")).data;

// ── Hooks ─────────────────────────────────────────────────────────────────────

/**
 * useUser(enabled?)
 *
 * enabled=true  (default) → fires GET /auth/me, used on protected routes
 * enabled=false           → query is disabled entirely, used on public routes
 *
 * Returns { user: User|null, loading: boolean }
 * loading is false immediately when enabled=false (no request made).
 */
export const useUser = (enabled = true) => {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: QUERY_KEY.me,
    queryFn: getMeHandler,
    enabled,          // ← disables query on public routes
    retry: false,     // ← don't retry 401s
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return {
    user: user ?? null,
    // When disabled, isLoading would be false anyway, but be explicit:
    loading: enabled ? isLoading : false,
  };
};

/**
 * useSignIn — returns { loginMutation }
 * Matches your existing SignInForm hook shape exactly.
 */
export const useSignIn = () => {
  const qc = useQueryClient();
  const loginMutation = useMutation({
    mutationFn: loginApiHandler,
    onSuccess: (data) => {
      toast.success(data?.message ?? "Login successful");
      // Invalidate /auth/me so ProtectedRoute re-evaluates after cookie is set
      qc.invalidateQueries({ queryKey: QUERY_KEY.me });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Login failed. Please try again.");
    },
  });
  return { loginMutation };
};

/**
 * useRegister — returns { registerMutation }
 * Matches your existing SignUpForm hook shape exactly.
 */
export const useRegister = () => {
  const qc = useQueryClient();
  const registerMutation = useMutation({
    mutationFn: registerApiHandler,
    onSuccess: (data) => {
      toast.success(data?.message ?? "Registration successful");
      qc.invalidateQueries({ queryKey: QUERY_KEY.me });
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Registration failed. Please try again.");
    },
  });
  return { registerMutation };
};

/**
 * useLogout — returns { logout }
 * Uses React Router navigate instead of window.location to avoid page reload loop.
 */
export const useLogout = () => {
  const qc = useQueryClient();
  const logout = async () => {
    try {
      await axiosServices.get("/auth/logout");
    } catch {
      // Ignore errors — we're logging out regardless
    } finally {
      qc.clear();
      // Use window.location ONLY here (intentional logout, not a loop)
      window.location.href = "/login";
    }
  };
  return { logout };
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: forgotPasswordApiHandler,
    onSuccess: (data) =>
      toast.success(data?.message ?? "Reset email sent. Check your inbox."),
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to send reset email."),
  });

export const useResetPassword = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resetPasswordApiHandler,
    onSuccess: (data) => {
      toast.success(data?.message ?? "Password reset. Please log in.");
      qc.invalidateQueries({ queryKey: QUERY_KEY.me });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to reset password."),
  });
};