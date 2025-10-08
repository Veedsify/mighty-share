"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
  id: number;
  fullname: string;
  phone: string;
}

interface SessionContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  logout: async () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current session user from API
  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        console.error("Session fetch failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  // ✅ Logout function
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      window.location.href = "/login"; // force redirect
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <SessionContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
