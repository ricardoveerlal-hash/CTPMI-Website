const MOCK_VERSES = [
  {
    date: "Today",
    text: "Trust in the Lord with all your heart, and lean not on your own understanding.",
    ref: "Proverbs 3:5",
  },
  {
    date: "Yesterday",
    text: "I can do all things through Christ who strengthens me.",
    ref: "Philippians 4:13",
  },
];

export default function VersePage() {
  return (
    <div className="flex flex-col gap-8 pt-4">
      <h1 className="font-display text-2xl font-semibold text-paper">
        Verse of the day
      </h1>
      <div className="flex flex-col gap-6">
        {MOCK_VERSES.map((v) => (
          <div key={v.date} className="border-b border-white/10 pb-6">
            <p className="text-sm text-teal">{v.date}</p>
            <p className="mt-2 font-display text-lg leading-snug text-paper">
              &ldquo;{v.text}&rdquo;
            </p>
            <p className="mt-1 text-sm text-paper/50">{v.ref}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-paper/40">
        Archive isn&rsquo;t connected yet — sample verses shown for layout.
      </p>
    </div>
  );
}
