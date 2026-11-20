export default function PaymentStatusBadge({ status }) {
  const styles = {
    created: "bg-blue-100 text-blue-700",
    unpaid: "bg-orange-100 text-orange-700",
    attempted: "bg-yellow-100 text-yellow-700",
    pending: "bg-yellow-100 text-yellow-700",
    captured: "bg-green-100 text-green-700",
    paid: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    refunded: "bg-purple-100 text-purple-700",
    partially_refunded: "bg-indigo-100 text-indigo-700",
  };

  const labels = {
    created: "Order Created",
    unpaid: "Unpaid",
    attempted: "Payment Attempted",
    pending: "Verification Pending",
    captured: "Paid",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
    partially_refunded: "Partially Refunded",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1
      text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {labels[status] || "Unknown"}
    </span>
  );
}