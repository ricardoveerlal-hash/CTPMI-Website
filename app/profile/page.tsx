export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 pt-4">
      <h1 className="font-display text-2xl font-semibold text-paper">
        Your stats
      </h1>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Streak" value="0 days" />
        <Stat label="Quizzes played" value="0" />
        <Stat label="Correct answers" value="0" />
        <Stat label="Accuracy" value="—" />
      </div>

      <p className="text-center text-xs text-paper/40">
        Profile isn&rsquo;t connected yet — log in to see your real stats
        once this is wired up.
      </p>
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
