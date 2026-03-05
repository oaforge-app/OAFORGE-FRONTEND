import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";
import type {
  Assessment,
  CreateAssessmentPayload,
  CreateAssessmentResponse,
  AddCustomSectionPayload,
  AssessmentSection,
  SectionOverride,
  FinalizePayload,
  TestSession,
  SessionState,
  Answer,
  SubmitResponse,
} from "@/types";
import { useNavigate } from "react-router-dom";

// ── Raw handlers ──────────────────────────────────────────────────────────────

const getMyAssessmentsHandler = async (): Promise<Assessment[]> =>
  (await axiosServices.get<Assessment[]>("/assessments")).data;

const getAssessmentHandler = async (id: string): Promise<Assessment> =>
  (await axiosServices.get<Assessment>(`/assessments/${id}`)).data;

const createAssessmentHandler = async (
  data: CreateAssessmentPayload
): Promise<CreateAssessmentResponse> =>
  (await axiosServices.post<CreateAssessmentResponse>("/assessments", data)).data;

const addCustomSectionHandler = async ({
  assessmentId,
  data,
}: {
  assessmentId: string;
  data: AddCustomSectionPayload;
}): Promise<AssessmentSection> =>
  (
    await axiosServices.post<AssessmentSection>(
      `/assessments/${assessmentId}/sections`,
      data
    )
  ).data;

const updateSectionHandler = async ({
  assessmentId,
  sectionId,
  data,
}: {
  assessmentId: string;
  sectionId: string;
  data: Partial<SectionOverride>;
}): Promise<AssessmentSection> =>
  (
    await axiosServices.patch<AssessmentSection>(
      `/assessments/${assessmentId}/sections/${sectionId}`,
      data
    )
  ).data;

const removeSectionHandler = async ({
  assessmentId,
  sectionId,
}: {
  assessmentId: string;
  sectionId: string;
}): Promise<{ message: string }> =>
  (
    await axiosServices.delete(
      `/assessments/${assessmentId}/sections/${sectionId}`
    )
  ).data;

const finalizeAssessmentHandler = async ({
  assessmentId,
  data,
}: {
  assessmentId: string;
  data: FinalizePayload;
}): Promise<TestSession> =>
  (
    await axiosServices.post<TestSession>(
      `/assessments/${assessmentId}/finalize`,
      data
    )
  ).data;

const startSessionHandler = async (
  assessmentId: string
): Promise<SessionState> =>
  (
    await axiosServices.post<SessionState>(`/assessments/${assessmentId}/start`)
  ).data;

const getSessionStateHandler = async (
  assessmentId: string
): Promise<SessionState> =>
  (
    await axiosServices.get<SessionState>(
      `/assessments/${assessmentId}/session`
    )
  ).data;

const saveAnswersHandler = async ({
  assessmentId,
  answers,
}: {
  assessmentId: string;
  answers: { questionId: string; answer: string }[];
}): Promise<{ message: string; savedCount: number }> =>
  (
    await axiosServices.patch(
      `/assessments/${assessmentId}/session/answers`,
      { answers }
    )
  ).data;

const submitAssessmentHandler = async ({
  assessmentId,
  answers,
}: {
  assessmentId: string;
  answers?: { questionId: string; answer: string }[];
}): Promise<SubmitResponse> =>
  (
    await axiosServices.post<SubmitResponse>(
      `/assessments/${assessmentId}/submit`,
      { answers }
    )
  ).data;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useMyAssessments = () =>
  useQuery({
    queryKey: QUERY_KEY.my_assessments,
    queryFn: getMyAssessmentsHandler,
    staleTime: 1000 * 30,
  });

export const useAssessment = (id: string) =>
  useQuery({
    queryKey: QUERY_KEY.assessment(id),
    queryFn: () => getAssessmentHandler(id),
    staleTime: 1000 * 30,
    enabled: !!id,
  });

export const useCreateAssessment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAssessmentHandler,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY.reset_assessments });
    },
    onError: (e: any) =>
      toast.error(
        e?.response?.data?.message ?? "Failed to create assessment. Try again."
      ),
  });
};

export const useAddCustomSection = (assessmentId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddCustomSectionPayload) =>
      addCustomSectionHandler({ assessmentId, data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY.assessment(assessmentId) });
      toast.success("Section added");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to add section."),
  });
};

export const useUpdateSection = (assessmentId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      data,
    }: {
      sectionId: string;
      data: Partial<SectionOverride>;
    }) => updateSectionHandler({ assessmentId, sectionId, data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY.assessment(assessmentId) });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to update section."),
  });
};

export const useRemoveSection = (assessmentId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sectionId: string) =>
      removeSectionHandler({ assessmentId, sectionId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY.assessment(assessmentId) });
      toast.success("Section removed");
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to remove section."),
  });
};

export const useFinalizeAssessment = (assessmentId: string) => {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: FinalizePayload) =>
      finalizeAssessmentHandler({ assessmentId, data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY.assessment(assessmentId) });
      qc.invalidateQueries({ queryKey: QUERY_KEY.my_assessments });
    },
    onError: (e: any) => {
      const status  = e?.response?.status;
      const message = e?.response?.data?.message;

      if (status === 429) {
        toast.error("Daily limit reached", {
          description: message ?? "3 assessments/day without a Groq key.",
          action: {
            label: "Add Groq Key →",
            onClick: () => navigate("/settings"),
          },
          duration: 10_000,
        });
        return;
      }

      toast.error(message ?? "Failed to generate questions. Try again.");
    },
  });
};

export const useStartSession = (assessmentId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => startSessionHandler(assessmentId),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEY.session(assessmentId), data);
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to start session."),
  });
};

export const useSessionState = (assessmentId: string) =>
  useQuery({
    queryKey: QUERY_KEY.session(assessmentId),
    queryFn: () => getSessionStateHandler(assessmentId),
    enabled: !!assessmentId,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

export const useSaveAnswers = (assessmentId: string) =>
  useMutation({
    mutationFn: (answers: { questionId: string; answer: string }[]) =>
      saveAnswersHandler({ assessmentId, answers }),
    // silent — no toast, fire-and-forget
  });

export const useSubmitAssessment = (assessmentId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers?: { questionId: string; answer: string }[]) =>
      submitAssessmentHandler({ assessmentId, answers }),
    onSuccess: (data) => {
      toast.success(`Submitted — ${data.accuracy}% accuracy 🎯`);
      qc.invalidateQueries({ queryKey: QUERY_KEY.reset_assessments });
      qc.invalidateQueries({ queryKey: QUERY_KEY.reset_results });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to submit. Try again."),
  });
};