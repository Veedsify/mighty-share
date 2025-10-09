import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  totalContributions: number;
  rewards: number;
  totalDebt: number;
  referralEarnings: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface AccountStore {
  activeAccountId: number | null;
  setActiveAccountId: (id: number) => void;
  clearActiveAccount: () => void;
}

export const useAccountStore = create<AccountStore>()(
  persist(
    (set) => ({
      activeAccountId: null,
      setActiveAccountId: (id: number) => set({ activeAccountId: id }),
      clearActiveAccount: () => set({ activeAccountId: null }),
    }),
    {
      name: "mightyshare-active-account",
    }
  )
);

export type { Account };
