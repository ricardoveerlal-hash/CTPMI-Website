"use client";

import { useEffect, useState } from "react";
import { api, type LeaderboardResponse } from "@/lib/api";

const TABS: { key: "today" | "7d" | "30d" | "all"; label: string; emoji: string }[] = [
  { key: "today", label: "Today", emoji: "☀️" },
  { key: "7d", label: "7 Days", emoji: "📅" },
  { key: "30d", label: "30 Days", emoji: "🗓️" },
  { key: "all", label: "All Time", emoji: "👑" },
];

const MEDALS = ["🥇", "🥈", "🥉"];

// A stable, fun little "avatar" emoji per person — same name always gets the same one.
const AVATARS = [
  "🦁", "🐝", "🕊️", "🌻", "⭐", "🌟", "🔥", "🚀", "🎯", "🏹",
  "🌈", "🍀", "💫", "🎉", "🙌", "👏", "🥳", "😄", "🤗", "🌞",
  "🎈", "🪁", "🌸", "🎵", "🎨", "💎", "🌊", "🍃", "🦋", "🐬",
];
function avatarFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATARS[h % AVATARS.length];
}

const CONFETTI = [
  { emoji: "🎉", left: "8%", delay: "0s" },
  { emoji: "✨", left: "24%", delay: "0.3s" },
  { emoji: "🎊", left: "68%", delay: "0.15s" },
  { emoji: "✨", left: "84%", delay: "0.45s" },
  { emoji: "🎉", left: "48%", delay: "0.6s" },
];

