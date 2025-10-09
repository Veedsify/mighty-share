"use client";

import { useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import axios from "axios";

interface NextSettlementAccount {
  id: number;
  accountNumber: string;
  amount: number;
  scheduledDate: string;
  settlementCycle: string;
  priority: string;
  status: string;
}

export default function NextSettlementPage() {
  const [accounts, setAccounts] = useState<NextSettlementAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/settlements/next-settlement", {
          withCredentials: true,
        });

        if (data.nextSettlementAccounts) {
          setAccounts(data.nextSettlementAccounts);
        }
      } catch (error) {
        console.error("Error fetching next settlement accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    if (filter === "all") return true;
    return account.settlementCycle === filter;
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 font-semibold";
      case "normal":
        return "text-gray-600";
      case "low":
        return "text-gray-400";
      default:
        return "";
    }
  };

  const getCycleBadgeColor = (cycle: string) => {
    switch (cycle) {
      case "weekly":
        return "bg-blue-100 text-blue-800";
      case "monthly":
        return "bg-green-100 text-green-800";
      case "quarterly":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilSettlement = (scheduledDate: string) => {
    const today = new Date();
    const scheduled = new Date(scheduledDate);
    const diffTime = scheduled.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2B88] mb-2">
          Accounts for Next Settlement
        </h1>
        <p className="text-gray-600">
          View accounts scheduled for the upcoming settlement cycle
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Accounts</p>
          <p className="text-2xl font-bold text-[#1A2B88]">{accounts.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-green-600">
            ₦
            {accounts
              .reduce((sum, acc) => sum + acc.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Weekly Cycle</p>
          <p className="text-2xl font-bold text-purple-600">
            {accounts.filter((acc) => acc.settlementCycle === "weekly").length}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Monthly Cycle</p>
          <p className="text-2xl font-bold text-orange-600">
            {accounts.filter((acc) => acc.settlementCycle === "monthly").length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All Cycles
        </button>
        <button
          onClick={() => setFilter("weekly")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "weekly"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setFilter("monthly")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "monthly"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setFilter("quarterly")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "quarterly"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Quarterly
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No accounts scheduled for next settlement
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Account Number
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right">
                  Amount
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Scheduled Date
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center">
                  Days Until
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center">
                  Cycle
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center">
                  Priority
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => {
                const daysUntil = getDaysUntilSettlement(account.scheduledDate);
                return (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3">
                      {account.accountNumber}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                      ₦{account.amount.toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(account.scheduledDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span
                          className={`font-semibold ${
                            daysUntil <= 3 ? "text-red-600" : "text-gray-700"
                          }`}
                        >
                          {daysUntil} days
                        </span>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getCycleBadgeColor(
                          account.settlementCycle
                        )}`}
                      >
                        {account.settlementCycle.toUpperCase()}
                      </span>
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 text-center ${getPriorityClass(
                        account.priority
                      )}`}
                    >
                      {account.priority.toUpperCase()}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      <span className="capitalize text-green-600 font-semibold">
                        {account.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
