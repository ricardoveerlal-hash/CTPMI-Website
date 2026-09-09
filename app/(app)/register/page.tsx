"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useSession } from "@/lib/session";

const ZONES = [
  "Overport / Bonela",
  "Sydenham / Sherwood",
  "Asherville / Clare Estate",
  "CBD / Musgrave / Morningside",
  "Springfield / Springtown",
  "Durban North / Kenville / Parlock",
  "Chatsworth",
  "Newlands",
  "Umhlanga / Verulam / North Coast",
  "Phoenix",
  "Umbilo / Glenwood",
  "Durban South / Malvern / South Coast",
  "Reservoir Hills / Westville",
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { setSession } = useSession();
  const waId = params.get("wa_id") || "";

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [zone, setZone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [isCtpmiMember, setIsCtpmiMember] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const canSubmit =
    waId &&
    firstName.trim().length >= 2 &&
    birthDay &&
    birthMonth &&
    isCtpmiMember !== null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await api.register({
        wa_id: waId,
        firstName: firstName.trim(),
        surname: surname.trim(),
        zone,
        email: email.trim(),
        isCtpmiMember: !!isCtpmiMember,
        birthDay: Number(birthDay),
        birthMonth: Number(birthMonth),
      });
      if (result.success) {
        setSession({
          waId: result.waId || waId,
          firstName: firstName.trim(),
          fullName: result.fullName || `${firstName} ${surname}`.trim(),
          zone,
        });
        router.push("/today");
      } else {
        setError(result.error || "Something went wrong — please check your details.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!waId) {
    return (
      <p className="pt-8 text-sm text-paper/60">
        Missing number — go back and enter your cell number first.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 pt-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">
          Let&rsquo;s get you registered
        </h1>
        <p className="mt-2 text-sm text-paper/60">
          Just a few details — this is all we need to save your quiz progress.
        </p>
      </div>

      <Field label="Name">
        <input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="input"
          placeholder="First name"
        />
      </Field>

      <Field label="Surname (optional)">
        <input
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="input"
          placeholder="Surname"
        />
      </Field>

      <Field label="Area (optional)">
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="input"
        >
          <option value="">Select your area</option>
          {ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Birthday">
        <div className="flex gap-3">
          <select
            value={birthDay}
            onChange={(e) => setBirthDay(e.target.value)}
            className="input"
          >
            <option value="">Day</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <select
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
            className="input"
          >
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </Field>

      <Field label="Are you a CTPMI member?">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setIsCtpmiMember(true)}
            className={`flex-1 rounded-card border px-4 py-3 transition-colors ${
              isCtpmiMember === true
                ? "border-teal bg-teal/10 text-teal"
                : "border-white/15 text-paper/70"
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setIsCtpmiMember(false)}
            className={`flex-1 rounded-card border px-4 py-3 transition-colors ${
              isCtpmiMember === false
                ? "border-teal bg-teal/10 text-teal"
                : "border-white/15 text-paper/70"
            }`}
          >
            No
          </button>
        </div>
      </Field>

      <Field label="Email (optional)">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
          type="email"
        />
      </Field>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="rounded-card bg-teal px-4 py-3 font-medium text-navy-900 transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {submitting ? "Saving..." : "Finish registration"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-paper/70">{label}</label>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
