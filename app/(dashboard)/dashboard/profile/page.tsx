"use client";

import { useState } from "react";
import { useDashboard } from "../../../../components/DashboardProvider";

// Default profile values
const defaultProfile = {
  name: "User",
  balance: 5000,
  totalContributions: 12000,
  rewards: 200,
  totalDebt: 3000,
  currentThriftWeeks: 5,
  referralEarnings: 1000,
  avatar: "/avatar.png",
};

export default function ProfilePage() {
  const { user, setUser } = useDashboard();

  // Local editable state
  const [formData, setFormData] = useState({
    name: (user as any)?.name || (user as any)?.fullName || defaultProfile.name,
    balance: (user as any)?.balance || defaultProfile.balance,
    totalContributions:
      (user as any)?.totalContributions || defaultProfile.totalContributions,
    rewards: (user as any)?.rewards || defaultProfile.rewards,
    totalDebt: (user as any)?.totalDebt || defaultProfile.totalDebt,
    currentThriftWeeks:
      (user as any)?.currentThriftWeeks || defaultProfile.currentThriftWeeks,
    referralEarnings:
      (user as any)?.referralEarnings || defaultProfile.referralEarnings,
  });

  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const users = JSON.parse(localStorage.getItem("mockUsers") || "{}");
      const sessions = JSON.parse(localStorage.getItem("mockSessions") || "{}");
      if (sessions.current && users[sessions.current.userId]) {
        users[sessions.current.userId].avatar = reader.result;
        localStorage.setItem("mockUsers", JSON.stringify(users));
      }
      setUser({ ...user, avatar: reader.result } as any);
    };
    reader.readAsDataURL(file);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save updates
  const handleSave = () => {
    const users = JSON.parse(localStorage.getItem("mockUsers") || "{}");
    const sessions = JSON.parse(localStorage.getItem("mockSessions") || "{}");
    if (sessions.current && users[sessions.current.userId]) {
      users[sessions.current.userId] = {
        ...users[sessions.current.userId],
        ...formData,
      };
      localStorage.setItem("mockUsers", JSON.stringify(users));
    }

    setUser({ ...user, ...formData } as any);
  };

  // Reset to defaults
  const handleReset = () => {
    const users = JSON.parse(localStorage.getItem("mockUsers") || "{}");
    const sessions = JSON.parse(localStorage.getItem("mockSessions") || "{}");
    if (sessions.current && users[sessions.current.userId]) {
      users[sessions.current.userId] = {
        ...users[sessions.current.userId],
        ...defaultProfile,
      };
      localStorage.setItem("mockUsers", JSON.stringify(users));
    }

    setFormData({
      name: defaultProfile.name,
      balance: defaultProfile.balance,
      totalContributions: defaultProfile.totalContributions,
      rewards: defaultProfile.rewards,
      totalDebt: defaultProfile.totalDebt,
      currentThriftWeeks: defaultProfile.currentThriftWeeks,
      referralEarnings: defaultProfile.referralEarnings,
    });

    setUser({ ...user, ...defaultProfile } as any);
  };

  if (!user) return null;

  const userAny = user as any;

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Profile Settings</h2>

      {/* Avatar Upload */}
      <div className="flex items-center space-x-4 mb-6">
        <img
          src={userAny.avatar || defaultProfile.avatar}
          alt="Profile"
          className="w-20 h-20 rounded-full border"
        />
        <label className="px-4 py-2 bg-[#00C4B4] text-white rounded-md cursor-pointer hover:opacity-90">
          Upload New Photo
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </label>
      </div>

      {/* Editable fields */}
      <div className="space-y-4">
        {[
          { label: "Full Name", name: "name", type: "text" },
          { label: "Wallet Balance", name: "balance", type: "number" },
          {
            label: "Total Contributions",
            name: "totalContributions",
            type: "number",
          },
          { label: "Rewards", name: "rewards", type: "number" },
          { label: "Total Debt", name: "totalDebt", type: "number" },
          {
            label: "Current Thrift Weeks",
            name: "currentThriftWeeks",
            type: "number",
          },
          {
            label: "Referral Earnings",
            name: "referralEarnings",
            type: "number",
          },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        ))}
      </div>

      {/* Save & Reset Buttons */}
      <div className="mt-6 flex space-x-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-[#1A2B88] text-white rounded-md hover:opacity-90"
        >
          Save Changes
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-400 text-white rounded-md hover:opacity-90"
        >
          Reset Profile
        </button>
      </div>

      {/* Info */}
      <div className="mt-6">
        <p className="text-gray-600">Account ID: {userAny.accountId}</p>
        <p className="text-gray-600">Referral ID: {userAny.referralId}</p>
      </div>
    </div>
  );
}
