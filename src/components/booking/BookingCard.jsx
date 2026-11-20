import ChatButton from "../chat/ChatButton";
import ComplaintButton from "../complaints/ComplaintButton";
import { useState } from "react";

import {
  CalendarDays,
  Clock,
  MapPin,
  Briefcase,
  History,
  IndianRupee,
  UserCheck,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import BookingStatusBadge from "./BookingStatusBadge";
import BookingTimeline from "./BookingTimeline";

import QuotationManagement from "../quotation/QuotationManagement";
import PaymentSummary from "../payment/PaymentSummary";
import InvoiceCard from "../invoice/InvoiceCard";
import BookingReview from "../reviews/BookingReview";

import {
  getBookingHistory,
  getDisplayStatus,
} from "../../services/bookingService";

export default function BookingCard({
  booking,
  actions = [],
  busy = false,
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [showQuotations, setShowQuotations] = useState(false);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const service = booking.worker_services;

  const status = getDisplayStatus(booking);

  const title =
    booking.service_title_snapshot ||
    service?.title ||
    "Service Booking";

  const price =
    booking.price_snapshot ?? service?.price;

  const pricingType =
    booking.pricing_type_snapshot ||
    service?.pricing_type ||
    "fixed";

  const stages = [
    "accepted",
    "assigned",
    "on_the_way",
    "arrived",
    "inspection",
    "in_progress",
    "completed",
  ];

  const progress =
    status === "completed"
      ? 100
      : Math.max(
          0,
          ((stages.indexOf(status) + 1) / stages.length) * 100
        );

  async function toggleHistory() {
    if (showHistory) {
      setShowHistory(false);
      return;
    }

    setShowHistory(true);
    setLoading(true);
    setError("");

    try {
      const data = await getBookingHistory(booking.id);

      setHistory(data || []);
    } catch (err) {
      setError(
        err.message || "Unable to load booking timeline."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="bg-white border rounded-2xl
    p-6 space-y-5 shadow-sm">

      {/* Booking Header */}

      <div className="flex flex-wrap justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="bg-blue-50 text-blue-600
          p-3 rounded-xl">

            <Briefcase size={24} />

          </div>

          <div>

            <h2 className="font-bold text-xl">
              {title}
            </h2>

            <p className="text-sm text-slate-500">
              #{booking.id.slice(0, 8).toUpperCase()}
            </p>

          </div>

        </div>

        <BookingStatusBadge status={status} />

      </div>

      {/* Booking Details */}

      <div className="grid sm:grid-cols-2 gap-4 text-sm">

        <div className="flex items-center gap-2">

          <CalendarDays
            size={18}
            className="text-blue-600 shrink-0"
          />

          {booking.booking_date}

        </div>

        <div className="flex items-center gap-2">

          <Clock
            size={18}
            className="text-blue-600 shrink-0"
          />

          {booking.booking_time?.slice(0, 5)} IST

        </div>

        <div className="flex items-center gap-2">

          <IndianRupee
            size={18}
            className="text-green-600 shrink-0"
          />

          <div>

            <p className="text-xs text-slate-500">
              Original Service Price
            </p>

            <span className="font-semibold">

              {price != null
                ? Number(price).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : "Price unavailable"}

              {pricingType === "hourly" && " / hour"}

              {pricingType === "inspection" &&
                " inspection fee"}

              {booking.price_snapshot == null &&
                price != null &&
                " (current listed price)"}

            </span>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <MapPin
            size={18}
            className="text-blue-600 shrink-0"
          />

          <span className="break-words">
            {booking.service_address}
          </span>

        </div>

      </div>

      {/* Customer Instructions */}

      {booking.notes && (

        <div className="bg-slate-50 rounded-xl p-4">

          <p className="font-medium text-sm">
            Customer Instructions
          </p>

          <p className="text-slate-600 text-sm mt-1
          whitespace-pre-wrap break-words">

            {booking.notes}

          </p>

        </div>

      )}

      {/* Assigned Employee */}

      {booking.assigned_employee_id &&
        booking.status !== "cancelled" && (

          <div className="flex items-center gap-2
          bg-indigo-50 text-indigo-700 rounded-xl p-3">

            <UserCheck size={20} />

            <span className="font-medium text-sm">
              Employee assigned
            </span>

          </div>

        )}

      {/* Service Progress */}

      {["accepted", "completed"].includes(
        booking.status
      ) && (

        <div className="space-y-3 bg-slate-50
        rounded-xl p-4">

          <div className="flex justify-between
          text-sm font-medium">

            <span>Service Progress</span>

            <span
              className={
                status === "completed"
                  ? "text-green-600"
                  : "text-blue-600"
              }
            >

              {Math.round(progress)}%

            </span>

          </div>

          <div
            className="bg-slate-200 rounded-full
            h-2.5 overflow-hidden"
            role="progressbar"
            aria-label="Booking stage progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >

            <div
              className={`h-full rounded-full
              transition-all duration-500 ${
                status === "completed"
                  ? "bg-green-600"
                  : "bg-blue-600"
              }`}
              style={{ width: `${progress}%` }}
            />

          </div>

          <p className="text-sm text-slate-500 capitalize">
            {status.replaceAll("_", " ")}
          </p>

        </div>

      )}

      {/* Booking Action Buttons */}

      {actions.length > 0 && (

        <div className="flex flex-wrap gap-3 border-t pt-4">

          {actions.map((action) => (

            <button
              key={action.label}
              type="button"
              disabled={busy}
              onClick={() => action.onClick(booking)}
              className={`px-5 py-2.5 rounded-xl
              font-medium transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed ${
                action.danger
                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >

              {busy ? "Please wait..." : action.label}

            </button>

          ))}

        </div>

      )}

      {/* Booking Timeline */}

      <div className="border-t pt-4 space-y-4">

        <button
          type="button"
          onClick={toggleHistory}
          aria-expanded={showHistory}
          className="flex items-center justify-between
          gap-3 w-full bg-blue-50 hover:bg-blue-100
          text-blue-700 rounded-xl p-3 font-medium
          transition-colors"
        >

          <span className="flex items-center gap-2">

            <History size={18} />

            {showHistory
              ? "Hide Booking Timeline"
              : "View Booking Timeline"}

          </span>

          {showHistory ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}

        </button>

        {showHistory && (

          <div className="border rounded-xl p-4">

            {loading ? (

              <p className="text-slate-500 text-sm">
                Loading timeline...
              </p>

            ) : error ? (

              <p
                role="alert"
                className="text-red-600 text-sm"
              >
                {error}
              </p>

            ) : (

              <BookingTimeline
                history={history}
                currentStatus={status}
              />

            )}

          </div>

        )}

      </div>

      {/* Quotation Management */}

      {[
        "accepted",
        "completed",
        "cancelled",
      ].includes(booking.status) && (

        <div className="border-t pt-4 space-y-4">

          <button
            type="button"
            onClick={() =>
              setShowQuotations((previous) => !previous)
            }
            aria-expanded={showQuotations}
            className="flex items-center justify-between
            gap-3 w-full bg-indigo-50 hover:bg-indigo-100
            text-indigo-700 rounded-xl p-4 font-semibold
            transition-colors"
          >

            <span className="flex items-center gap-2">

              <FileText size={20} />

              {showQuotations
                ? "Hide Quotations"
                : "View Service Quotations"}

            </span>

            {showQuotations ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}

          </button>

          {showQuotations && (

            <QuotationManagement booking={booking} />

          )}

        </div>

      )}

      {/* Razorpay Payment Summary */}

      {booking.status === "completed" && (

        <div className="border-t pt-4">

          <PaymentSummary booking={booking} />

        </div>

      )}

      {/* Service Invoice and PDF Download */}

      {booking.status === "completed" && (

        <div className="border-t pt-4">

          <InvoiceCard booking={booking} />

        </div>

      )}

      {/* Verified Reviews and Ratings */}

      {booking.status === "completed" && (

        <div className="border-t pt-4">

          <BookingReview booking={booking} />

        </div>

      )}

      {["accepted", "completed"].includes(booking.status) && (
        <div className="border-t pt-4"><ChatButton booking={booking} /></div>
      )}
      <div className="border-t pt-4"><ComplaintButton booking={booking} /></div>
    </article>
  );
}