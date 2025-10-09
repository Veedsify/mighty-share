"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, AlertTriangle } from "lucide-react";
import { useDashboard } from "../../../../components/DashboardProvider";
import PlanConfig from "@/config/plan";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function AddAccountPage() {
  const router = useRouter();
  const { user, setUser } = useDashboard();
  const [qty, setQty] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Get plan limits from PlanConfig
  const limits = useMemo(() => {
    if (!user?.plan) return { accountLimit: 1 };

    // Extract plan key (A, B, C)
    const planKey = user.plan as keyof typeof PlanConfig;
    return {
      accountLimit: PlanConfig[planKey]?.accountLimit || 1,
    };
  }, [user?.plan]);

  const currentCount = user?.accounts?.length || 0;
  const remaining = Math.max(0, limits.accountLimit - currentCount);

  // Create new sub-accounts
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setBusy(true);
    setError("");
    setSuccessMsg("");

    try {
      const q = Number(qty);

      if (!(q >= 1)) {
        throw new Error("Please enter a valid quantity.");
      }

      if (currentCount >= limits.accountLimit) {
        setShowLimitModal(true);
        setBusy(false);
        return;
      }

      if (currentCount + q > limits.accountLimit) {
        setShowLimitModal(true);
        setBusy(false);
        return;
      }

      // Create accounts via API
      const createdAccounts = [];
      for (let i = 0; i < q; i++) {
        const response = await axios.post(
          "/api/accounts/add",
          { userId: user.id },
          { withCredentials: true }
        );

        if (response.data.account) {
          createdAccounts.push(response.data.account);
        }
      }

      // Update local user state
      if (user.accounts) {
        setUser({
          ...user,
          accounts: [...user.accounts, ...createdAccounts],
        });
      }

      setSuccessMsg(`Successfully created ${q} account(s)!`);
      setQty(1);

      // Refresh page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(
        err.response?.data?.error || err.message || "Failed to create accounts."
      );
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-2">
            <UserPlus className="w-5 h-5 text-[#1A2B88]" />
            <h1 className="text-2xl font-bold text-[#1A2B88]">Add Account</h1>
          </div>
          <p className="text-sm text-gray-600">
            Plan <b>{user.plan}</b> &middot; Current: <b>{currentCount}</b>{" "}
            &middot; Limit: <b>{limits.accountLimit}</b> &middot; Remaining:{" "}
            <b>{remaining}</b>
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
              defaultValue={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full border rounded-md p-2"
              required
              disabled={remaining <= 0}
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
              disabled={busy || remaining <= 0}
              className="px-4 py-2 rounded-md bg-[#FC0FC0] text-[#1A2B88] hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {busy
                ? "Creating…"
                : remaining <= 0
                ? "Limit Reached"
                : "Create Accounts"}
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
              {user.accounts.map((a: any, idx: number) => (
                <li key={`${a.accountNumber || a.accountId}-${idx}`}>
                  {idx === 0 ? "Primary" : `Account ${idx + 1}`} —{" "}
                  <b>{a.accountNumber || a.accountId}</b> &middot; Balance:{" "}
                  <b>₦{Number(a.balance || 0).toLocaleString()}</b>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No accounts yet.</p>
          )}
        </div>
      </div>

      {/* Limit Reached Modal */}
      <AnimatePresence>
        {showLimitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLimitModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-red-600 p-6 relative">
                <button
                  onClick={() => setShowLimitModal(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-700 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Account Limit Reached
                    </h2>
                    <p className="text-white text-sm">
                      Unable to create more accounts
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-center mb-6">
                    <p className="text-gray-700 mb-4">
                      You have reached the maximum number of accounts allowed
                      for your plan.
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Your Plan:</span>
                          <span className="font-semibold text-gray-900">
                            {user.plan}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Current Accounts:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {currentCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Maximum Allowed:
                          </span>
                          <span className="font-semibold text-gray-900">
                            {limits.accountLimit}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600">
                      To create more accounts, please upgrade your plan or
                      contact support.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowLimitModal(false)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Close
                  </button>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>Need help? Contact support@mightyshare.com</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
