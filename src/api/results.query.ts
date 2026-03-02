import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";
import type { MyResultsResponse, ResultDetail } from "@/types";

// ── Raw handlers ──────────────────────────────────────────────────────────────

const getMyResultsHandler = async (): Promise<MyResultsResponse> =>
  (await axiosServices.get<MyResultsResponse>("/results")).data;

const getResultDetailHandler = async (id: string): Promise<ResultDetail> =>
  (await axiosServices.get<ResultDetail>(`/results/${id}`)).data;

const resendResultEmailHandler = async (resultId: string): Promise<void> =>
  (await axiosServices.post(`/results/${resultId}/send-email`)).data;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useMyResults = () =>
  useQuery({
    queryKey: QUERY_KEY.my_results,
    queryFn: getMyResultsHandler,
    staleTime: 1000 * 30,
  });

export const useResultDetail = (id: string) =>
  useQuery({
    queryKey: QUERY_KEY.result_detail(id),
    queryFn: () => getResultDetailHandler(id),
    staleTime: Infinity,
    enabled: !!id,
  });

export const useResendResultEmail = () =>
  useMutation({
    mutationFn: resendResultEmailHandler,
    onSuccess: () => {
      toast.success("Score report sent to your email!");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to send email. Try again."),
  });