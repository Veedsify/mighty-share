"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { useDashboard } from "../../../../components/DashboardProvider";

// ✅ Plan limits (membership logic for Option A / B / C)
const PLAN_LIMITS: Record<string, { min: number; max: number }> = {
  A: { min: 1, max: 100 },
  B: { min: 1, max: 500 },
  C: { min: 1, max: 1 },
};

interface Account {
  accountId: string;
  referralId?: string;
  balance: number;
  regFeePaid?: boolean;
  createdAt?: number;
}

interface User {
  id?: string;
  plan?: string;
  accounts?: Account[];
  referralId?: string;
  verified?: boolean;
  balance?: number;
  [key: string]: any;
}

const formatAccountId = (raw: number | string): string => {
  const digits =
    String(raw ?? Date.now()).replace(/\D/g, "") || Date.now().toString();
  return `MS${digits}`;
};

const generateReferralId = (): string =>
  `REF-${Math.floor(Math.random() * 10000)}`;

export default function AddAccountPage() {
  const router = useRouter();
  const { user: contextUser, setUser } = useDashboard();
  const [qty, setQty] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  // ✅ Initialize accounts if not present
  useEffect(() => {
    if (!contextUser || typeof window === "undefined") return;

    const u: any = { ...contextUser };
    if (!Array.isArray(u.accounts) || u.accounts.length === 0) {
      u.accounts = [
        {
          accountId: formatAccountId(u.id || Date.now()),
          referralId: u.referralId || generateReferralId(),
          balance: Number(u.balance || 0),
          regFeePaid: !!u.verified,
          createdAt: Date.now(),
        },
      ];

      const sessions = JSON.parse(localStorage.getItem("mockSessions") || "{}");
      const users = JSON.parse(localStorage.getItem("mockUsers") || "{}");
      const currentId = sessions?.current?.userId;
      if (currentId) {
        users[currentId] = u;
        localStorage.setItem("mockUsers", JSON.stringify(users));
      }
      setUser(u);
    }
  }, [contextUser, setUser]);

  const user = contextUser as User | null;

  // ✅ Apply Plan A/B/C logic
  const limits = useMemo(() => {
    if (!user?.plan) return { min: 1, max: 1 };
    if (user.plan === "Option A") return PLAN_LIMITS.A;
    if (user.plan === "Option B") return PLAN_LIMITS.B;
    if (user.plan === "Option C") return PLAN_LIMITS.C;
    return { min: 1, max: 1 };
  }, [user?.plan]);

  const currentCount = user?.accounts?.length || 0;
  const remaining = Math.max(0, limits.max - currentCount);

  // ✅ Create new sub-accounts
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError("");
    setSuccessMsg("");

    try {
      const sessions = JSON.parse(localStorage.getItem("mockSessions") || "{}");
      const users = JSON.parse(localStorage.getItem("mockUsers") || "{}");
      const currentId = sessions?.current?.userId;
      const u: any = { ...users[currentId] };

      if (!Array.isArray(u.accounts) || u.accounts.length === 0) {
        u.accounts = [
          {
            accountId: formatAccountId(u.id || Date.now()),
            referralId: u.referralId || generateReferralId(),
            balance: Number(u.balance || 0),
            regFeePaid: !!u.verified,
            createdAt: Date.now(),
          },
        ];
      }

      const q = Number(qty);
      if (!(q >= 1)) throw new Error("Please enter a valid quantity.");
      if (currentCount + q > limits.max) {
        throw new Error(
          `You can only add up to ${remaining} more account(s) on plan ${user.plan}.`
        );
      }

      const createdIds: string[] = [];
      for (let i = 0; i < q; i++) {
        const newId = formatAccountId(Date.now() + i);
        u.accounts.push({
          accountId: newId,
          referralId: generateReferralId(),
          balance: 0,
          regFeePaid: false,
          createdAt: Date.now(),
        });
        createdIds.push(newId);
      }

      users[currentId] = u;
      localStorage.setItem("mockUsers", JSON.stringify(users));
      setUser(u);
      setSuccessMsg(
        `Successfully created ${q} account(s): ${createdIds.join(", ")}`
      );
      setQty(1);
    } catch (err: any) {
      setError(err.message || "Failed to create accounts.");
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className="w-5 h-5 text-[#1A2B88]" />
          <h1 className="text-2xl font-bold text-[#1A2B88]">Add Account</h1>
        </div>
        <p className="text-sm text-gray-600">
          Plan <b>{user.plan}</b> &middot; Current: <b>{currentCount}</b> &middot;
          Limit: <b>{limits.max}</b> &middot; Remaining: <b>{remaining}</b>
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 space-y-4 max-w-xl"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            How many sub-accounts to open?
          </label>
          <input
            type="number"
            min={1}
            max={Math.max(1, remaining)}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="w-full border rounded-md p-2"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            You can add up to <b>{remaining}</b> more account(s) on plan{" "}
            {user.plan}.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {successMsg && <p className="text-green-600 text-sm">{successMsg}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-md bg-[#FC0FC0] text-[#1A2B88] hover:opacity-90"
          >
            {busy ? "Creating…" : "Create Accounts"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-md border hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </form>

      {/* Account List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-2">Your Accounts</h2>
        {user.accounts?.length ? (
          <ul className="list-disc pl-6 space-y-1 text-sm">
            {user.accounts.map((a, idx) => (
              <li key={`${a.accountId}-${idx}`}>
                {idx === 0 ? "Primary" : `Account ${idx + 1}`} —{" "}
                <b>{a.accountId}</b> &middot; Referral: <b>{a.referralId}</b> &middot;
                Balance: <b>₦{Number(a.balance || 0).toLocaleString()}</b>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No accounts yet.</p>
        )}
      </div>
    </div>
  );
}
