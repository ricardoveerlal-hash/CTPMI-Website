"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { api, type ProfileResponse, type QuizTodayResponse } from "@/lib/api";
import { ZONES, MONTHS } from "@/lib/constants";

export default function ProfilePage() {
  const { session, loading: sessionLoading, clearSession, setSession } = useSession();
  const [quiz, setQuiz] = useState<QuizTodayResponse | null>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [zone, setZone] = useState("");
  const [email, setEmail] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [isCtpmiMember, setIsCtpmiMember] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading || !session) return;
    api.getQuizToday(session.waId).then(setQuiz).catch(() => {});
    api
      .getProfile(session.waId)
      .then((p) => {
        setProfile(p);
        setFirstName(p.firstName || "");
        setSurname(p.surname || "");
        setZone(p.zone || "");
        setEmail(p.email || "");
        setBirthDay(p.birthDay ? String(p.birthDay) : "");
        setBirthMonth(p.birthMonth ? String(p.birthMonth) : "");
        setIsCtpmiMember(p.isCtpmiMember ?? null);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, [session, sessionLoading]);

  if (!sessionLoading && !session) {
    return (
      <div className="flex flex-col gap-4 pt-8">
        <p className="text-sm text-paper/70">Log in to see your stats.</p>
        <Link href="/login" className="text-sm text-teal hover:underline">
          Log in
        </Link>
      </div>
    );
  }

  const accuracy =
    quiz && quiz.totalPlayed > 0
      ? Math.round((quiz.totalCorrect / (quiz.totalPlayed * 5)) * 100)
      : null;

  const canSave = firstName.trim().length >= 2;

  async function handleSave() {
    if (!session || !canSave) return;
    setSaving(true);
    setError("");
    try {
      const res = await api.updateProfile({
        wa_id: session.waId,
        firstName: firstName.trim(),
        surname: surname.trim(),
        zone,
        email: email.trim(),
        isCtpmiMember: !!isCtpmiMember,
        birthDay: birthDay ? Number(birthDay) : null,
        birthMonth: birthMonth ? Number(birthMonth) : null,
      });
      if (res.success) {
        setProfile((prev) => ({
          ...(prev || { found: true, waId: session.waId }),
          firstName: firstName.trim(),
          surname: surname.trim(),
          fullName: res.fullName,
          zone,
          email: email.trim(),
          birthDay: birthDay ? Number(birthDay) : null,
          birthMonth: birthMonth ? Number(birthMonth) : null,
          isCtpmiMember: !!isCtpmiMember,
        }));
        setSession({ ...session, firstName: firstName.trim(), zone });
        setEditing(false);
      } else {
        setError(res.error || "Couldn't save your details.");
      }
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 pt-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-paper">
          {session ? `Hi, ${session.firstName}` : "Your stats"}
        </h1>
        {profile?.zone && !editing && (
          <p className="mt-1 text-sm text-paper/50">{profile.zone}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Difficulty" value={quiz?.tierName || "—"} />
        <Stat label="Quizzes played" value={String(quiz?.totalPlayed ?? 0)} />
        <Stat label="Correct answers" value={String(quiz?.totalCorrect ?? 0)} />
        <Stat label="Accuracy" value={accuracy !== null ? `${accuracy}%` : "—"} />
      </div>

      <section className="flex flex-col gap-4 rounded-card border border-white/10 bg-navy-800 p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-paper">
            Your details
          </p>
          {!editing && !profileLoading && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-teal hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {profileLoading && (
          <p className="text-sm text-paper/50">Loading...</p>
        )}

        {!profileLoading && !editing && (
          <div className="flex flex-col gap-3">
            <Detail label="Name" value={profile?.fullName || "—"} />
            <Detail label="Cell number" value={profile?.cellNumber || "—"} />
            <Detail label="Area" value={profile?.zone || "Not set"} />
            <Detail label="Email" value={profile?.email || "Not set"} />
            <Detail
              label="Birthday"
              value={
                profile?.birthDay && profile?.birthMonth
                  ? `${profile.birthDay} ${MONTHS[profile.birthMonth - 1]}`
                  : "Not set"
              }
            />
            <Detail
              label="CTPMI member"
              value={profile?.isCtpmiMember === true ? "Yes" : profile?.isCtpmiMember === false ? "No" : "Not set"}
            />
          </div>
        )}

        {!profileLoading && editing && (
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" placeholder="First name" />
            </Field>
            <Field label="Surname">
              <input value={surname} onChange={(e) => setSurname(e.target.value)} className="input" placeholder="Surname" />
            </Field>
            <Field label="Area">
              <select value={zone} onChange={(e) => setZone(e.target.value)} className="input">
                <option value="">Select your area</option>
                {ZONES.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </Field>
            <Field label="Email">
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" type="email" />
            </Field>
            <Field label="Birthday">
              <div className="flex gap-3">
                <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} className="input">
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} className="input">
                  <option value="">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </Field>
            <Field label="CTPMI member?">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCtpmiMember(true)}
                  className={`flex-1 rounded-card border px-4 py-3 transition-colors ${
                    isCtpmiMember === true ? "border-teal bg-teal/10 text-teal" : "border-white/15 text-paper/70"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsCtpmiMember(false)}
                  className={`flex-1 rounded-card border px-4 py-3 transition-colors ${
                    isCtpmiMember === false ? "border-teal bg-teal/10 text-teal" : "border-white/15 text-paper/70"
                  }`}
                >
                  No
                </button>
              </div>
            </Field>

            {error && <p className="text-sm text-red-300">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-card border border-white/15 px-4 py-3 text-paper/70"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave || saving}
                className="flex-1 rounded-card bg-teal px-4 py-3 font-medium text-navy-900 transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </section>

      <button
        onClick={clearSession}
        className="self-start text-sm text-paper/50 transition-colors hover:text-red-300"
      >
        Log out
      </button>
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
      <span className="text-xs text-paper/50">{label}</span>
      <span className="text-sm text-paper">{value}</span>
    </div>
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
