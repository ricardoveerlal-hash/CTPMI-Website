const MOCK_QUESTION = {
  index: 2,
  total: 5,
  text: "Who led the Israelites out of Egypt?",
  options: ["Moses", "Joshua", "Aaron", "David"],
};

export default function QuizPage() {
  const dots = Array.from({ length: MOCK_QUESTION.total }, (_, i) => i);

  return (
    <div className="flex flex-col gap-8 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {dots.map((i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${
                i < MOCK_QUESTION.index ? "bg-teal" : "bg-white/15"
              }`}
            />
          ))}
        </div>
        <CountdownRing seconds={90} />
      </div>

      <p className="font-display text-xl leading-snug text-paper sm:text-2xl">
        {MOCK_QUESTION.text}
      </p>

      <div className="flex flex-col gap-3">
        {MOCK_QUESTION.options.map((option) => (
          <button
            key={option}
            className="rounded-card border border-white/15 bg-navy-800 px-4 py-3 text-left text-paper transition-colors hover:border-teal"
          >
            {option}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-paper/40">
        Quiz answers aren&rsquo;t connected yet — this is a visual preview of
        the flow.
      </p>
    </div>
  );
}

function CountdownRing({ seconds }: { seconds: number }) {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center">
      <svg viewBox="0 0 40 40" className="h-10 w-10 -rotate-90">
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          stroke="#1d9c90"
          strokeWidth="3"
          strokeDasharray={2 * Math.PI * 16}
          strokeDashoffset={2 * Math.PI * 16 * 0.25}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] text-paper/70">{seconds}s</span>
    </div>
  );
}
