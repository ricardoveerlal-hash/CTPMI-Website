"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { api, type QuizOption, type QuizTodayResponse, type QuizAnswerResponse } from "@/lib/api";

type Screen = "loading" | "quiz" | "already_played" | "results" | "error";

export default function QuizPage() {
  const { session, loading: sessionLoading } = useSession();
  const [screen, setScreen] = useState<Screen>("loading");"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { api, type QuizOption, type QuizTodayResponse, type QuizAnswerResponse } from "@/lib/api";

type Screen = "loading" | "quiz" | "already_played" | "results" | "error";

const CONFETTI_EMOJI = ["✨", "🎉", "⭐", "🙌", "📖", "🔥"];

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        emoji: CONFETTI_EMOJI[i % CONFETTI_EMOJI.length],
        left: `${(i * 7.3) % 100}%`,
        delay: `${(i % 7) * 0.12}s`,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="animate-confetti-fall absolute top-0 text-lg"
          style={{ left: p.left, animationDelay: p.delay }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

function scoreFeedback(correct: number, total: number) {
  const pct = total > 0 ? correct / total : 0;
  if (pct === 1) return { emoji: "🏆", label: "Perfect score!" };
  if (pct >= 0.8) return { emoji: "🔥", label: "On fire!" };
  if (pct >= 0.5) return { emoji: "🙌", label: "Nice work!" };
  return { emoji: "📖", label: "Keep growing in the Word!" };
}

export default function QuizPage() {
  const { session, loading: sessionLoading } = useSession();
  const [screen, setScreen] = useState<Screen>("loading");
  const [quiz, setQuiz] = useState<QuizTodayResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, QuizOption>>({});
  const [result, setResult] = useState<QuizAnswerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setScreen("error");
      setErrorMsg("Log in to play today's quiz.");
      return;
    }
    api
      .getQuizToday(session.waId)
      .then((data) => {
        setQuiz(data);
        setScreen(data.alreadyPlayed ? "already_played" : "quiz");
      })
      .catch(() => {
        setScreen("error");
        setErrorMsg("Couldn't load today's quiz. Try again in a moment.");
      });
  }, [session, sessionLoading]);

  function selectAnswer(questionId: number, option: QuizOption) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    if (!session || !quiz) return;
    if (Object.keys(answers).length < quiz.questions.length) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    setSubmitting(true);
    try {
      const orderedAnswers = quiz.questions.map((q) => answers[q.id] || "");
      const res = await api.submitQuizAnswer(session.waId, orderedAnswers);
      setResult(res);
      setScreen("results");
    } catch {
      setErrorMsg("Couldn't submit your answers. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (screen === "loading" || sessionLoading) {
    return (
      <div className="flex flex-col items-center gap-3 pt-16 text-center">
        <span className="animate-gentle-bob text-4xl">📖</span>
        <p className="text-sm text-paper/50">Loading today&rsquo;s quiz&hellip;</p>
      </div>
    );
  }

  if (screen === "error") {
    return (
      <div className="animate-fade-slide-up flex flex-col gap-4 pt-8">
        <p className="text-sm text-paper/70">{errorMsg}</p>
        {!session && (
          <Link href="/login" className="text-sm text-teal hover:underline">
            Log in
          </Link>
        )}
      </div>
    );
  }

  if (screen === "already_played" && quiz) {
    return (
      <div className="animate-pop-in relative flex flex-col gap-4 overflow-hidden rounded-card border border-gold-400/30 bg-gradient-to-br from-navy-800 to-navy-700 p-6 pt-8">
        <span className="animate-gentle-bob absolute right-4 top-4 text-3xl">✅</span>
        <p className="font-display text-xl text-paper">You&rsquo;ve already played today 🎯</p>
        <p className="text-sm text-paper/60">
          <span className="font-semibold text-gold-400">{quiz.totalCorrect}</span> correct across{" "}
          <span className="font-semibold text-paper">{quiz.totalPlayed}</span> quizzes overall.
          Come back tomorrow for a new one 🌅
        </p>
        <Link
          href="/leaderboard"
          className="inline-flex w-fit items-center gap-2 rounded-full bg-teal px-4 py-2 text-sm font-semibold text-navy-900 transition-transform hover:scale-105"
        >
          🏆 View the leaderboard
        </Link>
      </div>
    );
  }

  if (screen === "results" && result) {
    const total = result.totalQuestions ?? result.breakdown?.length ?? 0;
    const correct = result.correctCount ?? 0;
    const feedback = scoreFeedback(correct, total);
    return (
      <div className="flex flex-col gap-6 pt-4">
        <div className="animate-pop-in relative overflow-hidden rounded-card border border-teal/30 bg-gradient-to-br from-navy-800 via-navy-800 to-teal/10 p-6 text-center">
          {(result.leveledUp || feedback.emoji === "🏆") && <ConfettiBurst />}
          <p className="text-sm font-semibold uppercase tracking-wide text-teal">Quiz complete</p>
          <p className="animate-gentle-bob mt-2 text-5xl">{feedback.emoji}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-paper">
            {correct}/{total} correct
          </p>
          <p className="mt-1 text-sm text-paper/60">{feedback.label}</p>
          {result.leveledUp && (
            <p className="mt-3 inline-block rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-sm font-semibold text-gold-400">
              ⬆️ Level up — you&rsquo;re now at {result.newTierName} difficulty
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {result.breakdown?.map((b, i) => (
            <div
              key={b.id}
              style={{ animationDelay: `${i * 70}ms` }}
              className={`animate-fade-slide-up flex items-start gap-3 rounded-card border px-4 py-3 ${
                b.isCorrect ? "border-teal/40 bg-teal/5" : "border-red-400/30 bg-red-400/5"
              }`}
            >
              <span className="text-lg leading-none">{b.isCorrect ? "✅" : "❌"}</span>
              <div>
                <p className="text-sm text-paper">{b.question}</p>
                <p className="mt-1 text-xs text-paper/60">
                  {b.isCorrect ? "Correct!" : `Correct answer: ${b.correctText}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-paper/60">
          🙏 {result.totalCorrect} correct across {result.totalPlayed} quizzes overall.
        </p>

        <Link
          href="/leaderboard"
          className="animate-pulse-ring flex items-center justify-center gap-2 rounded-card bg-gradient-to-r from-teal to-teal-light px-4 py-3 text-center font-semibold text-navy-900 transition-transform hover:scale-[1.02]"
        >
          🏆 View the leaderboard
        </Link>
      </div>
    );
  }

  if (screen === "quiz" && quiz) {
    const answeredCount = Object.keys(answers).length;
    const pct = quiz.questions.length ? Math.round((answeredCount / quiz.questions.length) * 100) : 0;
    return (
      <div className="flex flex-col gap-8 pt-4">
        <div className="animate-fade-slide-up flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
              🔥 {quiz.tierName} difficulty
            </p>
            <p className="text-xs text-paper/50">
              {answeredCount}/{quiz.questions.length} answered
            </p>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-navy-800">
            <div
              className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-teal to-gold-400 transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            >
              {pct > 0 && pct < 100 && (
                <span className="animate-shimmer-sweep absolute inset-y-0 w-1/3 bg-white/30 blur-sm" />
              )}
            </div>
          </div>
          <p className="text-xs text-paper/40">Take your time — no timer ⏳</p>
        </div>

        <div className="flex flex-col gap-6">
          {quiz.questions.map((q, i) => (
            <div
              key={q.id}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-fade-slide-up flex flex-col gap-3 rounded-card border border-white/10 bg-navy-800/40 p-4"
            >
              <p className="flex items-start gap-2 font-display text-lg leading-snug text-paper">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/20 text-xs font-semibold text-teal">
                  {i + 1}
                </span>
                {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {(Object.keys(q.options) as QuizOption[]).map((opt) => {
                  const selected = answers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => selectAnswer(q.id, opt)}
                      className={`flex items-center justify-between rounded-card border px-4 py-3 text-left transition-all ${
                        selected
                          ? "animate-pop-in border-teal bg-teal/10 text-paper shadow-[0_0_0_1px_rgba(29,156,144,0.4)]"
                          : "border-white/15 bg-navy-800 text-paper/80 hover:border-teal/50 hover:bg-navy-800/80"
                      }`}
                    >
                      <span>{q.options[opt]}</span>
                      {selected && <span className="text-teal">✅</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={`flex items-center justify-center gap-2 rounded-card px-4 py-3 text-center font-semibold transition-all disabled:opacity-60 ${
            answeredCount === quiz.questions.length
              ? "animate-pulse-ring bg-gradient-to-r from-teal to-gold-400 text-navy-900 hover:scale-[1.01]"
              : "bg-navy-800 text-paper/50"
          } ${shake ? "animate-shake-x" : ""}`}
        >
          {submitting ? "Submitting…" : answeredCount === quiz.questions.length ? "🚀 Submit answers" : "Answer all questions"}
        </button>
      </div>
    );
  }

  return null;
}

  const [quiz, setQuiz] = useState<QuizTodayResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, QuizOption>>({});
  const [result, setResult] = useState<QuizAnswerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      setScreen("error");
      setErrorMsg("Log in to play today's quiz.");
      return;
    }
    api
      .getQuizToday(session.waId)
      .then((data) => {
        setQuiz(data);
        setScreen(data.alreadyPlayed ? "already_played" : "quiz");
      })
      .catch(() => {
        setScreen("error");
        setErrorMsg("Couldn't load today's quiz. Try again in a moment.");
      });
  }, [session, sessionLoading]);

  function selectAnswer(questionId: number, option: QuizOption) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    if (!session || !quiz) return;
    setSubmitting(true);
    try {
      const orderedAnswers = quiz.questions.map((q) => answers[q.id] || "");
      const res = await api.submitQuizAnswer(session.waId, orderedAnswers);
      setResult(res);
      setScreen("results");
    } catch {
      setErrorMsg("Couldn't submit your answers. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (screen === "loading" || sessionLoading) {
    return <p className="pt-8 text-sm text-paper/50">Loading today&rsquo;s quiz...</p>;
  }

  if (screen === "error") {
    return (
      <div className="flex flex-col gap-4 pt-8">
        <p className="text-sm text-paper/70">{errorMsg}</p>
        {!session && (
          <Link href="/login" className="text-sm text-teal hover:underline">
            Log in
          </Link>
        )}
      </div>
    );
  }

  if (screen === "already_played" && quiz) {
    return (
      <div className="flex flex-col gap-4 pt-8">
        <p className="font-display text-xl text-paper">You&rsquo;ve already played today</p>
        <p className="text-sm text-paper/60">
          {quiz.totalCorrect} correct across {quiz.totalPlayed} quizzes overall.
          Come back tomorrow for a new one.
        </p>
        <Link href="/leaderboard" className="text-sm text-teal hover:underline">
          View the leaderboard
        </Link>
      </div>
    );
  }

  if (screen === "results" && result) {
    return (
      <div className="flex flex-col gap-6 pt-4">
        <div>
          <p className="text-sm text-teal">Quiz complete</p>
          <p className="font-display text-2xl font-semibold text-paper">
            {result.correctCount}/{result.totalQuestions} correct
          </p>
          {result.leveledUp && (
            <p className="mt-1 text-sm text-gold-400">
              Level up — you&rsquo;re now at {result.newTierName} difficulty
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {result.breakdown?.map((b) => (
            <div
              key={b.id}
              className={`rounded-card border px-4 py-3 ${
                b.isCorrect ? "border-teal/40 bg-teal/5" : "border-red-400/30 bg-red-400/5"
              }`}
            >
              <p className="text-sm text-paper">{b.question}</p>
              <p className="mt-1 text-xs text-paper/60">
                {b.isCorrect ? "Correct" : `Correct answer: ${b.correctText}`}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-paper/60">
          {result.totalCorrect} correct across {result.totalPlayed} quizzes overall.
        </p>
        <Link
          href="/leaderboard"
          className="rounded-card bg-teal px-4 py-3 text-center font-medium text-navy-900 transition-opacity hover:opacity-90"
        >
          View the leaderboard
        </Link>
      </div>
    );
  }

  if (screen === "quiz" && quiz) {
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="flex flex-col gap-8 pt-4">
        <div>
          <p className="text-sm text-teal">{quiz.tierName} difficulty</p>
          <p className="mt-1 text-xs text-paper/50">
            {answeredCount}/{quiz.questions.length} answered — take your time, no timer
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="flex flex-col gap-3">
              <p className="font-display text-lg leading-snug text-paper">
                {i + 1}. {q.question}
              </p>
              <div className="flex flex-col gap-2">
                {(Object.keys(q.options) as QuizOption[]).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => selectAnswer(q.id, opt)}
                    className={`rounded-card border px-4 py-3 text-left transition-colors ${
                      answers[q.id] === opt
                        ? "border-teal bg-teal/10 text-paper"
                        : "border-white/15 bg-navy-800 text-paper/80 hover:border-teal/50"
                    }`}
                  >
                    {q.options[opt]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={answeredCount < quiz.questions.length || submitting}
          className="rounded-card bg-teal px-4 py-3 text-center font-medium text-navy-900 transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? "Submitting..." : "Submit answers"}
        </button>
      </div>
    );
  }

  return null;
}
