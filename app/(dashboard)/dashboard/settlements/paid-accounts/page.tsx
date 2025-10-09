"use client";

import { useEffect, useState } from "react";
import { Download, Search } from "lucide-react";
import axios from "axios";

interface PaidAccount {
  id: number;
  accountNumber: string;
  amount: number;
  settlementDate: string;
  reference: string;
  paymentMethod?: string;
}

export default function PaidAccountsPage() {
  const [accounts, setAccounts] = useState<PaidAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/settlements/paid-accounts", {
          withCredentials: true,
        });

        if (data.paidAccounts) {
          setAccounts(data.paidAccounts);
        }
      } catch (error) {
        console.error("Error fetching paid accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAccounts = accounts.filter(
    (account) =>
      account.accountNumber.includes(searchTerm) ||
      account.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // TODO: Implement export functionality
    alert("Export functionality coming soon!");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2B88] mb-2">
          All Paid Settlement Accounts
        </h1>
        <p className="text-gray-600">
          View history of successfully settled and paid out accounts
        </p>
      </div>

      {/* Search and Export */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by account number or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B88]"
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#00C4B4] text-white px-4 py-2 rounded-lg hover:bg-[#00a89c] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Paid Accounts</p>
          <p className="text-2xl font-bold text-[#1A2B88]">{accounts.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total Amount Paid</p>
          <p className="text-2xl font-bold text-green-600">
            ₦
            {accounts
              .reduce((sum, acc) => sum + acc.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">This Month</p>
          <p className="text-2xl font-bold text-purple-600">
            {
              accounts.filter((acc) => {
                const date = new Date(acc.settlementDate);
                const now = new Date();
                return (
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No paid accounts found
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Reference
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Account Number
                </th>
                <th className="border border-gray-300 px-4 py-3 text-right">
                  Amount
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Settlement Date
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left">
                  Payment Method
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 font-mono text-sm">
                    {account.reference}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {account.accountNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-right font-semibold">
                    ₦{account.amount.toLocaleString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {new Date(account.settlementDate).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {account.paymentMethod || "N/A"}
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
