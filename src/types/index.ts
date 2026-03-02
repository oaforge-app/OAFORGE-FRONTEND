// src/types/index.ts

// ── Auth / User ───────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  branch?: string | null;
  college?: string | null;
  graduationYear?: number | null;
  provider: "GOOGLE" | "CREDENTIALS";
  hasGroqApiKey: boolean;
}

// ── Assessment ────────────────────────────────────────────────────────────────

export type AssessmentStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "EXPIRED";
export type SessionStatus    = "PENDING" | "ACTIVE" | "COMPLETED" | "EXPIRED";

export interface AssessmentSection {
  id: string;
  assessmentId: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  topics: string[];
  promptHint?: string | null;
  questionCount: number;
  duration: number; // minutes
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
}

export interface Assessment {
  id: string;
  userId: string;
  title: string;
  role?: string | null;
  company?: string | null;
  jdText?: string | null;
  totalDuration: number; // minutes
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
  sections: AssessmentSection[];
  session?: {
    id: string;
    status: SessionStatus;
    startTime?: string | null;
    duration: number;
    endTime?: string | null;
  } | null;
  _count?: { sections: number };
}

// ── Create Assessment ─────────────────────────────────────────────────────────

export interface CreateAssessmentPayload {
  role: string;
  company?: string;
  jdText?: string;
  groqApiKey?: string;
}

export interface CreateAssessmentResponse {
  assessment: Assessment;
  reasoning: string;
}

// ── Add custom section ────────────────────────────────────────────────────────

export interface AddCustomSectionPayload {
  name: string;
  description?: string;
}

// ── Finalize ──────────────────────────────────────────────────────────────────

export interface SectionOverride {
  id: string;
  questionCount?: number;
  duration?: number;
  isActive?: boolean;
}

export interface FinalizePayload {
  overrides?: SectionOverride[];
  groqApiKey?: string;
}

// ── Session / Test ────────────────────────────────────────────────────────────

export interface SessionQuestion {
  id: string;
  questionText: string;
  options: string[];
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  orderIndex: number;
  assessmentSectionId: string;
  userAnswer?: string | null;
  assessmentSection?: AssessmentSection;
}

export interface TestSession {
  id: string;
  assessmentId: string;
  userId: string;
  startTime?: string | null;
  endTime?: string | null;
  duration: number; // seconds
  status: SessionStatus;
  questions: SessionQuestion[];
  assessment: Assessment;
}

export interface SessionState {
  session: TestSession;
  remainingSeconds: number | null;
}

// ── Answers ───────────────────────────────────────────────────────────────────

export interface Answer {
  questionId: string;
  answer: string;
  isMarkedForReview?: boolean;
}

// ── Results ───────────────────────────────────────────────────────────────────

export interface QuestionBreakdown {
  questionId: string;
  questionText: string;
  yourAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  topic?: string | null;
}

export interface SectionBreakdown {
  sectionId: string;
  sectionName: string;
  slug: string;
  icon?: string | null;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  questions: QuestionBreakdown[];
}

export interface SubmitResponse {
  resultId: string;
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  sectionBreakdown: SectionBreakdown[];
}

export interface ResultSummary {
  id: string;
  assessmentId: string;   // ✅ needed for Dashboard to look up resultId by assessmentId
  title: string;
  role?: string | null;
  company?: string | null;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  sectionBreakdown: SectionBreakdown[];
  createdAt: string;
}

export interface ResultDetail extends ResultSummary {
  session: {
    id: string;
    startTime?: string | null;
    endTime?: string | null;
    duration: number;
  };
}

export interface MyResultsResponse {
  results: ResultSummary[];
  graphData: { index: number; date: string; accuracy: number; title: string }[];
  overallAccuracy: number;
  totalTests: number;
  sectionStats: {
    slug: string;
    name: string;
    avgAccuracy: number;
    attempts: number;
  }[];
}