"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { QuizOption, QuizQuestion } from "@/lib/api";

const SECONDS_PER_QUESTION = 60;
const LOCK_IN_DELAY_MS = 650;
const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;
const OPTIONS: QuizOption[] = ["A", "B", "C", "D"];

interface Props {
  tierName: string;
  questions: QuizQuestion[];
  submitting: boolean;
  errorMsg: string;
  // Called once every question is answered (or timed out). Unanswered = "".
  onFinish: (orderedAnswers: string[]) => void;
}

function Scene() {
  return (
    <svg viewBox="0 0 360 120" className="block w-full" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="360" height="120" fill="#0f2140" />
      <circle cx="292" cy="46" r="24" fill="#d9a94e" />
      <path d="M0 96 Q80 52 170 84 T360 70 V120 H0Z" fill="#163157" />
      <path d="M0 108 Q110 84 220 104 T360 96 V120 H0Z" fill="#0a1830" />
      <rect x="58" y="28" width="5" height="44" fill="#f3f7f6" />
      <rect x="49" y="38" width="23" height="5" fill="#f3f7f6" />
      <rect x="88" y="44" width="4" height="30" fill="#9db2c7" />
      <rect x="81" y="51" width="18" height="4" fill="#9db2c7" />
    </svg>
  );
}

