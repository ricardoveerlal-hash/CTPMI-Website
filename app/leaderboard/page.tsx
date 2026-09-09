"use client";

import { useEffect, useState } from "react";
import { api, type LeaderboardResponse } from "@/lib/api";

const TABS: { key: "today" | "7d" | "30d" | "all"; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "30d", label: "30 Days" },
  { key: "all", label: "All Time" },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("today");
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLoading(true);
    setErrorMsg("");
    api
      .getLeaderboard(activeTab)
      .then(setData)
      .catch(() => setErrorMsg("Couldn't load the leaderboard right now."))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="flex flex-col gap-8 pt-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">
          Leaderboard
        </h1>
        <div className="mt-4 flex gap-1 border-b border-white/10 text-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 ${
                activeTab === tab.key
                  ? "border-b-2 border-teal text-paper"
                  : "text-paper/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-sm text-paper/50">Loading...</p>}
      {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}

      {data && !loading && (
        <>
          <Section title="Top 10" subtitle="Ranked by correct answers">
            {data.top10.length ? (
              <ol className="flex flex-col gap-2">
                {data.top10.map((player) => (
                  <li
                    key={player.position}
                    className="flex items-center justify-between rounded-card border border-white/10 bg-navy-800 px-4 py-3"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-4 text-sm text-paper/40">
                        {player.position}
                      </span>
                      <span className="text-paper">{player.name}</span>
                    </span>
                    <span className="text-sm text-paper/60">
                      {player.correct}/{player.played}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState label="No data yet for this range." />
            )}
          </Section>

          <Section title="Most Dedicated" subtitle="By questions answered, not accuracy">
            {data.participation.length ? (
              <ol className="flex flex-col gap-2">
                {data.participation.map((player) => (
                  <li
                    key={player.position}
                    className="flex items-center justify-between rounded-card border border-white/10 bg-navy-800 px-4 py-3"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-4 text-sm text-paper/40">
                        {player.position}
                      </span>
                      <span className="text-paper">{player.name}</span>
                    </span>
                    <span className="text-sm text-paper/60">
                      {player.questionsAnswered} answered
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState label="No data yet for this range." />
            )}
          </Section>

          <Section title="Perfect Scores" subtitle="100% in this range">
            {data.perfectScores.length ? (
              <div className="flex flex-wrap gap-2">
                {data.perfectScores.map((p) => (
                  <span
                    key={p.name}
                    className="rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-sm text-gold-400"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState label="No data yet for this range." />
            )}
          </Section>

          <Section title="Quickest" subtitle="Average response time">
            {data.quickest.length ? (
              <ol className="flex flex-col gap-2">
                {data.quickest.slice(0, 5).map((p, i) => (
                  <li
                    key={p.name}
                    className="flex items-center justify-between rounded-card border border-white/10 bg-navy-800 px-4 py-3"
                  >
                    <span className="text-paper">
                      {i + 1}. {p.name}
                    </span>
                    <span className="text-sm text-paper/60">{p.avgSeconds}s avg</span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState label="No timing data yet — only WhatsApp answers were timed before the timer was removed." />
            )}
          </Section>
        </>
      )}
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="font-display text-base font-semibold text-paper">
          {title}
        </h2>
        <p className="text-xs text-paper/50">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-card border border-dashed border-white/15 px-4 py-6 text-center text-sm text-paper/40">
      {label}
    </div>
  );
}
