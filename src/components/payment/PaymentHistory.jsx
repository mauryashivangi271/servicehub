import { useEffect, useState } from "react";

import { Wallet } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getCustomerPayments,
  getProviderPayments,
  formatMoney,
} from "../../services/paymentService";

import PaymentStatusBadge from "./PaymentStatusBadge";

export default function PaymentHistory() {
  const { user, role } = useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    let active = true;

    async function load() {
      try {
        setError("");

        const data =
          role === "worker"
            ? await getProviderPayments(user.id)
            : await getCustomerPayments(user.id);

        if (active) setPayments(data || []);

      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [user?.id, role]);

  const total = payments
    .filter((payment) => payment.status === "captured")
    .reduce(
      (sum, payment) => sum + Number(payment.amount_paise),
      0
    );

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Payment History
        </h2>

        <p className="text-sm text-gray-500">
          View verified ServiceHub transactions.
        </p>
      </div>

      <div className="rounded-2xl border bg-white
      p-6 shadow-sm">

        <Wallet className="mb-3 text-blue-600" size={30} />

        <p className="text-sm text-gray-500">
          Total Fully Captured Payments
        </p>

        <h3 className="text-3xl font-bold text-gray-900">
          {formatMoney(total)}
        </h3>

      </div>

      {loading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : payments.length === 0 ? (
        <div className="rounded-2xl border bg-white
        p-10 text-center text-gray-500">
          No payment transactions found.
        </div>
      ) : (

        <div className="overflow-x-auto rounded-2xl
        border bg-white shadow-sm">

          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-gray-600">

              <tr>
                <th className="p-4">Payment ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>

            </thead>

            <tbody>

              {payments.map((payment) => (

                <tr key={payment.id} className="border-t">

                  <td className="p-4">
                    {payment.razorpay_payment_id}
                  </td>

                  <td className="p-4 font-semibold">
                    {formatMoney(payment.amount_paise)}
                  </td>

                  <td className="p-4 capitalize">
                    {payment.payment_method || "Online"}
                  </td>

                  <td className="p-4">
                    {new Date(
                      payment.paid_at
                    ).toLocaleDateString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </td>

                  <td className="p-4">
                    <PaymentStatusBadge
                      status={payment.status}
                    />
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}