"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralId: "",
    plan: "A",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/signup", {
        fullname: formData.fullname,
        phone: formData.phone,
        password: formData.password,
        plan: formData.plan,
        referralId: formData.referralId,
      });

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      router.push("/register-payment");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.error || "An error occurred during signup.");
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
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          />

          <input
            type="text"
            name="referralId"
            placeholder="Referral ID (optional)"
            value={formData.referralId}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
          />

          <select
            name="plan"
            value={formData.plan}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-md focus:ring-[#00C4B4] focus:border-[#00C4B4]"
            required
          >
            <option value="A">Option A (₦2,400 weekly × 30 weeks)</option>
            <option value="B">Option B (₦10,000 monthly × 7 months)</option>
            <option value="C">Option C (One-time payment)</option>
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
