import axios from "axios";
import { useState } from "react";

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (accounts: any[]) => void;
}

export default function TopUpModal({
  isOpen,
  onClose,
  onSuccess,
}: TopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Initialize Paystack payment
      const res = await axios.post(
        "/api/wallet/topup",
        {
          amount: parseFloat(amount),
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

      // Redirect to Paystack checkout
      if (data.paymentUrl) {
        setMessage("🔄 Redirecting to payment...");
        window.location.href = data.paymentUrl;
      } else {
        setMessage("❌ Payment URL not received");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Top-up error:", err);
      setMessage(err.response?.data?.error || "❌ Something went wrong.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Top Up Wallet</h2>
        <form onSubmit={handleTopUp} className="space-y-4">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-md p-2"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00C4B4] text-white py-2 rounded-md hover:bg-[#009b91]"
          >
            {loading ? "Processing..." : "Confirm Top-Up"}
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
          className="mt-4 text-sm text-gray-600 hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
