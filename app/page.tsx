import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10 pt-4">
      <section className="flex flex-col gap-4 border-b border-white/10 pb-8">
        <p className="text-sm text-teal">Today&rsquo;s word</p>
        <blockquote className="font-display text-2xl leading-snug text-paper sm:text-3xl">
          &ldquo;Trust in the Lord with all your heart, and lean not on your
          own understanding.&rdquo;
        </blockquote>
        <p className="text-sm text-paper/50">Proverbs 3:5</p>
      </section>

      <section className="flex flex-col gap-4 rounded-card border border-white/10 bg-navy-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-paper">
              Today&rsquo;s quiz
            </p>
            <p className="text-sm text-paper/60">5 questions · a few minutes</p>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-semibold text-gold-400">
              🔥 0
            </p>
            <p className="text-xs text-paper/50">day streak</p>
          </div>
        </div>
        <Link
          href="/quiz"
          className="rounded-card bg-teal px-4 py-3 text-center font-medium text-navy-900 transition-opacity hover:opacity-90"
        >
          Start today&rsquo;s quiz
        </Link>
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
