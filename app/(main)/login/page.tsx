"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid phone or password.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        {/* ✅ Logo */}
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block">
            <img
              src="/mightyshare-logo.jpg"
              alt="MightyShare Logo"
              className="h-12 mx-auto cursor-pointer"
            />
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-[#1A2B88] text-center mb-6">
          Welcome Back
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FC0FC0] text-[#1A2B88] py-2 rounded-md font-semibold hover:bg-[#00C4B4] hover:text-white transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-700 text-center">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-[#FC0FC0] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
