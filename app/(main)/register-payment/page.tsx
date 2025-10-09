"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { CardSim, LucideCreditCard, LucideLoader } from "lucide-react";
import { useSession } from "../auth/Provider";
import { REDIRECT_DELAY } from "@/config/constants";
import PlanConfig from "@/config/plan";
import { PaymentData } from "@/types/initialize-payment";
import BankModal from "@/components/BankModal";
import Swal from "sweetalert2";

// Types
type PaymentProvider = "alatpay" | "paystack";

type MessageType = "idle" | "success" | "error" | "info";

interface MessageState {
  text: string;
  type: MessageType;
}

interface PaymentResponse {
  data?: PaymentData;
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
  const { user, loading } = useSession();

  // State management
  const [loadingProvider, setLoadingProvider] =
    useState<PaymentProvider | null>(null);
  const [bankdata, setBankdata] = useState<PaymentData | null>(null);
  const [bankAccountModalOpen, setBankAccountModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<MessageState>({
    text: "",
    type: "idle",
  });

  const fee = useMemo(() => {
    return user?.plan
      ? PlanConfig[user.plan as keyof typeof PlanConfig].amount
      : PlanConfig["A"].amount;
  }, [PlanConfig, user?.plan]);

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

        const response = await axios.post(
          verifyUrl,
          { reference, orderId: reference },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = response.data;

        if (data.status && data.userId) {
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
        const response = await axios.post<PaymentResponse>(
          initUrl,
          {
            amount: fee,
            currency: "NGN",
            description: "MightyShare Registration Fee",
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = response.data.data;
        console.log(data);
        if (data.status && data.transactionId) {
          setBankdata(data);
          setBankAccountModalOpen(true);
          return;
        }

        updateMessage(
          "❌ Payment initialization failed. Please try again.",
          "error"
        );
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

  const handleOnClose = (showMessage?: boolean) => {
    if (!showMessage) {
      return setBankAccountModalOpen(false);
    }
    Swal.fire({
      title: "Are you sure?",
      text: "Closing this window will cancel the payment process. Do you want to proceed?",
      icon: "warning",
      cancelButtonText: "No, stay",
      confirmButtonText: "Yes, cancel",
      showDenyButton: false,
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setBankAccountModalOpen(false);
      }
    });
  };

  if (!user && !loading) {
    return router.push("/login");
  }

  if (!user) {
    return null;
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-lg border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
              <svg
                className="w-10 h-10 text-indigo-600"
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
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Complete Registration
            </h1>
            <p className="text-gray-600 text-base leading-relaxed">
              A one-time registration fee of{" "}
              <span className="font-semibold text-indigo-600">
                ₦ {Number(fee).toLocaleString()}
              </span>{" "}
              is required to activate your MightyShare account.
            </p>
          </div>

          {/* Verification State */}
          {isVerifying ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
              <p className="text-gray-700 font-medium text-lg">
                {message.text}
              </p>
            </div>
          ) : (
            <>
              {/* Payment Buttons */}
              <div className="space-y-4 mb-6">
                <button
                  onClick={() => initializePayment("alatpay")}
                  disabled={isAnyActionInProgress}
                  className="w-full bg-pink-700 hover:bg-pink-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform"
                >
                  {loadingProvider === "alatpay" ? (
                    <>
                      <LucideLoader className="animate-spin" size={20} />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <LucideCreditCard />
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
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => router.push("/dashboard")}
                  disabled={isAnyActionInProgress}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 disabled:text-gray-300 disabled:cursor-not-allowed font-medium transition-colors py-3"
                >
                  Skip payment and continue to Dashboard →
                </button>
              </div>
            </>
          )}
        </div>
        {bankAccountModalOpen && bankdata && (
          <BankModal
            accountNumber={bankdata.virtualBankAccountNumber}
            bankName={"Wema Bank PLC"}
            orderId={bankdata.orderId}
            transactionId={bankdata.transactionId}
            isOpen={bankAccountModalOpen}
            onClose={handleOnClose}
          />
        )}
      </div>
  );
}
