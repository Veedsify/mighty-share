// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at?: string;
  inserted_at?: string;
}

export default function AdminPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>("");

  const fetchMessages = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data.ok)
        throw new Error(data.error || "Failed to load messages.");
      setMessages(data.data || []);
    } catch (e: any) {
      setLoadError(e.message || "Error loading messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Mighty Share — Admin
        </h1>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">Viewing latest contact submissions.</p>
          <button
            onClick={fetchMessages}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90"
          >
            Refresh
          </button>
        </div>

        {loading && <p className="text-gray-700">Loading messages...</p>}
        {loadError && <p className="text-danger">{loadError}</p>}

        {!loading && !loadError && (
          <ul className="space-y-4">
            {messages.length === 0 && (
              <li className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600">No messages yet.</p>
              </li>
            )}
            {messages.map((m) => (
              <li
                key={m.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {m.name}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(
                      m.created_at || m.inserted_at || Date.now()
                    ).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{m.email}</p>
                <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                  {m.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
