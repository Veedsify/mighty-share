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
          Welcome, {user.fullName}
        </h2>
        <p className="text-gray-600 text-sm">
          Account ID: {activeAccount?.accountNumber || "N/A"}
        </p>
      </div>

      {/* ✅ Account Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#1A2B88] shadow-sm hover:bg-gray-100 focus:outline-none"
        >
          Account ▼
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            {accounts.map((acc, idx) => (
              <button
                key={acc.accountNumber}
                onClick={() => handleAccountSwitch(acc.accountNumber)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#00C4B4]/10 ${
                  acc.accountNumber === activeAccount?.accountNumber
                    ? "font-semibold text-[#1A2B88]"
                    : "text-gray-700"
                }`}
              >
                {idx === 0
                  ? `Primary Account - ${acc.accountNumber}`
                  : `${acc.accountNumber}`}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
