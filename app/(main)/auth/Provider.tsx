"use client";

import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface Account {
  balance: number;
  accountNumber: string;
  transactions?: any; // JSON field from Prisma
  referrals?: any; // JSON field from Prisma
}

interface User {
  fullname: string;
  accountId?: string;
  balance?: number;
  accounts?: Account[];
  plan: string;
  registrationPaid: boolean;
  [key: string]: any;
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
        const res = await axios.get("/api/auth/me", {
          withCredentials: true,
        });
        const data = res.data;
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
  if (SessionContext === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return useContext(SessionContext);
}
