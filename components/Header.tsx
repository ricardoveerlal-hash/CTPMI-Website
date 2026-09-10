"use client";

import Link from "next/link";
import { useSession } from "@/lib/session";

const links = [
  { href: "/verse", label: "Verse Of the Day" },
  { href: "/quiz", label: "Quiz" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export default function Header() {
  const { session, loading } = useSession();

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4 sm:max-w-2xl">
        <a href="/" aria-label="CTPMI home" className="flex items-center">
          <img
            src="/ctpmi-icon.png"
            alt="Conquering Through Prayer Ministries International logo"
            className="h-9 w-9 object-contain drop-shadow-[0_0_10px_rgba(47,191,178,0.45)]"
          />
        </a>
        <nav className="flex items-center gap-2.5 text-[11px] text-paper/70 sm:gap-4 sm:text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-teal"
            >
              {link.label}
            </Link>
          ))}
          {!loading && (
            <Link
              href={session ? "/profile" : "/login"}
              className="rounded-full border border-white/15 px-2.5 py-1 text-paper/80 transition-colors hover:border-teal hover:text-teal"
            >
              {session ? session.firstName : "Log in"}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
