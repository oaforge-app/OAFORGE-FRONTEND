
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";
import type { User } from "@/types";
// ── Types ─────────────────────────────────────────────────────────────────────

export interface LoginPayload { email: string; password: string; }
// auth.query.ts
export interface RegisterPayload {
  firstName: string;
  lastName?: string;
  email: string;
  passWord: string;   // ← was: password
  branch?: string;
}
// ── Raw handlers ──────────────────────────────────────────────────────────────

export const getMeHandler = async (): Promise<User | null> => {
  try {
    const res = await axiosServices.get<any>("/auth/me");
    return res.data.data;
  } catch (err: any) {
    if (err.response?.status === 401) return null;
    throw err;
  }
};

export const loginApiHandler = async (d: LoginPayload) =>
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

export const useUser = (enabled = true) => {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: QUERY_KEY.me,
    queryFn: getMeHandler,
    enabled,
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
  console.log(user);

  return {
    user: user ?? null,
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


export const useLogout = () => {
  const qc = useQueryClient();
  const logout = async () => {
    try {
      await axiosServices.get("/auth/logout");
    } catch {
    } finally {
      qc.clear();
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