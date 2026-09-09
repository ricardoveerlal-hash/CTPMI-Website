import "../globals.css";
import Header from "@/components/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-md px-5 pb-16 pt-6 sm:max-w-2xl">
        {children}
      </main>
    </>
  );
}
