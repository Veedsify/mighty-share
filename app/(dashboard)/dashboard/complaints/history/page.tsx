"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "../../../../../components/DashboardProvider";

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  createdAt: string;
  resolvedAt?: string;
}

export default function ComplaintHistoryPage() {
  const { user } = useDashboard();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!(user as any)?.id) return;

    const fetchComplaints = async () => {
      try {
        const res = await fetch(`/api/complaints?userId=${(user as any).id}`);
        const data = await res.json();

        if (data.ok) {
          setComplaints(data.complaints || []);
        } else {
          setError(data.error || "Failed to load complaints");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user]);

  if (loading) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <p className="text-gray-600">Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold text-[#1A2B88] mb-4">
        Complaint History
      </h1>
      <p className="text-gray-600 mb-6">
        Track all complaints you have submitted.
      </p>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {complaints.length === 0 ? (
        <p className="text-gray-600">No complaints submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="border rounded-lg p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{complaint.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    complaint.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : complaint.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : complaint.status === "closed"
                      ? "bg-gray-100 text-gray-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {complaint.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-2">
                {complaint.description}
              </p>
              <div className="flex gap-4 text-xs text-gray-500">
                <span>
                  Category: <b>{complaint.category}</b>
                </span>
                <span>
                  Priority: <b>{complaint.priority}</b>
                </span>
                <span>
                  Submitted:{" "}
                  <b>{new Date(complaint.createdAt).toLocaleDateString()}</b>
                </span>
                {complaint.resolvedAt && (
                  <span>
                    Resolved:{" "}
                    <b>{new Date(complaint.resolvedAt).toLocaleDateString()}</b>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
