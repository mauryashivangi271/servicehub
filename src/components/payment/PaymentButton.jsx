import { useRef, useState } from "react";
import { Lock, CreditCard, Loader2 } from "lucide-react";

import {
  loadRazorpay,
  createPaymentOrder,
  verifyPayment,
  formatMoney,
} from "../../services/paymentService";

export default function PaymentButton({
  booking,
  amount,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const locked = useRef(false);

  function release() {
    locked.current = false;
    setLoading(false);
  }

  async function handlePayment() {
    if (locked.current || pending) return;

    locked.current = true;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const Razorpay = await loadRazorpay();

      const order = await createPaymentOrder(booking.id);

      if (!order?.orderId || !order?.keyId) {
        throw new Error("Invalid payment order");
      }

      if (!order.keyId.startsWith("rzp_test_")) {
        throw new Error("Only test payments are enabled");
      }

      if (Number(order.amount) !== Number(amount)) {
        throw new Error("Amount changed. Refresh your booking.");
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,

        name: "ServiceHub",

        description:
          booking.service_title_snapshot ||
          booking.worker_services?.title ||
          "Service Payment",

        order_id: order.orderId,

        theme: {
          color: "#2563eb",
        },

        handler: async function (response) {
          setPending(true);

          try {
            const result = await verifyPayment(
              booking.id,
              response
            );

            if (result.success) {
              setMessage("Payment successful!");
              await onSuccess?.();
            } else {
              setMessage(
                "Payment received. Verification pending."
              );
            }

          } catch {
            setError(
              "Verification pending. Do not pay again. Refresh payment status."
            );
          } finally {
            release();
          }
        },

        modal: {
          ondismiss: function () {
            if (!locked.current) return;

            setMessage("Checkout closed. Check payment status.");

            release();
          },
        },
      };

      const checkout = new Razorpay(options);

      checkout.on("payment.failed", function () {
        setError(
          "Payment attempt failed. Check the checkout status."
        );
      });

      checkout.open();

    } catch (err) {
      setError(err.message || "Unable to start payment");
      release();
    }
  }

  return (
    <div className="space-y-3">

      {error && (
        <div className="rounded-xl bg-red-50 p-3
        text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl bg-blue-50 p-3
        text-sm text-blue-700">
          {message}
        </div>
      )}

      <button
        type="button"
        disabled={loading || pending || amount <= 0}
        onClick={handlePayment}
        className="flex w-full items-center justify-center
        gap-2 rounded-xl bg-blue-600 px-5 py-3
        font-semibold text-white hover:bg-blue-700
        disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <CreditCard size={20} />
        )}

        {loading
          ? "Processing Payment..."
          : pending
          ? "Verification Pending"
          : `Pay ${formatMoney(amount)}`}
      </button>

      <div className="flex items-center justify-center
      gap-2 text-xs text-gray-500">
        <Lock size={14} />
        Secure Checkout via Razorpay • Test Mode
      </div>
    </div>
  );
}