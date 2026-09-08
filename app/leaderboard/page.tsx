const TABS = ["Today", "7 Days", "30 Days", "All Time"];

const MOCK_TOP10 = [
  { name: "Pamela", correct: 34, played: 35 },
  { name: "Roland", correct: 33, played: 33 },
  { name: "Avastha", correct: 31, played: 32 },
];

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col gap-8 pt-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">
          Leaderboard
        </h1>
        <div className="mt-4 flex gap-1 border-b border-white/10 text-sm">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`px-3 py-2 ${
                i === 0
                  ? "border-b-2 border-teal text-paper"
                  : "text-paper/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <Section title="Top 10" subtitle="Ranked by correct answers">
        <ol className="flex flex-col gap-2">
          {MOCK_TOP10.map((player, i) => (
            <li
              key={player.name}
              className="flex items-center justify-between rounded-card border border-white/10 bg-navy-800 px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="w-4 text-sm text-paper/40">{i + 1}</span>
                <span className="text-paper">{player.name}</span>
              </span>
              <span className="text-sm text-paper/60">
                {player.correct}/{player.played}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Most Dedicated"
        subtitle="By questions answered, not accuracy"
      >
        <EmptyState label="No data yet for this range." />
      </Section>

      <Section title="Perfect Scores" subtitle="100% in this range">
        <EmptyState label="No data yet for this range." />
      </Section>

      <Section title="Quickest" subtitle="Average response time">
        <EmptyState label="No data yet for this range." />
      </Section>

      <p className="text-center text-xs text-paper/40">
        Leaderboard isn&rsquo;t connected yet — sample data shown for layout.
      </p>
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
