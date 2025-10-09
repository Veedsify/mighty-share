"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useDashboard } from "../../../../../components/DashboardProvider";

interface SettlementAccount {
  id: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export default function ManageSettlementAccountsPage() {
  const router = useRouter();
  const { user } = useDashboard();
  const [accounts, setAccounts] = useState<SettlementAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await axios.get(`/api/settlement-accounts`, {
          withCredentials: true,
        });

        if (data.error) {
          setError(data.error || "Failed to load accounts");
        } else {
          setAccounts(data.accounts || []);
        }
      } catch (err: any) {
        setError(
          err.response?.data?.error || err.message || "Failed to load accounts"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <p className="text-gray-600">Loading settlement accounts...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A2B88] mb-2">
            Manage Settlement Accounts
          </h1>
          <p className="text-gray-600">
            View, edit, or remove your settlement accounts.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/settlements/add")}
          className="px-4 py-2 bg-[#1A2B88] text-white rounded-md hover:opacity-90"
        >
          Add New Account
        </button>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {accounts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            No settlement accounts added yet.
          </p>
          <button
            onClick={() => router.push("/dashboard/settlements/add")}
            className="px-4 py-2 bg-[#FC0FC0] text-[#1A2B88] rounded-md hover:opacity-90"
          >
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="border rounded-lg p-4 hover:bg-gray-50 flex justify-between items-center"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{account.bankName}</h3>
                  {account.isDefault && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-semibold">
                      Default
                    </span>
                  )}
                  {account.isVerified && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-semibold">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-700">{account.accountName}</p>
                <p className="text-gray-600 text-sm font-mono">
                  {account.accountNumber}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Added: {new Date(account.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-100">
                  Edit
                </button>
                <button className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
