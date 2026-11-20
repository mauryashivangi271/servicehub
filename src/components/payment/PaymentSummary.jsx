import ApplyCoupon from "../coupons/ApplyCoupon";
import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  Wallet,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import PaymentButton from "./PaymentButton";
import PaymentStatusBadge from "./PaymentStatusBadge";

import {
  getBookingPayment,
  getPayableAmount,
  formatMoney,
} from "../../services/paymentService";

export default function PaymentSummary({ booking }) {
  const { role } = useAuth();

  const [payment, setPayment] = useState(null);
  const [amount, setAmount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPayment = useCallback(async () => {
    try {
      setError("");

      const existing = await getBookingPayment(booking.id);

      setPayment(existing);

      if (!existing && role === "customer") {
        const payable = await getPayableAmount(booking.id);

        setAmount(Number(payable.amount_paise));
      }

    } catch (err) {
      setAmount(null);
      setError(err.message || "Unable to load payment");
    } finally {
      setLoading(false);
    }
  }, [booking.id, role]);

  useEffect(() => {
    loadPayment();

    const timer = setInterval(loadPayment, 10000);

    return () => clearInterval(timer);
  }, [loadPayment]);

  if (booking.status !== "completed") {
    return null;
  }

  return (
    <section className="rounded-2xl border
    border-gray-200 bg-white p-5 shadow-sm space-y-4">

      <div className="flex items-center justify-between
      gap-3">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-50
          p-3 text-blue-600">
            <Wallet size={24} />
          </div>

          <div>
            <h3 className="font-bold text-gray-900">
              Payment Summary
            </h3>

            <p className="text-xs text-gray-500">
              ServiceHub secure payments
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={loadPayment}
          className="rounded-lg p-2 hover:bg-gray-100"
          title="Refresh payment status"
        >
          <RefreshCw size={18} />
        </button>

      </div>

      {role === "customer" && (
        <ApplyCoupon booking={booking} onChanged={loadPayment} disabled={loading} />
      )}

      {loading ? (
        <p className="text-sm text-gray-500">
          Loading payment details...
        </p>
      ) : error ? (
        <div className="rounded-xl bg-red-50 p-3
        text-sm text-red-700">
          {error}
        </div>
      ) : payment ? (

        <div className="rounded-xl bg-green-50
        p-4 space-y-3">

          <div className="flex items-center
          justify-between gap-2">

            <div className="flex items-center
            gap-2 text-green-700 font-semibold">

              <CheckCircle size={20} />

              Payment Recorded

            </div>

            <PaymentStatusBadge status={payment.status} />

          </div>

          <div className="text-3xl font-bold text-gray-900">
            {formatMoney(payment.amount_paise)}
          </div>

          <p className="text-sm text-gray-600 break-all">
            Payment ID: {payment.razorpay_payment_id}
          </p>

          <p className="text-sm text-gray-600">
            Method: {payment.payment_method || "Online"}
          </p>

          <p className="text-sm text-gray-600">
            Paid on:{" "}
            {new Date(payment.paid_at).toLocaleString(
              "en-IN",
              { timeZone: "Asia/Kolkata" }
            )}
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          <div className="flex justify-between items-center">

            <span className="text-gray-600">
              Payment Status
            </span>

            <PaymentStatusBadge status="unpaid" />

          </div>

          {role === "customer" && amount > 0 && (
            <>
              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-sm text-gray-500">
                  Final Payable Amount
                </p>

                <h2 className="text-3xl font-bold text-gray-900">
                  {formatMoney(amount)}
                </h2>

              </div>

              <PaymentButton
                booking={booking}
                amount={amount}
                onSuccess={loadPayment}
              />
            </>
          )}

          {role === "worker" && (
            <p className="rounded-xl bg-yellow-50 p-3
            text-sm text-yellow-800">
              Waiting for customer payment.
            </p>
          )}

        </div>
      )}
    </section>
  );
}
