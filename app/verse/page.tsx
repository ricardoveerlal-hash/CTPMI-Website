"use client";

import { useEffect, useState } from "react";
import { api, type VerseResponse } from "@/lib/api";

export default function VersePage() {
  const [verse, setVerse] = useState<VerseResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    api
      .getVerse()
      .then(setVerse)
      .catch(() => setErrorMsg("Couldn't load today's verse right now."));
  }, []);

  return (
    <div className="flex flex-col gap-8 pt-4">
      <h1 className="font-display text-2xl font-semibold text-paper">
        Verse of the day
      </h1>

      {errorMsg && <p className="text-sm text-red-300">{errorMsg}</p>}

      {verse && (
        <div className="border-b border-white/10 pb-6">
          <p className="text-sm text-teal">{verse.date}</p>
          <p className="mt-2 font-display text-xl leading-snug text-paper">
            &ldquo;{verse.text}&rdquo;
          </p>
          <p className="mt-1 text-sm text-paper/50">{verse.ref}</p>
        </div>
      )}

      {!verse && !errorMsg && (
        <p className="text-sm text-paper/50">Loading...</p>
      )}
    </div>
  );
}
