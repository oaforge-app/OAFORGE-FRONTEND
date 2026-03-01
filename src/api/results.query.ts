// src/api/results.query.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";
import type {
  SectionResult,
  SectionResultDetail,
  ResultsSummary,
  Answer,
} from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubmitResultPayload {
  sessionId: string;
  answers: Answer[];
}

// ── Raw handlers ──────────────────────────────────────────────────────────────

const submitResultHandler = async (
  data: SubmitResultPayload
): Promise<SectionResultDetail> =>
  (await axiosServices.post<SectionResultDetail>("/results/submit", data)).data;

const getMyResultsHandler = async (): Promise<SectionResult[]> =>
  (await axiosServices.get<SectionResult[]>("/results/me")).data;

const getResultsSummaryHandler = async (): Promise<ResultsSummary> =>
  (await axiosServices.get<ResultsSummary>("/results/me/summary")).data;

const getResultDetailHandler = async (
  id: string
): Promise<SectionResultDetail> =>
  (await axiosServices.get<SectionResultDetail>(`/results/${id}`)).data;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useMyResults = () =>
  useQuery({
    queryKey: QUERY_KEY.my_results,
    queryFn: getMyResultsHandler,
    staleTime: 1000 * 30,
  });

export const useResultsSummary = () =>
  useQuery({
    queryKey: QUERY_KEY.results_summary,
    queryFn: getResultsSummaryHandler,
    staleTime: 1000 * 30,
  });

export const useResultDetail = (id: string) =>
  useQuery({
    queryKey: QUERY_KEY.result_detail(id),
    queryFn: () => getResultDetailHandler(id),
    staleTime: Infinity, // results never change after submission
    enabled: !!id,
  });

export const useSubmitResult = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitResultHandler,
    onSuccess: (data) => {
      toast.success(`${data.sectionName} submitted — ${data.accuracy}% 🎯`);
      // Clear active session — user goes back to dashboard
      qc.removeQueries({ queryKey: QUERY_KEY.active_session });
      qc.invalidateQueries({ queryKey: QUERY_KEY.reset_results });
      qc.invalidateQueries({ queryKey: QUERY_KEY.my_sections });
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message ?? "Failed to submit. Try again."
      ),
  });
};