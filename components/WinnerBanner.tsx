"use client";

import { useEffect, useState } from "react";
import { api, type SeasonWinner } from "@/lib/api";
import { winnerTitle } from "@/lib/season";

// Shows the most recent monthly quiz champion. Renders nothing at all until /web/season returns
// a winner, which first happens when Season 1 is frozen (30 Sep 22:00 SAST) - so it is safe to
// ship now. It also renders nothing on any network error: a missing banner is harmless, a broken
// one on the quiz page is not.
export default function WinnerBanner() {
  const [winner, setWinner] = useState<SeasonWinner | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getSeason()
      .then((d) => {
        if (!cancelled) setWinner(d?.latestWinner ?? null);
      })
      .catch(() => {
        if (!cancelled) setWinner(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!winner) return null;

  return (
    <div
      role="status"
      className="animate-fade-slide-up flex items-center gap-3 rounded-card border border-gold-400/40 bg-gradient-to-r from-gold-400/15 via-navy-800/60 to-navy-800/60 px-4 py-3"
    >
      <span className="text-2xl" aria-hidden="true">
        🏆
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gold-400">
          {winnerTitle(winner.monthKey, winner.monthLabel)}
        </p>
        <p className="truncate font-display text-lg font-semibold text-paper">{winner.name}</p>
        <p className="text-xs text-paper/60">
          {winner.points} pts · {winner.accuracy}% accuracy · {winner.played} quizzes
        </p>
      </div>
    </div>
  );
}
