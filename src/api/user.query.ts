import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";
import type { User } from "@/types";

// ── Raw handlers ──────────────────────────────────────────────────────────────

const getProfileHandler = async (): Promise<User> =>
  (await axiosServices.get<{ data: User }>("/user/me")).data.data;

const updateProfileHandler = async (data: {
  firstName?: string;
  lastName?: string;
  branch?: string;
  college?: string;
  graduationYear?: number;
}): Promise<User> =>
  (await axiosServices.patch<User>("/user/profile", data)).data;

const saveGroqKeyHandler = async (groqApiKey: string): Promise<void> =>
  (await axiosServices.post("/user/groq-key", { groqApiKey })).data;

const removeGroqKeyHandler = async (): Promise<void> =>
  (await axiosServices.delete("/user/groq-key")).data;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useProfile = () =>
  useQuery({
    queryKey: QUERY_KEY.user_profile,
    queryFn: getProfileHandler,
    staleTime: 1000 * 60 * 5,
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfileHandler,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY.user_profile });
      qc.invalidateQueries({ queryKey: QUERY_KEY.me });
      toast.success("Profile updated");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to update profile."),
  });
};

export const useSaveGroqKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveGroqKeyHandler,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY.me });
      qc.invalidateQueries({ queryKey: QUERY_KEY.user_profile });
      toast.success("Groq API key saved");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to save API key."),
  });
};

export const useRemoveGroqKey = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeGroqKeyHandler,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY.me });
      qc.invalidateQueries({ queryKey: QUERY_KEY.user_profile });
      toast.success("Groq API key removed");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to remove API key."),
  });
};