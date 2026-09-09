import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { SessionProvider } from "@/lib/session";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CTPMI | Daily Word",
  description:
    "Conquering Through Prayer Ministries International — daily verse, Bible quiz, and leaderboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="font-body min-h-screen">
        <SessionProvider>
          <Header />
          <main className="mx-auto w-full max-w-md px-5 pb-16 pt-6 sm:max-w-2xl">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}
