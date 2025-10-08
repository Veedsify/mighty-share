"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, createContext, useContext } from "react";

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
  [key: string]: any;
}

interface DashboardContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  accounts: Account[];
  activeAccount: Account | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  handleAccountSwitch: (accountId: string) => void;
  handleLogout: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }
  return context;
};

interface DashboardProviderProps {
  children: React.ReactNode;
  initialUser: User | null;
}

export function DashboardProvider({
  children,
  initialUser,
}: DashboardProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(initialUser);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(!initialUser); // Loading only if no initial user
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize user when initialUser prop changes (e.g., on navigation)
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
    }
  }, [initialUser]);

  // ✅ Update accounts when user changes
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setActiveAccount(null);
      return;
    }

    // ✅ Fallback accounts
    const accs =
      Array.isArray(user.accounts) && user.accounts.length > 0
        ? user.accounts
        : [
            {
              accountNumber: "MS" + Date.now(),
              balance: user.balance || 0,
            },
          ];

    // ✅ Determine active account
    setAccounts(accs);
    setActiveAccount(accs[0] || null);
  }, [user]);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle account switching
  const handleAccountSwitch = (accountNumber: string) => {
    const sessions = JSON.parse(localStorage.getItem("mockSessions") || "{}");
    sessions.current = { ...sessions.current, accountNumber };
    localStorage.setItem("mockSessions", JSON.stringify(sessions));
    const selected = accounts.find((a) => a.accountNumber === accountNumber);
    setActiveAccount(selected || null);
    setDropdownOpen(false);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("mockSessions");
    router.replace("/login");
  };

  const value: DashboardContextType = {
    user,
    setUser,
    accounts,
    activeAccount,
    sidebarOpen,
    setSidebarOpen,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleAccountSwitch,
    handleLogout,
    loading,
    setLoading,
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1A2B88] border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}
