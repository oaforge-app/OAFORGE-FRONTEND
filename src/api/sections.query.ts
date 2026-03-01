// src/api/sections.query.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { axiosServices } from "@/lib/axios";
import { QUERY_KEY } from "@/lib/config";
import type { SectionTemplate, UserSection } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AddSectionPayload {
  sectionTemplateId: string;
  questionCount?: number;
  duration?: number;
}

export interface UpdateSectionPayload {
  questionCount?: number;
  duration?: number;
}

export interface CreateCustomSectionPayload {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  topics: string[];
  promptHint?: string;
  questionCount?: number;
  duration?: number;
}

// ── Raw handlers ──────────────────────────────────────────────────────────────

const getAvailableHandler = async (): Promise<SectionTemplate[]> =>
  (await axiosServices.get<SectionTemplate[]>("/sections/available")).data;

const getMineHandler = async (): Promise<UserSection[]> =>
  (await axiosServices.get<UserSection[]>("/sections/mine")).data;

const addHandler = async (data: AddSectionPayload): Promise<UserSection> =>
  (await axiosServices.post<UserSection>("/sections/mine", data)).data;

const removeHandler = async (id: string): Promise<void> => {
  await axiosServices.delete(`/sections/mine/${id}`);
};

const updatePrefsHandler = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateSectionPayload;
}): Promise<UserSection> =>
  (await axiosServices.patch<UserSection>(`/sections/mine/${id}`, data)).data;

const createCustomHandler = async (data: CreateCustomSectionPayload) =>
  (await axiosServices.post("/sections/custom", data)).data;

// ── Hooks ─────────────────────────────────────────────────────────────────────

export const useAvailableSections = () =>
  useQuery({
    queryKey: QUERY_KEY.available_sections,
    queryFn: getAvailableHandler,
    staleTime: 1000 * 60 * 10,
  });

export const useMySections = () =>
  useQuery({
    queryKey: QUERY_KEY.my_sections,
    queryFn: getMineHandler,
    staleTime: 1000 * 30,
  });

export const useAddSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addHandler,
    onSuccess: (d) => {
      toast.success(`"${d.section.name}" added to your dashboard.`);
      qc.invalidateQueries({ queryKey: QUERY_KEY.reset_sections });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to add section."),
  });
};

export const useRemoveSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeHandler,
    onSuccess: () => {
      toast.success("Section removed.");
      qc.invalidateQueries({ queryKey: QUERY_KEY.reset_sections });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to remove section."),
  });
};

export const useUpdateSectionPrefs = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePrefsHandler,
    onSuccess: () => {
      toast.success("Preferences updated.");
      qc.invalidateQueries({ queryKey: QUERY_KEY.my_sections });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to update."),
  });
};

export const useCreateCustomSection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomHandler,
    onSuccess: (d: any) => {
      toast.success(`"${d.template?.name ?? "Section"}" created and added.`);
      qc.invalidateQueries({ queryKey: QUERY_KEY.reset_sections });
    },
    onError: (e: any) =>
      toast.error(e?.response?.data?.message ?? "Failed to create section."),
  });
};