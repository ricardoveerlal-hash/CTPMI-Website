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
    if (sessionLoading) return;
    api
      .getVerse(session?.waId)
      .then(setVerse)
      .catch(() => setErrorMsg("Couldn't load today's verse right now."));
  }, [session, sessionLoading]);

  useEffect(() => {
    if (sessionLoading || !session) return;
    api.getQuizToday(session.waId).then(setQuiz).catch(() => {});
  }, [session, sessionLoading]);

  return (
    <div className="flex flex-col gap-10 pt-4">
      <section className="flex flex-col gap-6 border-b border-white/10 pb-10">
        <div className="flex items-center gap-2 text-sm">
          <p className="font-medium text-teal">Devotional of the day</p>
          {verse?.readMinutes && (
            <>
              <span className="text-paper/30">&middot;</span>
              <span className="flex items-center gap-1 text-paper/50">
                <ClockIcon />
                {verse.readMinutes} min read
              </span>
            </>
          )}
        </div>

        {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}

        {verse ? (
          <>
            {verse.title && (
              <h2 className="font-display text-2xl font-medium leading-snug text-paper sm:text-3xl">
                {verse.title}
              </h2>
            )}

            <blockquote className="border-l-[3px] border-teal bg-navy-800 px-5 py-4">
              <p className="font-display text-xl leading-snug text-paper sm:text-2xl">
                &ldquo;{verse.text}&rdquo;
              </p>
              <p className="mt-3 text-sm text-teal">{verse.ref}</p>
            </blockquote>

            <div className="flex flex-col gap-4">
              {verse.body && verse.body.length > 0 ? (
                verse.body.map((paragraph, i) => (
                  <p key={i} className="text-base leading-relaxed text-paper/80">
                    {paragraph}
                  </p>
                ))
              ) : (
                verse.encouragement && (
                  <p className="text-base italic leading-relaxed text-paper/70">
                    {verse.encouragement}
                  </p>
                )
              )}
            </div>

            {verse.prayer && (
              <div className="rounded-card bg-navy-700 px-5 py-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold-400">
                  Prayer of the day
                </p>
                <p className="text-sm leading-relaxed text-paper/90">
                  {verse.prayer}
                </p>
              </div>
            )}

            {verse.author && (
              <p className="text-right text-xs text-paper/40">
                &mdash; {verse.author}
              </p>
            )}
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

function ClockIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}
