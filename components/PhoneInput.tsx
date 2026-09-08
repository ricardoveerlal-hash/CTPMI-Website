"use client";

import { useState } from "react";
import { isValidSaMobile, normalizeSaMobile } from "@/lib/validatePhone";

type Status = "idle" | "checking" | "found" | "not_found" | "invalid" | "error";

export default function PhoneInput() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [touched, setTouched] = useState(false);

  const valid = isValidSaMobile(value);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);

    if (!valid) {
      setStatus("invalid");
      return;
    }

    const waId = normalizeSaMobile(value);
    setStatus("checking");

    // TODO: wire to n8n POST /web/login webhook once endpoint exists.
    // Placeholder keeps the UI honest about not being connected yet.
    console.log("Would check membership for", waId);
    setStatus("error");
  }

  const showError = touched && value.length > 0 && !valid;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="phone" className="text-sm text-paper/70">
        Cell number
      </label>
      <input
        id="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="082 123 4567"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setStatus("idle");
        }}
        onBlur={() => setTouched(true)}
        className={`rounded-card border bg-navy-800 px-4 py-3 text-base text-paper outline-none transition-colors placeholder:text-paper/30 ${
          showError
            ? "border-red-400/70 focus:border-red-400"
            : "border-white/15 focus:border-teal"
        }`}
      />
      {showError && (
        <p className="text-sm text-red-300">
          Enter a valid South African mobile number.
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-gold-400">
          Login isn&rsquo;t connected yet — this screen is a design preview.
        </p>
      )}
      <button
        type="submit"
        disabled={value.length === 0}
        className="mt-1 rounded-card bg-teal px-4 py-3 font-medium text-navy-900 transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        Continue
      </button>
    </form>
  );
}
