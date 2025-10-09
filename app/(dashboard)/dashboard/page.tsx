"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Wallet,
  DollarSign,
  Gift,
  CreditCard,
  Calendar,
  Link2,
  Bell,
  Activity,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";
import TopUpModal from "../../../components/TopUpModal";
import { useDashboard } from "../../../components/DashboardProvider";

export default function DashboardPage() {
  const router = useRouter();
  const { user, activeAccount, setUser } = useDashboard();
  const [thriftStatus, setThriftStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const NGN = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 2,
    }).format(Number.isFinite(n) ? n : 0);

  useEffect(() => {
    // Check for payment status in URL
    const params = new URLSearchParams(window.location.search);
    const topup = params.get("topup");
    const amount = params.get("amount");
    const regFee = params.get("reg_fee");
    const error = params.get("error");

    if (topup === "success") {
      const creditAmount = amount ? parseFloat(amount) : 0;
      const regFeeAmount = regFee ? parseFloat(regFee) : 0;

      if (regFeeAmount > 0) {
        setPaymentMessage({
          type: "success",
          text: `✅ Payment successful! Wallet credited with ${NGN(
            creditAmount
          )}. Registration fee of ${NGN(regFeeAmount)} has been deducted.`,
        });
      } else {
        setPaymentMessage({
          type: "success",
          text: `✅ Payment successful! Wallet credited with ${NGN(
            creditAmount
          )}.`,
        });
      }

      // Reload user data
      window.location.href = "/dashboard";
    } else if (topup === "failed") {
      const errorMsg = error || "unknown";
      setPaymentMessage({
        type: "error",
        text: `❌ Payment failed: ${errorMsg}. Please try again.`,
      });

      // Clear URL params
      window.history.replaceState({}, "", "/dashboard");
    }

    // Auto-hide message after 10 seconds
    if (paymentMessage) {
      const timer = setTimeout(() => setPaymentMessage(null), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    // calculate thrift progress
    const startDateStr = (user as any).planStartDate || (user as any).createdAt;
    const startDate = new Date(startDateStr);
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const weeksPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
    const monthsPassed = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));

    const plan = (user as any).plan;
    if (plan === "Option A") {
      setThriftStatus(`${Math.min(weeksPassed, 30)} / 30 Weeks`);
    } else if (plan === "Option B") {
      setThriftStatus(`${Math.min(monthsPassed, 7)} / 7 Months`);
    } else if (plan === "Option C") {
      setThriftStatus(
        monthsPassed >= 6 ? "Completed" : `${monthsPassed} / 6 Months`
      );
    } else {
      setThriftStatus("N/A");
    }
  }, [user]);

  if (!user || !activeAccount) return null;

  const copyReferralLink = () => {
    const url = `${window.location.origin}/signup?ref=${
      (user as any).referralId
    }`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTopUpSuccess = (accountsFromServer: any[]) => {
    if (Array.isArray(accountsFromServer) && accountsFromServer.length > 0) {
      setUser(
        user
          ? ({
              ...user,
              accounts: accountsFromServer,
              registrationPaid: true,
            } as any)
          : user
      );
    }
  };

  const userAny = user as any;
  const accountAny = activeAccount as any;

  return (
    <div className="space-y-6 p-6">
      {/* Payment Status Message */}
      {paymentMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`shadow-md rounded-lg p-4 ${
            paymentMessage.type === "success"
              ? "bg-green-50 border-l-4 border-green-500"
              : "bg-red-50 border-l-4 border-red-500"
          }`}
        >
          <div className="flex items-center justify-between">
            <p
              className={`font-medium ${
                paymentMessage.type === "success"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {paymentMessage.text}
            </p>
            <button
              onClick={() => setPaymentMessage(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      {/* Welcome */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, MightyShare {userAny.fullname || userAny.fullName}
        </h1>
        <p className="text-gray-600">
          Plan: {userAny.plan} | Referral: {userAny.referralId}
        </p>
        <p className="text-gray-600">
          Registration Fee:{" "}
          {userAny.registrationPaid ? (
            <span className="text-green-600 font-semibold">Paid</span>
          ) : (
            <span className="text-red-600 font-semibold">Pending</span>
          )}
        </p>
      </div>

      {/* Notifications */}
      <div className="bg-red-500 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-black" />
          Notifications
        </h3>
        {userAny.notifications?.length ? (
          <ul className="list-disc pl-5 space-y-2 text-black">
            {userAny.notifications.map((note: string, i: number) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        ) : (
          <p className="text-black">No new notifications.</p>
        )}
      </div>

      {/* Referral + Add Account */}
      <div className="flex items-center flex-wrap gap-3">
        <p className="text-gray-700 font-medium">
          Referral ID: {userAny.referralId}
        </p>
        <button
          onClick={copyReferralLink}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
        >
          <Link2 className="w-4 h-4" /> Copy Link
        </button>
        {copied && (
          <span className="text-xs text-green-600 font-medium">Copied!</span>
        )}
        <button
          onClick={() => router.push("/dashboard/add-account")}
          className="ml-auto flex items-center gap-2 px-3 py-2 rounded-md bg-[#FC0FC0] text-[#1A2B88] hover:opacity-90"
        >
          <UserPlus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Wallet + Thrift */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Wallet className="w-5 h-5" /> Wallet Balance
          </h2>
          <p className="text-2xl font-bold mt-2 text-indigo-600">
            {NGN(accountAny.balance)}
          </p>
          <button
            onClick={() => setShowTopUp(true)}
            className="mt-3 inline-block bg-[#00C4B4] hover:bg-[#009b91] text-white px-4 py-2 rounded-lg"
          >
            Top Up Wallet
          </button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Calendar className="w-5 h-5" /> Thrift Progress
          </h2>
          <p className="text-xl font-bold mt-2">{thriftStatus}</p>
        </motion.div>
      </div>

      {/* Rewards + Debt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Gift className="w-5 h-5" /> Rewards
          </h2>
          <p className="text-xl font-bold mt-2">
            {NGN(accountAny.rewards || 0)}
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <CreditCard className="w-5 h-5" /> Total Debt
          </h2>
          <p className="text-xl font-bold mt-2 text-red-600">
            {NGN(accountAny.totalDebt || 0)}
          </p>
        </motion.div>
      </div>

      {/* Activity + Referral Earnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <Activity className="w-5 h-5" /> Recent Activity
          </h2>
          {accountAny.transactions?.length ? (
            <ul className="mt-2 space-y-1 text-gray-600">
              {accountAny.transactions
                .slice(0, 5)
                .map((tx: any, idx: number) => (
                  <li key={idx} className="text-sm">
                    {tx.date} — {tx.type}: {NGN(tx.amount)}
                  </li>
                ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              No recent transactions.
            </p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white shadow rounded-lg p-6"
        >
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-700">
            <DollarSign className="w-5 h-5" /> Referral Earnings
          </h2>
          <p className="text-xl font-bold mt-2 text-green-600">
            {NGN(accountAny.referralEarnings || 0)}
          </p>
        </motion.div>
      </div>

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={showTopUp}
        onClose={() => setShowTopUp(false)}
        onSuccess={handleTopUpSuccess}
        userPlan={user?.plan || "A"}
        registrationPaid={user?.registrationPaid || false}
      />
    </div>
  );
}
