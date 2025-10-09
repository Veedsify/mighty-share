import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LucideCheck,
  LucideCopy,
  LucideCreditCard,
  LucideLoader,
  X,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";

interface BankModalProps {
  isOpen: boolean;
  onClose: (showMessage?: boolean) => void;
  bankName: string;
  transactionId: string;
  orderId: string;
  accountNumber: string;
  accountName?: string;
  isTopUp?: boolean; // Flag to indicate if this is a topup transaction
  onSuccess?: () => void; // Callback for successful topup
}

const BankModal: React.FC<BankModalProps> = ({
  isOpen,
  onClose,
  bankName,
  accountNumber,
  transactionId,
  orderId,
  accountName = "Mightyshare Charity Foundation",
  isTopUp = false,
  onSuccess,
}) => {
  const [hasTransferred, setHasTransferred] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();
  const [transactionData, setTransactionData] = useState<{
    amount: number;
    reference: string;
    date: string;
    creditedAmount?: number;
    registrationFeeDeducted?: number;
  } | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const validateTransaction = async () => {
    setIsLoading(true);
    try {
      // Use different endpoint based on transaction type
      const verifyEndpoint = isTopUp
        ? `/api/alatpay/topup-verify`
        : `/api/alatpay/verify`;

      const response = await axios.post(
        verifyEndpoint,
        {
          transactionId,
          orderId,
        },
        {
          withCredentials: true,
        }
      );
      const result = response.data;
      if (result.success) {
        setHasTransferred(true);
        setTransactionData({
          amount: result.amount,
          reference: result.reference,
          date: new Date(result.updatedAt).toLocaleTimeString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          creditedAmount: result.creditedAmount,
          registrationFeeDeducted: result.registrationFeeDeducted,
        });

        // Call onSuccess callback if provided (for topup)
        if (isTopUp && onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
        return;
      }
      setError(true);
      console.error("Transaction not found or not completed");
      return false;
    } catch (error) {
      setHasTransferred(false);
      setIsLoading(false);
      setError(true);
      console.error("Transaction validation error:", error);
      return false;
    }
  };

  const handleContinueToDashboard = () => {
    router.push("/dashboard");
    onClose(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onClose(true)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-pink-700 p-6 relative">
              <button
                onClick={() => onClose(true)}
                className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-800 rounded-full flex items-center justify-center">
                  <LucideCreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Bank Transfer
                  </h2>
                  <p className="text-white text-sm">Complete your payment</p>
                </div>
              </div>
            </div>

            <div className="p-2 md:p-6">
              {!hasTransferred && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Premium Bank Details Card */}
                  <div className="bg-gray-50 rounded-xl  p-3 md:p-5 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Transfer to
                      </span>
                    </div>

                    {/* Bank Logo and Name */}
                    <div className="flex items-center gap-4 mb-5">
                      {/* Logo Placeholder */}
                      <div className="w-14 h-14 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Image
                          src={"/wemabank.svg"}
                          alt={`${bankName} Logo`}
                          width={50}
                          height={50}
                          className="object-contain rounded-md"
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {bankName}
                        </h3>
                        <p className="text-gray-800 text-sm font-semibold">
                          Account Name: <br />
                        </p>
                        <p className="text-gray-600 text-sm">{accountName}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">
                          Account Number
                        </label>
                        <div className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm">
                          <span className="font-mono font-bold text-lg text-gray-900">
                            {accountNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(accountNumber, "account")}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            {copiedField === "account" ? (
                              <LucideCheck className="w-5 h-5 text-green-500" />
                            ) : (
                              <LucideCopy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                      <svg
                        className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Transfer the required amount to the account above using
                        your bank app or USSD, then click the button below to
                        confirm.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={validateTransaction}
                    disabled={isLoading}
                    className="w-full disabled:bg-gray-500 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <LucideLoader className="animate-spin mr-2 inline-block" />
                        Validating...
                      </span>
                    ) : (
                      <span>I&apos;ve completed the transfer</span>
                    )}
                  </button>
                </motion.div>
              )}
              {hasTransferred && !error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LucideCheck className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Payment Confirmed
                    </h3>
                    <p className="text-sm text-gray-600">
                      Your transfer has been verified successfully
                    </p>
                  </div>

                  <div className="space-y-4">
                    {transactionData?.registrationFeeDeducted &&
                      transactionData.registrationFeeDeducted > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>Registration Fee:</strong> ₦
                            {transactionData.registrationFeeDeducted.toLocaleString()}{" "}
                            deducted from your payment
                          </p>
                        </div>
                      )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Amount Transferred
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                          ₦
                        </span>
                        <div className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50">
                          <span className="text-gray-900 font-medium">
                            {transactionData?.amount.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {transactionData?.creditedAmount !== undefined &&
                      transactionData.creditedAmount !==
                        transactionData.amount && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount Credited to Wallet
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 font-semibold">
                              ₦
                            </span>
                            <div className="w-full pl-9 pr-4 py-3 border-2 border-green-200 rounded-xl bg-green-50">
                              <span className="text-green-900 font-medium">
                                {transactionData.creditedAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Transaction Reference
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50">
                        <span className="text-gray-900 font-medium">
                          {transactionData?.reference || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Transaction Date
                      </label>
                      <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50">
                        <span className="text-gray-900 font-medium">
                          {transactionData?.date ? transactionData.date : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToDashboard}
                    className="w-full bg-pink-600 hover:bg-pink-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
                  >
                    Continue to Dashboard
                  </button>
                </motion.div>
              )}

              {error && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-red-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Validation Failed
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We couldn&apos;t verify your transaction. Please ensure you
                    have completed the transfer and try again.
                  </p>
                  <button
                    onClick={() => {
                      setError(false);
                      setIsLoading(false);
                      setHasTransferred(false);
                    }}
                    className="bg-red-600 hover:bg-red-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Secured by Paystack • SSL Encrypted</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BankModal;
