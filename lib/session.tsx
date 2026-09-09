"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface Session {
  waId: string;
  firstName: string;
  fullName: string;
  zone?: string;
}

interface SessionContextValue {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session) => void;
  clearSession: () => void;
}

const STORAGE_KEY = "ctpmi_session";

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSessionState(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setLoading(false);
  }, []);

  function setSession(next: Session) {
    setSessionState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function clearSession() {
    setSessionState(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <SessionContext.Provider
      value={{ session, loading, setSession, clearSession }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
