"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { api, type VerseResponse, type QuizTodayResponse } from "@/lib/api";

export default function VersePage() {
  const { session, loading: sessionLoading } = useSession();
  const [verse, setVerse] = useState<VerseResponse | null>(null);
  const [quiz, setQuiz] = useState<QuizTodayResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api
      .getVerse()
      .then(setVerse)
      .catch(() => setErrorMsg("Couldn't load today's verse right now."));
  }, []);

  useEffect(() => {
    if (sessionLoading || !session) return;
    api.getQuizToday(session.waId).then(setQuiz).catch(() => {});
  }, [session, sessionLoading]);

  return (
    <div className="flex flex-col gap-10 pt-4">
      <section className="flex flex-col gap-4 border-b border-white/10 pb-8">
        <p className="text-sm text-teal">Verse of the day</p>
        {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}
        {verse ? (
          <>
            <blockquote className="font-display text-2xl leading-snug text-paper sm:text-3xl">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
            <p className="text-sm text-paper/50">{verse.ref}</p>
          </>
        ) : (
          !errorMsg && <p className="text-sm text-paper/40">Loading...</p>
        )}
      </section>

      <section className="flex flex-col gap-4 rounded-card border border-white/10 bg-navy-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-paper">
              Today&rsquo;s quiz
            </p>
            <p className="text-sm text-paper/60">5 questions · no timer</p>
          </div>
          {session && quiz && (
            <div className="text-right">
              <p className="font-display text-2xl font-semibold text-gold-400">
                {quiz.totalCorrect}
              </p>
              <p className="text-xs text-paper/50">correct all-time</p>
            </div>
          )}
        </div>

        {!session && !sessionLoading && (
          <Link
            href="/login"
            className="rounded-card bg-teal px-4 py-3 text-center font-medium text-navy-900 transition-opacity hover:opacity-90"
          >
            Log in to play
          </Link>
        )}

        {session && quiz?.alreadyPlayed && (
          <p className="text-center text-sm text-paper/60">
            You&rsquo;ve already played today &mdash; come back tomorrow.
          </p>
        )}

        {session && quiz && !quiz.alreadyPlayed && (
          <Link
            href="/quiz"
            className="rounded-card bg-teal px-4 py-3 text-center font-medium text-navy-900 transition-opacity hover:opacity-90"
          >
            Start today&rsquo;s quiz
          </Link>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <p className="text-sm text-paper/60">
          Not sure who&rsquo;s leading this week?
        </p>
        <Link href="/leaderboard" className="text-sm text-teal hover:underline">
          View the leaderboard
        </Link>
      </section>
    </div>
  );
}
