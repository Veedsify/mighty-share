"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useDashboard } from "../../../../../components/DashboardProvider";

export default function AddSettlementAccountPage() {
  const router = useRouter();
  const { user } = useDashboard();
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const { data } = await axios.post("/api/settlement-accounts", formData, {
        withCredentials: true,
      });

      if (data.error) {
        setError(data.error || "Failed to add settlement account");
      } else {
        setSuccess(true);
        setFormData({
          bankName: "",
          accountNumber: "",
          accountName: "",
          isDefault: false,
        });
        setTimeout(() => router.push("/dashboard/settlements/manage"), 2000);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to add settlement account"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-2xl">
      <h1 className="text-2xl font-bold text-[#1A2B88] mb-2">
        Add Settlement Account
      </h1>
      <p className="text-gray-600 mb-6">
        Add a new bank account for settlements.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bank Name</label>
          <select
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            required
          >
            <option value="">Select Bank</option>
            <option value="Access Bank">Access Bank</option>
            <option value="First Bank">First Bank</option>
            <option value="GTBank">GTBank</option>
            <option value="UBA">UBA</option>
            <option value="Zenith Bank">Zenith Bank</option>
            <option value="Wema Bank">Wema Bank</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Account Number
          </label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            placeholder="1234567890"
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Account Name</label>
          <input
            type="text"
            name="accountName"
            value={formData.accountName}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            placeholder="Full name as on account"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            className="w-4 h-4"
          />
          <label className="text-sm">Set as default settlement account</label>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm">
            Account added successfully! Redirecting...
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#1A2B88] text-white rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Account"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
