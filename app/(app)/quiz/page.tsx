"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session";
import QuizPlayer from "@/components/QuizPlayer";
import WinnerBanner from "@/components/WinnerBanner";
import { api, type QuizTodayResponse, type QuizAnswerResponse } from "@/lib/api";

type Screen = "loading" | "quiz" | "already_played" | "results" | "error";

export default function QuizPage() {
  const { session, loading: sessionLoading } = useSession();
  const [screen, setScreen] = useState<Screen>("loading");
  const [quiz, setQuiz] = useState<QuizTodayResponse | null>(null);
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

  async function handleSubmit(orderedAnswers: string[]) {
    if (!session || !quiz) return;
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await api.submitQuizAnswer(session.waId, orderedAnswers);
      if (res.alreadyPlayed) {
        // Server says today's quiz was already played: it returns no per-quiz score, so don't show a blank result.
        setScreen("already_played");
        return;
      }
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
      <div className="flex flex-col gap-4 pt-8 animate-fade-slide-up">
        <WinnerBanner />
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
    const isPerfect = result.correctCount === result.totalQuestions;
    return (
      <div className="flex flex-col gap-6 pt-4">
        <WinnerBanner />
        <div className="relative animate-pop-in">
          <p className="text-sm text-teal">Quiz complete</p>
          <p className="font-display text-2xl font-semibold text-paper">
            {result.correctCount}/{result.totalQuestions} correct
          </p>
          {isPerfect && (
            <div className="pointer-events-none absolute -top-2 left-0 right-0 flex justify-center gap-2 overflow-hidden">
              {["🎉", "✨", "🎊", "✨", "🎉"].map((emoji, i) => (
                <span
                  key={i}
                  className="animate-confetti-fall text-lg"
                  style={{ animationDelay: `${i * 0.12}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          )}
          {result.leveledUp && (
            <p className="mt-1 text-sm text-gold-400">
              Level up — you&rsquo;re now at {result.newTierName} difficulty
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          {result.breakdown?.map((b, i) => (
            <div
              key={b.id}
              className={`animate-fade-slide-up rounded-card border px-4 py-3 ${
                b.isCorrect ? "border-teal/40 bg-teal/5" : "border-red-400/30 bg-red-400/5"
              }`}
              style={{ animationDelay: `${i * 0.08}s` }}
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
    return (
      <QuizPlayer
        tierName={quiz.tierName}
        questions={quiz.questions}
        submitting={submitting}
        errorMsg={errorMsg}
        onFinish={handleSubmit}
      />
    );
  }

  return null;
}
