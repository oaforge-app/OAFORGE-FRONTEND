// src/api/user.query.ts
// Backend: POST /user/change-password (jwt guard)
// No /user/profile endpoint exists yet in your backend — only change-password

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

const changePasswordApiHandler = async (data: ChangePasswordPayload) => {
  const res = await axiosServices.post("/user/change-password", data);
  return res.data;
};

/**
 * useChangePassword — returns the mutation directly.
 *
 * Usage:
 *   const changePassword = useChangePassword();
 *   changePassword.mutate({ currentPassword, newPassword });
 */
export const useChangePassword = () =>
  useMutation({
    mutationFn: changePasswordApiHandler,
    onSuccess: (data) => {
      toast.success(data?.message ?? "Password changed successfully.");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.message ?? "Failed to change password.");
    },
  });