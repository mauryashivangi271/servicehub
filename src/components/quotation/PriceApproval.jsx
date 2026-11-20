import { useState, useRef } from "react";

import {
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";

import {
  respondToQuotation,
  formatCurrency,
} from "../../services/quotationService";

export default function PriceApproval({
  quotation,
  onUpdated,
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const lock = useRef(false);

  async function respond(action) {
    if (lock.current) return;

    setError("");

    if (
      action === "request_revision" &&
      !message.trim()
    ) {
      setError("Please explain the changes you want.");
      return;
    }

    const confirmation = {
      approve: `Approve final price of ${formatCurrency(
        quotation.total_amount
      )}?`,
      reject: "Reject this quotation?",
      request_revision: "Send revision request?",
    };

    if (!window.confirm(confirmation[action])) {
      return;
    }

    lock.current = true;
    setBusy(true);

    try {
      await respondToQuotation(
        quotation.id,
        action,
        message.trim()
      );

      setMessage("");

      if (onUpdated) await onUpdated();

    } catch (err) {
      setError(
        err.message || "Unable to update quotation."
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (quotation.status !== "sent") return null;

  return (
    <section className="border border-blue-100 bg-blue-50 rounded-xl p-5 space-y-4">

      <h3 className="font-bold text-lg">
        Review and Approve Price
      </h3>

      <p className="text-sm text-slate-600">
        Review all service charges before approving.
        Approval confirms the quoted price but does not
        collect payment.
      </p>

      <div className="bg-white border rounded-xl p-4">

        <p className="text-sm text-slate-500">
          Final Payable Quotation
        </p>

        <h2 className="text-3xl font-bold text-green-700 mt-1">
          {formatCurrency(quotation.total_amount)}
        </h2>

      </div>

      <label className="block text-sm font-medium">

        Comments or Revision Request

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Explain any price changes or concerns..."
          rows={4}
          maxLength={2000}
          disabled={busy}
          className="mt-2 w-full border bg-white rounded-xl p-3"
        />

      </label>

      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <button
        onClick={() => respond("approve")}
        disabled={busy}
        className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3 font-semibold disabled:opacity-50"
      >
        <CheckCircle size={20} />
        {busy ? "Please wait..." : "Approve Quotation"}
      </button>

      <div className="grid sm:grid-cols-2 gap-3">

        <button
          onClick={() => respond("request_revision")}
          disabled={busy}
          className="flex justify-center items-center gap-2 border border-blue-300 bg-white text-blue-700 rounded-xl p-3 disabled:opacity-50"
        >
          <MessageSquare size={18} />
          Request Revision
        </button>

        <button
          onClick={() => respond("reject")}
          disabled={busy}
          className="flex justify-center items-center gap-2 border border-red-200 bg-white text-red-600 rounded-xl p-3 disabled:opacity-50"
        >
          <XCircle size={18} />
          Reject
        </button>

      </div>

    </section>
  );
}