import axios from "axios";
import { useState } from "react";
import BankModal from "./BankModal";
import Swal from "sweetalert2";
import { PaymentData } from "@/types/initialize-payment";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accounts: any[]) => void;
  userPlan?: string;
  registrationPaid?: boolean;
}

export default function TopUpModal({
  isOpen,
  onClose,
  onSuccess,
  userPlan = "A",
  registrationPaid = false,
}: TopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [bankdata, setBankdata] = useState<PaymentData | null>(null);
  const [bankAccountModalOpen, setBankAccountModalOpen] = useState(false);

  // Calculate minimum amount based on plan if registration not paid
  const getMinAmount = () => {
    if (registrationPaid) return 100; // No minimum for paid users

    const planAmounts: Record<string, number> = {
      A: 2500,
      B: 10000,
      C: 70000,
    };
    return planAmounts[userPlan] || 2500;
  };

  const minAmount = getMinAmount();

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const parsedAmount = parseFloat(amount);

      // Validate amount
      if (!parsedAmount || parsedAmount <= 0) {
        setMessage("❌ Please enter a valid amount");
        setLoading(false);
        return;
      }

      if (parsedAmount < minAmount) {
        setMessage(
          `❌ Minimum top-up amount is ₦${minAmount.toLocaleString()}${
            !registrationPaid ? " (includes registration fee)" : ""
          }`
        );
        setLoading(false);
        return;
      }

      // Initialize ALATPay payment
      const res = await axios.post(
        "/api/alatpay/topup",
        {
          amount: parsedAmount,
        },
        {
          withCredentials: true,
        }
      );

      const data = res.data;

      if (res.status !== 200) {
        setMessage(data.error || "❌ Top-up initialization failed");
        setLoading(false);
        return;
      }

      // Show bank modal with payment details
      if (data.data && data.data.transactionId) {
        setBankdata(data.data);
        setBankAccountModalOpen(true);
        setLoading(false);
      } else {
        setMessage("❌ Payment initialization failed");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Top-up error:", err);
      setMessage(err.response?.data?.error || "❌ Something went wrong.");
      setLoading(false);
    }
  };

  const handleBankModalClose = (showMessage?: boolean) => {
    if (!showMessage) {
      setBankAccountModalOpen(false);
      return;
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
        onClose();
      }
    });
  };

  const handleTopUpSuccess = () => {
    setBankAccountModalOpen(false);
    onClose();
    // Trigger refresh of account data
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-lg font-bold mb-4">Top Up Wallet</h2>

          {!registrationPaid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your first top-up includes a ₦
                {minAmount.toLocaleString()} registration fee based on your
                plan.
              </p>
            </div>
          )}

          <form onSubmit={handleTopUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₦)
              </label>
              <input
                type="number"
                placeholder={
                  registrationPaid
                    ? "Enter amount (Min: ₦100)"
                    : `Minimum: ₦${minAmount.toLocaleString()}`
                }
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                min={minAmount}
                required
              />
              {!registrationPaid && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum amount: ₦{minAmount.toLocaleString()} (includes
                  registration fee)
                </p>
              )}
              {registrationPaid && (
                <p className="text-xs text-gray-500 mt-1">
                  Minimum amount: ₦100
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-2 rounded-md hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Proceed to Payment"}
            </button>
          </form>
          {message && (
            <p
              className={`mt-3 text-sm ${
                message.startsWith("❌")
                  ? "text-red-600"
                  : message.startsWith("₦")
                  ? "text-green-600"
                  : "text-gray-700"
              }`}
            >
              {message}
            </p>
          )}
          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-600 hover:underline w-full text-center"
          >
            Cancel
          </button>
        </div>
      </div>

      {bankAccountModalOpen && bankdata && (
        <BankModal
          accountNumber={bankdata.virtualBankAccountNumber}
          bankName={"Wema Bank PLC"}
          orderId={bankdata.orderId}
          transactionId={bankdata.transactionId}
          isOpen={bankAccountModalOpen}
          onClose={handleBankModalClose}
          isTopUp={true}
          onSuccess={handleTopUpSuccess}
        />
      )}
    </>
  );
}
