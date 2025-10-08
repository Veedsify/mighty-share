"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../../../../components/DashboardProvider";

interface Transaction {
  reference: string;
  amount: number;
  status: "successful" | "pending" | "failed";
  created_at: string;
  type?: string;
  date?: string;
}

export default function PaymentHistory() {
  const { user, activeAccount } = useDashboard();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!activeAccount?.transactions) return;

    // Parse transactions from JSON field
    try {
      const txData =
        typeof activeAccount.transactions === "string"
          ? JSON.parse(activeAccount.transactions)
          : activeAccount.transactions;

      if (Array.isArray(txData)) {
        setTransactions(txData);
      }
    } catch (error) {
      console.error("Error parsing transactions:", error);
    }
  }, [activeAccount]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">💳 Payment History</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions yet.</p>
      ) : (
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Reference</th>
              <th className="px-4 py-2 text-left">Amount (₦)</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.reference} className="border-t">
                <td className="px-4 py-2">{tx.reference}</td>
                <td className="px-4 py-2">₦{tx.amount.toLocaleString()}</td>
                <td
                  className={`px-4 py-2 font-semibold ${
                    tx.status === "successful"
                      ? "text-green-600"
                      : tx.status === "pending"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {tx.status}
                </td>
                <td className="px-4 py-2">
                  {new Date(tx.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