const SPARKLES = [
  { emoji: "✨", top: "-6px", left: "-2px", delay: "0s" },
  { emoji: "🌟", top: "2px", left: "88%", delay: "0.8s" },
  { emoji: "💫", top: "-10px", left: "48%", delay: "1.4s" },
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

  const podium = data?.top10.slice(0, 3) ?? [];
  const rest = data?.top10.slice(3) ?? [];
  const maxAnswered = Math.max(1, ...(data?.participation.map((p) => p.questionsAnswered) ?? [1]));

  return (
    <div className="flex flex-col gap-8 pt-4">
      <div className="animate-fade-slide-up relative">
        <h1 className="relative inline-flex items-center gap-2 font-display text-2xl font-semibold text-paper">
          <span className="animate-gentle-bob inline-block">🏆</span> Leaderboard
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              style={{ top: s.top, left: s.left, animationDelay: s.delay }}
              className="animate-float-drift pointer-events-none absolute text-xs"
            >
              {s.emoji}
            </span>
          ))}
        </h1>
        <p className="mt-1 text-xs text-paper/45">Who's bringing their A-game with the Word this week 👀</p>
        <div className="mt-4 flex gap-1.5 overflow-x-auto rounded-full border border-white/10 bg-navy-800/50 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? "scale-105 bg-gradient-to-r from-teal to-teal-light text-navy-900 shadow-md"
                  : "text-paper/50 hover:scale-105 hover:text-paper/80"
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center gap-3 pt-8 text-center">
          <span className="animate-gentle-bob text-3xl">🏆</span>
          <p className="text-sm text-paper/50">Loading the leaderboard&hellip;</p>
        </div>
      )}
      {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}

      {data && !loading && (
        <>
          {podium.length > 0 && (
            <section className="relative flex flex-col gap-2">
              <div className="relative flex items-end justify-center gap-3">
                {[podium[1], podium[0], podium[2]].map((player, idx) => {
                  if (!player) return <div key={idx} className="w-1/3" />;
                  const isFirst = player.position === 1;
                  const isSecond = player.position === 2;
                  const heights = isFirst ? "h-36" : isSecond ? "h-24" : "h-20";
                  const medal = MEDALS[player.position - 1] ?? "🎖️";
                  const barStyle = isFirst
                    ? "border-gold-400/60 bg-gradient-to-t from-gold-600/40 via-gold-400/20 to-gold-400/10 shadow-[0_0_24px_-4px_rgba(217,169,78,0.55)]"
                    : isSecond
                    ? "border-slate-300/50 bg-gradient-to-t from-slate-400/30 via-slate-200/15 to-slate-200/5"
                    : "border-orange-400/40 bg-gradient-to-t from-orange-500/30 via-orange-300/15 to-orange-300/5";
                  return (
                    <div
                      key={player.position}
                      style={{ animationDelay: isFirst ? "0.15s" : isSecond ? "0s" : "0.3s" }}
                      className="animate-pop-in group relative flex w-1/3 flex-col items-center gap-2"
                    >
                      {isFirst && (
                        <>
                          <span className="animate-gentle-bob absolute -top-9 text-3xl">👑</span>
                          <span className="animate-pulse-ring absolute top-1 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full" />
                          <span className="absolute -left-3 top-2 animate-pop-in text-sm" style={{ animationDelay: "0.5s" }}>✨</span>
                          <span className="absolute -right-3 top-4 animate-pop-in text-sm" style={{ animationDelay: "0.7s" }}>✨</span>
                          {CONFETTI.map((c, i) => (
                            <span
                              key={i}
                              style={{ left: c.left, animationDelay: c.delay }}
                              className="animate-confetti-fall pointer-events-none absolute -top-10 text-sm"
                            >
                              {c.emoji}
                            </span>
                          ))}
                        </>
                      )}
                      <span
                        className={`cursor-default text-2xl transition-transform hover:animate-wiggle ${isFirst ? "animate-gentle-bob" : ""}`}
                      >
                        {medal}
                      </span>
                      <p className="flex max-w-full items-center gap-1 truncate text-center text-sm font-semibold text-paper">
                        <span>{avatarFor(player.name)}</span> {player.name}
                      </p>
                      <p className="text-xs text-paper/50">
                        {player.correct}/{player.played}
                      </p>
                      <div className={`relative w-full overflow-hidden rounded-t-card border border-b-0 ${barStyle} ${heights}`}>
                        {isFirst && (
                          <span className="animate-shimmer-sweep absolute inset-y-0 left-0 w-8 skew-x-12 bg-white/25" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <Section title="Top 10" subtitle="Ranked by correct answers" emoji="📊">
            {rest.length || podium.length ? (
              <ol className="flex flex-col gap-2">
                {rest.map((player, i) => (
                  <li
                    key={player.position}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="animate-fade-slide-up group flex items-center justify-between rounded-card border border-white/10 bg-navy-800 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal/40 hover:bg-navy-700 hover:shadow-[0_6px_18px_-8px_rgba(29,156,144,0.5)] active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-700 text-[11px] font-semibold text-paper/50 transition-colors group-hover:bg-teal/20 group-hover:text-teal-light">
                        {player.position}
                      </span>
                      <span className="text-base transition-transform group-hover:animate-wiggle">{avatarFor(player.name)}</span>
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

          <Section title="Most Dedicated" subtitle="By questions answered, not accuracy" emoji="💪">
            {data.participation.length ? (
              <ol className="flex flex-col gap-2">
                {data.participation.map((player, i) => (
                  <li
                    key={player.position}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className="animate-fade-slide-up relative flex flex-col gap-1.5 overflow-hidden rounded-card border border-white/10 bg-navy-800 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal/40 active:scale-[0.98]"
                  >
                    <span className="flex items-center justify-between">
                      <span className="flex items-center gap-3">
                        <span className="w-4 text-sm text-paper/40">{player.position}</span>
                        <span className="text-base">{avatarFor(player.name)}</span>
                        <span className="text-paper">{player.name}</span>
                      </span>
                      <span className="text-sm text-paper/60">
                        {player.questionsAnswered} answered
                      </span>
                    </span>
                    <span className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700/80">
                      <span
                        style={{ width: `${Math.max(6, (player.questionsAnswered / maxAnswered) * 100)}%`, animationDelay: `${i * 60 + 100}ms` }}
                        className="animate-bar-grow block h-full rounded-full bg-gradient-to-r from-teal to-teal-light"
                      />
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState label="No data yet for this range." />
            )}
          </Section>

          <Section title="Perfect Scores" subtitle="100% in this range" emoji="💯">
            {data.perfectScores.length ? (
              <div className="flex flex-wrap gap-2">
                {data.perfectScores.map((p, i) => (
                  <span
                    key={p.name}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="animate-pop-in inline-flex cursor-default items-center gap-1.5 rounded-full border border-gold-400/40 bg-gold-400/10 px-3 py-1 text-sm text-gold-400 transition-transform hover:scale-105 hover:animate-wiggle"
                  >
                    <span>{avatarFor(p.name)}</span> {p.name} <span>✨</span>
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState label="No data yet for this range." />
            )}
          </Section>

          <Section title="Quickest" subtitle="Average response time" emoji="⚡">
            {data.quickest.length ? (
              <ol className="flex flex-col gap-2">
                {data.quickest.slice(0, 5).map((p, i) => (
                  <li
                    key={p.name}
                    style={{ animationDelay: `${i * 60}ms` }}
                    className={`animate-fade-slide-up flex items-center justify-between rounded-card border px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
                      i === 0
                        ? "border-gold-400/40 bg-gold-400/10"
                        : "border-white/10 bg-navy-800 hover:border-teal/40"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-paper">
                      <span className={i === 0 ? "animate-gentle-bob" : ""}>{i === 0 ? "⚡" : `${i + 1}.`}</span>
                      <span>{avatarFor(p.name)}</span> {p.name}
                    </span>
                    <span className={`text-sm ${i === 0 ? "font-semibold text-gold-400" : "text-paper/60"}`}>
                      {p.avgSeconds}s avg
                    </span>
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
  emoji,
  children,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-fade-slide-up flex flex-col gap-3">
      <div>
        <h2 className="flex items-center gap-1.5 font-display text-base font-semibold text-paper">
          <span>{emoji}</span> {title}
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
