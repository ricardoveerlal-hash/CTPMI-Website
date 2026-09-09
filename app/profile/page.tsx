"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { api, type QuizTodayResponse } from "@/lib/api";

export default function ProfilePage() {
  const { session, loading: sessionLoading, clearSession } = useSession();
  const [quiz, setQuiz] = useState<QuizTodayResponse | null>(null);

  useEffect(() => {
    if (sessionLoading || !session) return;
    api.getQuizToday(session.waId).then(setQuiz).catch(() => {});
  }, [session, sessionLoading]);

  if (!sessionLoading && !session) {
    return (
      <div className="flex flex-col gap-4 pt-8">
        <p className="text-sm text-paper/70">Log in to see your stats.</p>
        <Link href="/login" className="text-sm text-teal hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  const accuracy =
    quiz && quiz.totalPlayed > 0
      ? Math.round((quiz.totalCorrect / (quiz.totalPlayed * 5)) * 100)
      : null;

  return (
    <div className="flex flex-col gap-8 pt-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">
          {session ? `Hi, ${session.firstName}` : "Your stats"}
        </h1>
        {session?.zone && (
          <p className="mt-1 text-sm text-paper/50">{session.zone}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Difficulty" value={quiz?.tierName || "—"} />
        <Stat label="Quizzes played" value={String(quiz?.totalPlayed ?? 0)} />
        <Stat label="Correct answers" value={String(quiz?.totalCorrect ?? 0)} />
        <Stat label="Accuracy" value={accuracy !== null ? `${accuracy}%` : "—"} />
      </div>

      <button
        onClick={clearSession}
        className="self-start text-sm text-paper/50 transition-colors hover:text-red-300"
      >
        Log out
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-white/10 bg-navy-800 p-4">
      <p className="font-display text-xl font-semibold text-gold-400">
        {value}
      </p>
      <p className="text-xs text-paper/50">{label}</p>
    </div>
  );
}
