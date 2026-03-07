// src/api/sessions.query.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";

export interface Session {
  id:         string;
  ip:         string | null;
  location:   string | null;
  browser:    string | null;
  os:         string | null;
  device:     string | null;
  createdAt:  string;
  lastUsedAt: string | null;
  isCurrent:  boolean;         // ← new
}

const SESSIONS_KEY = ["sessions"];

export const useGetSessions = () =>
  useQuery<Session[]>({
    queryKey: SESSIONS_KEY,
    queryFn: async () => {
      const res = await axiosServices.get("/auth/sessions");
      return res.data.sessions;
    },
    staleTime: 1000 * 30,
  });

export const useRevokeSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      axiosServices.delete(`/auth/sessions/${sessionId}`).then(r => r.data),
    onSuccess: () => {
      toast.success("Session signed out");
      qc.invalidateQueries({ queryKey: SESSIONS_KEY });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to revoke session"),
  });
};