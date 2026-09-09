"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isValidSaMobile, normalizeSaMobile } from "@/lib/validatePhone";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

type Status = "idle" | "checking" | "error";

export default function PhoneInput() {
  const router = useRouter();
  const { setSession } = useSession();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = isValidSaMobile(value);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;

    const waId = normalizeSaMobile(value);
    if (!waId) return;

    setStatus("checking");
    try {
      const result = await api.login(waId);
      if (result.found) {
        setSession({
          waId: result.waId,
          firstName: result.firstName || "",
          fullName: result.fullName || "",
          zone: result.zone,
        });
        router.push("/verse");
      } else {
        router.push(`/register?wa_id=${encodeURIComponent(waId)}`);
      }
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't reach the server. Check your connection and try again.");
    }
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
        <p className="text-sm text-red-300">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={value.length === 0 || status === "checking"}
        className="mt-1 rounded-card bg-teal px-4 py-3 font-medium text-navy-900 transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {status === "checking" ? "Checking..." : "Continue"}
      </button>
    </form>
  );
}
