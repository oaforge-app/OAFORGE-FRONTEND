// src/types/index.ts

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  branch: string | null;
  college: string | null;
  graduationYear: number | null;
  provider: 'CREDENTIALS' | 'GOOGLE';
  createdAt: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: 'mcq';
  section: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Answer {
  questionId: string;
  answer: string;
  isMarkedForReview?: boolean;
  timeSpent?: number;
}

export interface SectionTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  topics: string[];
  isSystem: boolean;
  createdBy: string | null;
}

export interface UserSection {
  id: string;
  questionCount: number;
  duration: number;
  isActive: boolean;
  sectionTemplate: SectionTemplate; // ← not "section"
}
export interface TestSession {
  id: string;
  sectionSlug: string;
  questions: Question[];
  answers: Answer[];
  currentIndex: number;
  startTime: string;
  duration: number; // total seconds
  remainingSeconds: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  sectionTemplate: {
    id: string;
    name: string;
    icon: string | null;
    slug: string;
  };
}

export interface QuestionBreakdown {
  questionId: string;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  topic: string;
}

export interface SectionResult {
  id: string;
  sectionSlug: string;
  sectionName: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  timeSpent: number;
  createdAt: string;
}

export interface SectionResultDetail extends SectionResult {
  breakdown: QuestionBreakdown[];
}

export interface ResultsSummary {
  completedSections: string[];
  overallAccuracy: number;
  totalCompleted: number;
  results: Pick<SectionResult, 'sectionSlug' | 'sectionName' | 'accuracy'>[];
}