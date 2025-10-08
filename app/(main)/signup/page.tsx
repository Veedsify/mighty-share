"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralId, setReferralId] = useState("");
  const [plan, setPlan] = useState("Option A");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Detect selected plan from URL (locks onto clicked membership option)
  useEffect(() => {
    const selectedPlan = searchParams.get("plan");
    if (selectedPlan === "A") setPlan("Option A");
    else if (selectedPlan === "B") setPlan("Option B");
    else if (selectedPlan === "C") setPlan("Option C");
  }, [searchParams]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, phone, password, plan, referralId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
      } else {
        router.push("/register-payment");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        {/* Logo */}
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
          Create Your Mighty Share Account
        </h1>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center font-medium">
            {error}
          </p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          />

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

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          />

          <input
            type="text"
            placeholder="Referral ID (optional)"
            value={referralId}
            onChange={(e) => setReferralId(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
          />

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          >
            <option value="Option A">
              Option A (₦2,400 weekly × 30 weeks)
            </option>
            <option value="Option B">
              Option B (₦10,000 monthly × 7 months)
            </option>
            <option value="Option C">Option C (One-time payment)</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FC0FC0] text-[#1A2B88] py-2 rounded-md font-semibold hover:bg-[#00C4B4] hover:text-white transition"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-700 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-[#FC0FC0] hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
