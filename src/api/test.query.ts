// src/api/test.query.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";
import type { TestSession, Answer } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateSessionPayload {
  sectionTemplateId: string;
  questionCount: number;
  duration: number; // minutes
  groqApiKey?: string;
}

export interface UpdateSessionPayload {
  answers: Answer[];
  currentIndex: number;
}

// ── Raw handlers ──────────────────────────────────────────────────────────────

const createSessionHandler = async (
  data: CreateSessionPayload
): Promise<TestSession> =>
  (await axiosServices.post<TestSession>("/test/session", data)).data;

const getActiveSessionHandler = async (): Promise<TestSession | null> =>
  (await axiosServices.get<TestSession | null>("/test/session/active")).data;

const getSessionHandler = async (id: string): Promise<TestSession> =>
  (await axiosServices.get<TestSession>(`/test/session/${id}`)).data;

const updateSessionHandler = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateSessionPayload;
}) => (await axiosServices.patch(`/test/session/${id}`, data)).data;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useActiveSession = (enabled = true) =>
  useQuery({
    queryKey: QUERY_KEY.active_session,
    queryFn: getActiveSessionHandler,
    staleTime: 0,
    retry: false,
    enabled,
  });

export const useSession = (id: string) =>
  useQuery({
    queryKey: QUERY_KEY.session(id),
    queryFn: () => getSessionHandler(id),
    staleTime: 1000 * 60,
    enabled: !!id,
  });

export const useCreateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSessionHandler,
    onSuccess: (session) => {
      // Seed active session cache — no extra GET needed
      qc.setQueryData(QUERY_KEY.active_session, session);
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message ?? "Failed to start test. Try again."
      ),
  });
};

// Silent auto-save — no toast on error so it doesn't interrupt the test
export const useUpdateSession = () =>
  useMutation({
    mutationFn: updateSessionHandler,
    onError: (e: any) =>
      console.error(
        "Auto-save failed:",
        e?.response?.data?.message ?? e.message
      ),
  });