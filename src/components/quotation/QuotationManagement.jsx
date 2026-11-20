import { useState, useEffect, useCallback } from "react";

import {
  FileText,
  Plus,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getQuotations,
} from "../../services/quotationService";

import QuotationBuilder from "./QuotationBuilder";
import QuotationCard from "./QuotationCard";
import PriceApproval from "./PriceApproval";
import NegotiationPanel from "./NegotiationPanel";

export default function QuotationManagement({
  booking,
}) {
  const { user, role } = useAuth();

  const [quotations, setQuotations] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuotations = useCallback(async () => {
    try {
      setError("");

      const data = await getQuotations(booking.id);

      setQuotations(data || []);

    } catch (err) {
      setError(
        err.message || "Unable to load quotations."
      );
    } finally {
      setLoading(false);
    }
  }, [booking.id]);

  useEffect(() => {
    loadQuotations();

    const timer = setInterval(
      loadQuotations,
      15000
    );

    return () => clearInterval(timer);
  }, [loadQuotations]);

  const approved = quotations.some(
    quotation => quotation.status === "approved"
  );

  const latest = quotations[0];

  const eligibleBooking =
    booking.status === "accepted" &&
    ["arrived", "inspection"].includes(
      booking.execution_stage
    );

  const canCreate =
    role === "worker" &&
    eligibleBooking &&
    !approved &&
    !loading &&
    !error;

  async function handleCreated() {
    setShowBuilder(false);
    await loadQuotations();
  }

  return (
    <section className="bg-white border rounded-2xl p-5 space-y-5">

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="bg-blue-50 text-blue-600 rounded-xl p-3">
            <FileText size={24} />
          </div>

          <div>
            <h2 className="text-lg font-bold">
              Service Quotations
            </h2>

            <p className="text-sm text-slate-500">
              Service charges and price approvals
            </p>
          </div>

        </div>

        <button
          onClick={loadQuotations}
          className="border rounded-lg p-3"
          aria-label="Refresh quotations"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />
        </button>

      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 rounded-xl p-4"
        >
          {error}
        </div>
      )}

      {approved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">

          <h3 className="font-bold">
            Final Price Approved
          </h3>

          <p className="text-sm mt-1">
            Customer has approved the quotation.
            The approved price is locked.
          </p>

        </div>
      )}

      {canCreate && !showBuilder && (
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-3 font-medium"
        >
          <Plus size={20} />

          {latest
            ? "Create Revised Quotation"
            : "Create Quotation"}
        </button>
      )}

      {showBuilder && canCreate && (
        <QuotationBuilder
          booking={booking}
          onCreated={handleCreated}
          onClose={() => setShowBuilder(false)}
        />
      )}

      {loading ? (
        <div className="text-center text-slate-500 p-8">
          Loading quotations...
        </div>
      ) : !error && quotations.length === 0 ? (
        <div className="text-center bg-slate-50 rounded-xl p-8">

          <FileText
            size={40}
            className="mx-auto text-slate-300"
          />

          <p className="font-semibold mt-3">
            No quotations available
          </p>

          <p className="text-sm text-slate-500 mt-2">
            {role === "worker"
              ? "Quotations can be prepared after arriving at the service location."
              : "Your provider's quotation will appear here."}
          </p>

        </div>
      ) : (
        <div className="space-y-5">

          {quotations.map(quotation => (
            <QuotationCard
              key={quotation.id}
              quotation={quotation}
            >

              <NegotiationPanel
                quotation={quotation}
                userId={user?.id}
              />

              {role === "customer" &&
                eligibleBooking &&
                quotation.status === "sent" && (
                  <PriceApproval
                    quotation={quotation}
                    onUpdated={loadQuotations}
                  />
                )}

            </QuotationCard>
          ))}

        </div>
      )}

    </section>
  );
}