"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import axios from "axios";

interface Account {
  id: number;
  accountNumber: string;
  balance: number;
}

interface SelectedAccount {
  id: number;
  accountNumber: string;
  balance: number;
}

export default function BulkWithdrawalPage() {
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<SelectedAccount[]>(
    []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await axios.get("/api/accounts", {
          withCredentials: true,
        });

        if (data.accounts) {
          setAvailableAccounts(data.accounts);
        }
      } catch (error) {
        console.error("Error fetching accounts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const filteredAvailableAccounts = availableAccounts.filter(
    (account) =>
      !selectedAccounts.find((selected) => selected.id === account.id) &&
      account.accountNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddAccount = (account: Account) => {
    setSelectedAccounts([...selectedAccounts, account]);
    setSearchQuery("");
  };

  const handleRemoveAccount = (id: number) => {
    setSelectedAccounts(
      selectedAccounts.filter((account) => account.id !== id)
    );
  };

  const totalAmount = selectedAccounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAccounts.length === 0) {
      alert("Please add at least one account to the withdrawal request");
      return;
    }

    setIsSubmitting(true);
    // TODO: Submit to API
    setTimeout(() => {
      alert("Bulk withdrawal request submitted successfully!");
      setSelectedAccounts([]);
      setNotes("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A2B88] mb-2">
          Request Bulk Account Withdrawal
        </h1>
        <p className="text-gray-600">
          Submit withdrawal requests for multiple settlement accounts at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Accounts Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[#1A2B88] mb-3">
              Add Accounts to Request
            </h2>
            <input
              type="text"
              placeholder="Search by account number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B88]"
            />
          </div>

          {searchQuery && (
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {filteredAvailableAccounts.length === 0 ? (
                <p className="p-4 text-center text-gray-500">
                  No accounts found
                </p>
              ) : (
                filteredAvailableAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold text-[#1A2B88]">
                        Account {account.accountNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        MightyShare Account
                      </p>
                      <p className="text-sm font-semibold text-[#00C4B4]">
                        Balance: ₦{account.balance.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddAccount(account)}
                      className="bg-[#1A2B88] text-white p-2 rounded-lg hover:bg-[#152270] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Accounts Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[#1A2B88]">
              Selected Accounts ({selectedAccounts.length})
            </h2>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-xl font-bold text-[#00C4B4]">
                ₦{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {selectedAccounts.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No accounts selected yet</p>
              <p className="text-sm text-gray-400">
                Search and add accounts from the left
              </p>
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              {selectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-[#1A2B88]">
                      Account {account.accountNumber}
                    </p>
                    <p className="text-sm text-gray-600">MightyShare Account</p>
                    <p className="text-sm font-semibold text-[#00C4B4]">
                      Balance: ₦{account.balance.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveAccount(account.id)}
                    className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add any additional information or instructions for this bulk withdrawal request..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A2B88]"
          />
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => {
              setSelectedAccounts([]);
              setNotes("");
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Clear All
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedAccounts.length === 0}
            className="px-6 py-2 bg-[#00C4B4] text-white rounded-lg hover:bg-[#00a89c] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
