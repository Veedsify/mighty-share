"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import axios from "axios";

interface ClearanceAccount {
  id: number;
  accountNumber: string;
  accountName: string;
  amount: number;
  bankName: string;
  dueDate: string;
  status: string;
  priority: string;
  notes?: string;
}

export default function DueClearancePage() {
  const [accounts, setAccounts] = useState<ClearanceAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/settlements/due-clearance", {
          withCredentials: true,
        });

        if (data.clearanceAccounts) {
          setAccounts(data.clearanceAccounts);
        }
      } catch (error) {
        console.error("Error fetching clearance accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    if (filter === "all") return true;
    return account.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "processing":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "cleared":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

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

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2B88] mb-2">
          Accounts Due for Clearance
        </h1>
        <p className="text-gray-600">
          View and manage accounts scheduled for settlement clearance
        </p>
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
          All
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "pending"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("processing")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "processing"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Processing
        </button>
        <button
          onClick={() => setFilter("cleared")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "cleared"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Cleared
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No accounts found for clearance
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Account Number
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Description
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right">
                  Amount
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Due Date
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center">
                  Priority
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center">
                  Status
                </th>
                <th className="border border-gray-300 px-4 py-3 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3">
                    {account.accountNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {account.accountName}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right">
                    ₦{account.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {new Date(account.dueDate).toLocaleDateString()}
                  </td>
                  <td
                    className={`border border-gray-300 px-4 py-3 text-center ${getPriorityClass(
                      account.priority
                    )}`}
                  >
                    {account.priority.toUpperCase()}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {getStatusIcon(account.status)}
                      <span className="capitalize">{account.status}</span>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <button className="bg-[#00C4B4] text-white px-3 py-1 rounded hover:bg-[#00a89c] transition-colors">
                      Process
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
