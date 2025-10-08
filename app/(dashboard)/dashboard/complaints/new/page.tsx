"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../../../../../components/DashboardProvider";

export default function NewComplaintPage() {
  const router = useRouter();
  const { user } = useDashboard();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "account",
    priority: "normal",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: (user as any)?.id,
          ...formData,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setSuccess(true);
        setFormData({
          title: "",
          description: "",
          category: "account",
          priority: "normal",
        });
        setTimeout(() => router.push("/dashboard/complaints/history"), 2000);
      } else {
        setError(data.error || "Failed to submit complaint");
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-2xl">
      <h1 className="text-2xl font-bold text-[#1A2B88] mb-2">
        Log a Complaint
      </h1>
      <p className="text-gray-600 mb-6">
        Submit a new complaint regarding your account or transactions.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            placeholder="Brief description of the issue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            required
          >
            <option value="account">Account</option>
            <option value="transaction">Transaction</option>
            <option value="service">Service</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full border rounded-md p-2"
            required
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full border rounded-md p-2"
            placeholder="Provide detailed information about your complaint..."
            required
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm">
            Complaint submitted successfully! Redirecting...
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-[#1A2B88] text-white rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Complaint"}
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
