import Link from "next/link";

const links = [
  { href: "/", label: "Today" },
  { href: "/quiz", label: "Quiz" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/verse", label: "Verse" },
  { href: "/profile", label: "Profile" },
];

export default function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4 sm:max-w-2xl">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight text-paper">
          CTPMI
        </Link>
        <nav className="flex gap-2.5 text-[11px] text-paper/70 sm:gap-4 sm:text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-teal"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
