"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { useAccountStore } from "@/lib/store/accountStore";

interface Account {
  id: number;
  balance: number;
  accountNumber: string;
  totalContributions: number;
  rewards: number;
  totalDebt: number;
  referralEarnings: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: number;
  fullname: string;
  phone: string;
  plan: string;
  referralId: string;
  registrationPaid: boolean;
  accountId?: string;
  balance?: number;
  accounts?: Account[];
  notifications?: string[];
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
  handleAccountSwitch: (accountId: number) => void;
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
  const [loading, setLoading] = useState(!initialUser);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get active account ID from Zustand store
  const { activeAccountId, setActiveAccountId } = useAccountStore();

  // Initialize user when initialUser prop changes
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
    }
  }, [initialUser]);

  // Update accounts when user changes
  useEffect(() => {
    if (!user) {
      setAccounts([]);
      setActiveAccount(null);
      return;
    }

    const accs =
      Array.isArray(user.accounts) && user.accounts.length > 0
        ? user.accounts
        : [];

    setAccounts(accs);

    // Set active account based on Zustand store or default to first account
    if (accs.length > 0) {
      if (activeAccountId) {
        const selectedAccount = accs.find((a) => a.id === activeAccountId);
        setActiveAccount(selectedAccount || accs[0]);
      } else {
        setActiveAccount(accs[0]);
        setActiveAccountId(accs[0].id);
      }
    }
  }, [user, activeAccountId, setActiveAccountId]);

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

  // Handle account switching
  const handleAccountSwitch = (accountId: number) => {
    const selected = accounts.find((a) => a.id === accountId);
    if (selected) {
      setActiveAccountId(accountId);
      setActiveAccount(selected);
      setDropdownOpen(false);
    }
  };

  const handleLogout = () => {
    useAccountStore.getState().clearActiveAccount();
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
