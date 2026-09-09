const BASE_URL =
  process.env.NEXT_PUBLIC_N8N_BASE_URL || "https://n8n.lirotech.co.za/webhook";

export type QuizOption = "A" | "B" | "C" | "D";

export interface QuizQuestion {
  id: number;
  question: string;
  options: Record<QuizOption, string>;
}

export interface QuizTodayResponse {
  waId: string;
  today: string;
  quizDay: number;
  tier: number;
  tierName: string;
  totalCorrect: number;
  totalPlayed: number;
  alreadyPlayed: boolean;
  questions: QuizQuestion[];
  error?: string;
}

export interface QuizAnswerBreakdown {
  id: number;
  question: string;
  given: string | null;
  correct: string;
  correctText: string;
  isCorrect: boolean;
}

export interface QuizAnswerResponse {
  alreadyPlayed: boolean;
  waId: string;
  correctCount?: number;
  totalQuestions?: number;
  breakdown?: QuizAnswerBreakdown[];
  totalCorrect: number;
  totalPlayed: number;
  leveledUp?: boolean;
  newTier?: number;
  newTierName?: string;
  error?: string;
}

export interface LeaderboardEntry {
  position: number;
  name: string;
  accuracy?: number;
  correct: number;
  played: number;
}

export interface LeaderboardResponse {
  range: { key: string; label: string };
  top10: LeaderboardEntry[];
  perfectScores: { name: string; correct: number; played: number }[];
  quickest: { name: string; avgSeconds: number }[];
  fastestEver: { name: string; seconds: number } | null;
  participation: {
    position: number;
    name: string;
    questionsAnswered: number;
    quizzesPlayed: number;
    correct: number;
  }[];
  rankClimbers: { name: string; from: number; to: number; delta: number }[];
  hasHistory: boolean;
}

export interface VerseResponse {
  date: string;
  ref: string;
  text: string;
}

export interface LoginResponse {
  found: boolean;
  waId: string;
  fullName?: string;
  firstName?: string;
  zone?: string;
}

export interface RegisterPayload {
  wa_id: string;
  firstName: string;
  surname?: string;
  zone?: string;
  email?: string;
  isCtpmiMember: boolean;
  birthDay: number;
  birthMonth: number;
}

export interface RegisterResponse {
  success: boolean;
  waId?: string;
  fullName?: string;
  error?: string;
}

export interface ProfileResponse {
  found: boolean;
  waId: string;
  firstName?: string;
  surname?: string;
  fullName?: string;
  zone?: string;
  email?: string;
  cellNumber?: string;
  birthDay?: number | null;
  birthMonth?: number | null;
  isCtpmiMember?: boolean;
  registeredAt?: string;
}

export interface ProfileUpdatePayload {
  wa_id: string;
  firstName: string;
  surname?: string;
  zone?: string;
  email?: string;
  isCtpmiMember: boolean;
  birthDay: number | null;
  birthMonth: number | null;
}

export interface ProfileUpdateResponse {
  success: boolean;
  waId?: string;
  fullName?: string;
  zone?: string;
  email?: string;
  birthDay?: number;
  birthMonth?: number;
  isCtpmiMember?: boolean;
  error?: string;
}

async function getJson<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}/${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  getQuizToday: (waId: string) =>
    getJson<QuizTodayResponse>("web/quiz/today", { wa_id: waId }),

  submitQuizAnswer: (waId: string, answers: string[]) =>
    postJson<QuizAnswerResponse>("web/quiz/answer", { wa_id: waId, answers }),

  getLeaderboard: (range: "today" | "7d" | "30d" | "all") =>
    getJson<LeaderboardResponse>("web/leaderboard", { range }),

  getVerse: () => getJson<VerseResponse>("web/verse"),

  login: (waId: string) => postJson<LoginResponse>("web/login", { wa_id: waId }),

  register: (payload: RegisterPayload) =>
    postJson<RegisterResponse>("web/register", payload),

  getProfile: (waId: string) =>
    getJson<ProfileResponse>("web/profile", { wa_id: waId }),

  updateProfile: (payload: ProfileUpdatePayload) =>
    postJson<ProfileUpdateResponse>("web/profile/update", payload),
};
