"use client";

import { useDashboard } from "./DashboardProvider";

export default function DashboardHeader() {
  const {
    user,
    accounts,
    activeAccount,
    dropdownOpen,
    setDropdownOpen,
    dropdownRef,
    handleAccountSwitch,
  } = useDashboard();

  if (!user) return null;

  return (
    <header className="mb-6 flex items-center justify-between relative">
      <div>
        <h2 className="text-2xl font-bold text-[#1A2B88]">
          Welcome, {user.fullname}
        </h2>
        <p className="text-gray-600 text-sm">
          Account ID: {activeAccount?.accountNumber || "N/A"}
        </p>
      </div>

      {/* Account Dropdown */}
      {accounts.length > 1 && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#1A2B88] shadow-sm hover:bg-gray-100 focus:outline-none"
          >
            Switch Account ▼
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {accounts.map((acc, idx) => (
                <button
                  key={acc.id}
                  onClick={() => handleAccountSwitch(acc.id)}
                  className={`block w-full text-left px-4 py-3 text-sm hover:bg-[#00C4B4]/10 border-b border-gray-100 last:border-b-0 ${
                    acc.id === activeAccount?.id
                      ? "bg-[#00C4B4]/20 font-semibold text-[#1A2B88]"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {idx === 0 ? "Primary Account" : `Account ${idx + 1}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {acc.accountNumber}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-green-600">
                        ₦{acc.balance.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
