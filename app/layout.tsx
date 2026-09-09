import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Fraunces } from "next/font/google";
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

// The original site uses Fraunces for verse/quote styling (--ff-verse).
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CTPMI | Conquering Through Prayer",
  description:
    "Conquering Through Prayer Ministries International — a non-denominational church in Durban, South Africa. Reaching the city, the nation and the nations of the world through prayer and the gospel of Jesus Christ.",
};

// Root layout is intentionally minimal: the home page renders the original
// site's own header/nav/footer verbatim, so it must NOT be wrapped in the
// app's Header component. Pages under app/(app)/ get that via their own
// nested layout instead. See app/(app)/layout.tsx.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${fraunces.variable}`}
    >
      <body className="font-body min-h-screen">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
