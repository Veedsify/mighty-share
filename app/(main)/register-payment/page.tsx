"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { LucideLoader } from "lucide-react";

// Constants
const REG_FEE = 2500;
const REDIRECT_DELAY = 2000;

// Types
type PaymentProvider = "alatpay" | "paystack";

type MessageType = "idle" | "success" | "error" | "info";

interface MessageState {
  text: string;
  type: MessageType;
}

interface PaymentResponse {
  success?: boolean;
  userId?: string;
  paymentUrl?: string;
  alatPayData?: {
    data?: {
      paymentUrl?: string;
    };
  };
}

// API configuration
const API_CONFIG = {
  paystack: {
    initialize: "/api/paystack/initialize",
    verify: "/api/paystack/verify",
  },
  alatpay: {
    initialize: "/api/alatpay/initialize",
    verify: "/api/alatpay/verify",
  },
  registrationComplete: "/api/users/registration-complete",
} as const;

export default function RegisterPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<MessageState>({
    text: "",
    type: "idle",
  });

  // Helper to update message
  const updateMessage = useCallback((text: string, type: MessageType) => {
    setMessage({ text, type });
  }, []);

  // Helper to clear message
  const clearMessage = useCallback(() => {
    setMessage({ text: "", type: "idle" });
  }, []);

  // Complete user registration after successful payment
  const completeRegistration = useCallback(
    async (userId: string) => {
      try {
        await axios.post(
          API_CONFIG.registrationComplete,
          { userId },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        updateMessage(
          "✅ Payment verified successfully! Redirecting...",
          "success"
        );
        setTimeout(() => router.push("/dashboard"), REDIRECT_DELAY);
      } catch (error) {
        console.error("Registration completion error:", error);
        updateMessage(
          "⚠️ Payment verified but registration update failed. Please contact support.",
          "error"
        );
      }
    },
    [router, updateMessage]
  );

  // Verify payment after callback redirect
  const verifyPayment = useCallback(
    async (reference: string, provider: PaymentProvider) => {
      setIsVerifying(true);
      updateMessage("🔄 Verifying your payment...", "info");

      try {
        const verifyUrl = API_CONFIG[provider].verify;

        const { data } = await axios.post<PaymentResponse>(
          verifyUrl,
          { reference, orderId: reference },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        if (data.success && data.userId) {
          await completeRegistration(data.userId);
        } else {
          updateMessage(
            "❌ Payment verification failed. Please contact support.",
            "error"
          );
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        const axiosError = error as AxiosError<{ error?: string }>;
        updateMessage(
          axiosError.response?.data?.error ||
            "❌ Payment verification failed. Please try again.",
          "error"
        );
      } finally {
        setIsVerifying(false);
      }
    },
    [updateMessage, completeRegistration]
  );

  // Initialize payment with selected provider
  const initializePayment = useCallback(
    async (provider: PaymentProvider) => {
      setLoadingProvider(provider);
      clearMessage();

      try {
        const initUrl = API_CONFIG[provider].initialize;

        const { data } = await axios.post<PaymentResponse>(
          initUrl,
          {
            amount: REG_FEE,
            currency: "NGN",
            description: "MightyShare Registration Fee",
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        // Extract payment URL based on provider response structure
        const paymentUrl =
          data.paymentUrl || data.alatPayData?.data?.paymentUrl;

        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          updateMessage(
            "❌ Payment initialization failed. Please try again.",
            "error"
          );
        }
      } catch (error) {
        console.error("Payment initialization error:", error);
        const axiosError = error as AxiosError<{ error?: string }>;
        const providerName = provider === "paystack" ? "Paystack" : "ALATPay";
        const alternateProvider =
          provider === "paystack" ? "ALATPay" : "Paystack";

        updateMessage(
          axiosError.response?.data?.error ||
            `❌ ${providerName} payment failed. You can try ${alternateProvider} instead.`,
          "error"
        );
      } finally {
        setLoadingProvider(null);
      }
    },
    [clearMessage, updateMessage]
  );

  // Handle payment callback on component mount
  useEffect(() => {
    const reference = searchParams.get("reference");
    const provider = searchParams.get("provider") as PaymentProvider | null;
    const status = searchParams.get("status");

    if (
      reference &&
      provider &&
      (provider === "alatpay" || provider === "paystack")
    ) {
      verifyPayment(reference, provider);
    } else if (status === "failed") {
      updateMessage("❌ Payment failed. Please try again.", "error");
    }
  }, [searchParams, verifyPayment, updateMessage]);

  // Compute loading states
  const isProcessing = loadingProvider !== null;
  const isAnyActionInProgress = isProcessing || isVerifying;

  // Get message styling based on type
  const getMessageClassName = () => {
    const baseClasses = "mt-4 p-3 rounded-lg text-center text-sm font-medium";
    switch (message.type) {
      case "success":
        return `${baseClasses} bg-green-50 text-green-700 border border-green-200`;
      case "error":
        return `${baseClasses} bg-red-50 text-red-700 border border-red-200`;
      case "info":
        return `${baseClasses} bg-blue-50 text-blue-700 border border-blue-200`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Complete Registration
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            A one-time registration fee of{" "}
            <span className="font-bold text-indigo-600">
              ₦{REG_FEE.toLocaleString()}
            </span>{" "}
            is required to activate your MightyShare account.
          </p>
        </div>

        {/* Verification State */}
        {isVerifying ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">{message.text}</p>
          </div>
        ) : (
          <>
            {/* Payment Buttons */}
            <div className="space-y-3 mb-4">
              <button
                onClick={() => initializePayment("paystack")}
                disabled={isAnyActionInProgress}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loadingProvider === "paystack" ? (
                  <>
                    <LucideLoader
                      className="animate-spin text-white"
                      stroke="#ffffff"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Pay with Paystack</span>
                  </>
                )}
              </button>

              <button
                onClick={() => initializePayment("alatpay")}
                disabled={isAnyActionInProgress}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 px-4 rounded-lg font-semibold transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loadingProvider === "alatpay" ? (
                  <>
                    <LucideLoader
                      className="animate-spin text-white"
                      stroke="#ffffff"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <span>Pay with ALATPay</span>
                  </>
                )}
              </button>
            </div>

            {/* Message Display */}
            {message.text && (
              <div className={getMessageClassName()}>{message.text}</div>
            )}

            {/* Skip Option */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.push("/dashboard")}
                disabled={isAnyActionInProgress}
                className="w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:text-gray-400 disabled:cursor-not-allowed py-2"
              >
                Skip payment and continue to Dashboard →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
