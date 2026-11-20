import { useEffect, useState } from "react";

import {
  Receipt,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { getBookingInvoice } from "../../services/invoiceService";

import InvoiceDetails from "./InvoiceDetails";

export default function InvoiceCard({ booking }) {
  const [invoice, setInvoice] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (booking.status !== "completed") return;

    let active = true;

    async function loadInvoice() {
      try {
        const data = await getBookingInvoice(booking.id);

        if (active) {
          setInvoice(data);
          setError("");
        }

      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInvoice();

    const timer = setInterval(loadInvoice, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };

  }, [booking.id, booking.status]);

  if (booking.status !== "completed") return null;

  if (loading) {
    return (
      <p className="text-sm text-gray-500">
        Checking invoice...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600">{error}</p>
    );
  }

  if (!invoice) {
    return (
      <div className="rounded-xl bg-gray-50 p-4
      text-sm text-gray-500">

        Invoice will be generated after successful
        payment verification.

      </div>
    );
  }

  return (
    <div className="space-y-4">

      <button
        type="button"
        aria-expanded={show}
        onClick={() => setShow((previous) => !previous)}
        className="flex items-center justify-between
        w-full rounded-xl bg-green-50 p-4
        text-green-700 font-semibold hover:bg-green-100"
      >

        <span className="flex items-center gap-2">

          <Receipt size={20} />

          {show ? "Hide Invoice" : "View Invoice & Receipt"}

        </span>

        {show ? (
          <ChevronUp size={20} />
        ) : (
          <ChevronDown size={20} />
        )}

      </button>

      {show && <InvoiceDetails invoice={invoice} />}

    </div>
  );
}