"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../../../../../components/DashboardProvider";

interface Transaction {
  id: number;
  reference: string;
  amount: number;
  type: string;
  status: string;
  paymentMethod?: string;
  description?: string;
  createdAt: string;
}

export default function AllTransactionsPage() {
  const { activeAccount } = useDashboard();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activeAccount) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `/api/transactions?accountId=${activeAccount.accountId}`
        );
        const data = await res.json();

        if (data.ok) {
          setTransactions(data.transactions || []);
        } else {
          setError(data.error || "Failed to load transactions");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [activeAccount]);

  if (loading) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-[#1A2B88] mb-4">
        All Transactions
      </h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {transactions.length === 0 ? (
        <p className="text-gray-600">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount (₦)</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">
                    {tx.reference}
                  </td>
                  <td className="px-4 py-2 capitalize">{tx.type}</td>
                  <td className="px-4 py-2">₦{tx.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        tx.status === "successful"
                          ? "bg-green-100 text-green-800"
                          : tx.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {tx.paymentMethod || "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
