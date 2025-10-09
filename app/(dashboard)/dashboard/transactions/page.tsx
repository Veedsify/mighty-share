"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../../../../components/DashboardProvider";

interface Transaction {
  id: number;
  reference: string;
  amount: number;
  type: string;
  status: "successful" | "pending" | "failed";
  paymentMethod?: string;
  description?: string;
  platformTransactionReference?: string;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentHistory() {
  const { user, activeAccount } = useDashboard();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!activeAccount?.accountNumber) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/transactions?accountId=${activeAccount.accountNumber}`
        );
        const data = await response.json();

        if (data.ok && data.transactions) {
          setTransactions(data.transactions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [activeAccount]);

  return (
    <div className="bg-white rounded-xl shadow p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">💳 Transaction History</h2>
      {loading ? (
        <p className="text-gray-500">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-gray-500">No transactions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Reference</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount (₦)</th>
                <th className="px-4 py-2 text-left">Payment Method</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">
                    {tx.reference}
                  </td>
                  <td className="px-4 py-2 capitalize">{tx.type}</td>
                  <td className="px-4 py-2 font-semibold">
                    ₦{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 capitalize">
                    {tx.paymentMethod || "-"}
                  </td>
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
