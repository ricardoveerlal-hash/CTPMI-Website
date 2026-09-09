"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { api, type QuizOption, type QuizTodayResponse, type QuizAnswerResponse } from "@/lib/api";

type Screen = "loading" | "quiz" | "already_played" | "results" | "error";

export default function QuizPage() {
  const { session, loading: sessionLoading } = useSession();
  const [screen, setScreen] = useState<Screen>("loading");
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