export default function QuizPlayer({ tierName, questions, submitting, errorMsg, onFinish }: Props) {
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_QUESTION);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<QuizOption | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [eliminated, setEliminated] = useState<QuizOption[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [used, setUsed] = useState({ fifty: false, hint: false });
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gain, setGain] = useState<number | null>(null);

  const answersRef = useRef<string[]>([]);
  const lockedRef = useRef(false);
  const timeRef = useRef(SECONDS_PER_QUESTION);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  timeRef.current = timeLeft;

  const q = questions[index];
  const last = index === total - 1;
  // Instant feedback only when the backend sends the answer for every question.
  const instant = questions.every((x) => !!x.correct);

  const lock = useCallback(
    (opt: QuizOption | null) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setLocked(true);
      setPicked(opt);
      setTimedOut(opt === null);
      answersRef.current[index] = opt ?? "";
      if (instant) {
        if (opt !== null && opt === q.correct) {
          const g = 100 + Math.round((Math.max(0, timeRef.current) / SECONDS_PER_QUESTION) * 50);
          setPoints((p) => p + g);
          setStreak((s) => s + 1);
          setGain(g);
        } else {
          setStreak(0);
          setGain(null);
        }
      }
    },
    [index, instant, q]
  );

  const advance = useCallback(() => {
    if (last) {
      onFinishRef.current(questions.map((_, i) => answersRef.current[i] ?? ""));
      return;
    }
    lockedRef.current = false;
    setIndex((i) => i + 1);
    setLocked(false);
    setPicked(null);
    setTimedOut(false);
    setEliminated([]);
    setHintShown(false);
    setGain(null);
    setTimeLeft(SECONDS_PER_QUESTION);
  }, [last, questions]);

  // Countdown
  useEffect(() => {
    if (locked) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [locked, index]);

  useEffect(() => {
    if (timeLeft <= 0) lock(null);
  }, [timeLeft, lock]);

  // Without instant feedback, lock the answer in and move straight on.
  useEffect(() => {
    if (!locked || instant) return;
    const id = setTimeout(advance, LOCK_IN_DELAY_MS);
    return () => clearTimeout(id);
  }, [locked, instant, advance]);

  // Keyboard: A–D pick an answer
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toUpperCase() as QuizOption;
      if (OPTIONS.includes(k) && !eliminated.includes(k)) lock(k);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lock, eliminated]);

  function removeTwo() {
    if (locked || used.fifty || !q.correct) return;
    const wrong = OPTIONS.filter((o) => o !== q.correct);
    setEliminated(wrong.slice(0, 2));
    setUsed((u) => ({ ...u, fifty: true }));
  }

  function showHint() {
    if (locked || used.hint || !q.hint) return;
    setHintShown(true);
    setUsed((u) => ({ ...u, hint: true }));
  }

  function optionClass(opt: QuizOption) {
    const base =
      "flex min-h-[52px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors";
    if (eliminated.includes(opt)) return `${base} pointer-events-none border-white/10 bg-navy-700 opacity-20`;
    if (locked) {
      if (instant && opt === q.correct) return `${base} border-teal-light bg-teal text-navy-900`;
      if (opt === picked)
        return instant
          ? `${base} border-red-300/60 bg-red-900/50 text-paper`
          : `${base} border-gold-400 bg-gold-400/15 text-paper`;
      return `${base} border-white/10 bg-navy-700 text-paper/40`;
    }
    return `${base} border-white/15 bg-navy-700 text-paper hover:border-teal/60`;
  }

  const shown = Math.max(0, timeLeft);
  const urgent = shown <= 5;
  const correct = instant && picked !== null && picked === q.correct;

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="relative overflow-hidden rounded-2xl border border-white/10">
        <Scene />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between text-sm font-medium">
          <span className="rounded-full border border-teal/50 bg-navy-900/80 px-3 py-1 text-gold-400">
            {instant ? `🔥 ${streak}` : tierName}
          </span>
          <span className="rounded-full border border-teal/50 bg-navy-900/80 px-3 py-1 text-gold-400">
            {instant ? `⭐ ${points}` : `${index + 1}/${total}`}
          </span>
        </div>
        <div
          className="absolute bottom-2 left-1/2 h-[68px] w-[68px] -translate-x-1/2"
          role="timer"
          aria-label={`${shown} seconds left`}
        >
          <svg viewBox="0 0 68 68" className="h-full w-full">
            <circle cx="34" cy="34" r="30" fill="#050d1a" />
            <circle cx="34" cy="34" r={RING_R} fill="none" stroke="#1c3358" strokeWidth="5" />
            <circle
              cx="34"
              cy="34"
              r={RING_R}
              fill="none"
              stroke={urgent ? "#fca5a5" : "#39b8ac"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={RING_C}
              strokeDashoffset={RING_C * (1 - shown / SECONDS_PER_QUESTION)}
              transform="rotate(-90 34 34)"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
            />
            <text x="34" y="40" textAnchor="middle" fontSize="18" fontWeight="600" fill="#f3f7f6">
              {shown}
            </text>
          </svg>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-paper/60">
          <span>
            {tierName} difficulty · Question {index + 1} of {total}
          </span>
          {instant && <span className="text-gold-400">100 + speed bonus</span>}
        </div>
        <div className="flex gap-1.5" aria-hidden="true">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < index ? "bg-teal" : i === index ? "bg-gold-400" : "bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      <div key={index} className="flex flex-col gap-3 animate-fade-slide-up">
        <p className="flex min-h-[76px] items-center justify-center px-1 text-center font-display text-xl leading-snug text-paper">
          {q.question}
        </p>
        <p className="min-h-[20px] text-center text-sm text-teal-light" aria-live="polite">
          {hintShown ? q.hint : ""}
        </p>
        <div className="flex flex-col gap-2.5">
          {OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={locked || eliminated.includes(opt)}
              onClick={() => lock(opt)}
              className={optionClass(opt)}
            >
              <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-gold-400 text-sm font-semibold text-navy-900">
                {opt}
              </span>
              <span>{q.options[opt]}</span>
            </button>
          ))}
        </div>
      </div>

      {instant && !locked && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={removeTwo}
            disabled={used.fifty}
            className="flex-1 rounded-xl border border-white/15 px-2 py-2 text-xs text-paper/70 transition-colors hover:border-teal/60 disabled:opacity-30"
          >
            <span className="block text-base text-gold-400">50/50</span>
            Remove two
          </button>
          {q.hint && (
            <button
              type="button"
              onClick={showHint}
              disabled={used.hint}
              className="flex-1 rounded-xl border border-white/15 px-2 py-2 text-xs text-paper/70 transition-colors hover:border-teal/60 disabled:opacity-30"
            >
              <span className="block text-base text-gold-400">Hint</span>
              A clue
            </button>
          )}
        </div>
      )}

      {instant && locked && (
        <div className="flex flex-col gap-3 animate-pop-in" aria-live="polite">
          <div className="rounded-xl bg-navy-700 px-4 py-3">
            <p className={`font-medium ${correct ? "text-teal-light" : "text-red-300"}`}>
              {correct ? `Correct. +${gain} pts` : timedOut ? "Time's up" : "Not quite"}
            </p>
            {q.reference && <p className="mt-0.5 text-sm text-paper/60">Read it in {q.reference}</p>}
          </div>
          <button
            type="button"
            onClick={advance}
            disabled={submitting}
            className="rounded-xl bg-gold-400 px-4 py-3 text-center font-medium text-navy-900 transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? "Submitting..." : last ? "See results" : "Next question"}
          </button>
        </div>
      )}

      {!instant && locked && last && (
        <p className="text-center text-sm text-paper/60">{submitting ? "Submitting..." : ""}</p>
      )}

      {errorMsg && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-red-300">{errorMsg}</p>
          {locked && last && (
            <button
              type="button"
              onClick={advance}
              disabled={submitting}
              className="rounded-xl bg-teal px-4 py-3 text-center font-medium text-navy-900 disabled:opacity-40"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
