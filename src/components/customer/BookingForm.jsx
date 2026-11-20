import { useState, useRef } from "react";

import {
  CalendarDays,
  Clock,
  MapPin,
  X,
  CheckCircle,
  ShieldCheck,
  FileText,
  Briefcase,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

function formatLocalDate(value) {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(price));
}

export default function BookingForm({
  service,
  onClose,
  onBooked,
}) {
  const { user } = useAuth();

  const submitting = useRef(false);

  const today = new Date();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const futureLimit = new Date();
  futureLimit.setFullYear(today.getFullYear() + 1);

  const minDate = formatLocalDate(today);
  const maxDate = formatLocalDate(futureLimit);

  const [date, setDate] = useState(
    formatLocalDate(tomorrow)
  );

  const [time, setTime] = useState("10:00");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const pricingType = service?.pricing_type || "fixed";

  const pricingLabel =
    pricingType === "hourly"
      ? "Hourly Rate"
      : pricingType === "inspection"
      ? "Inspection Fee"
      : "Fixed Price";

  async function handleBooking(e) {
    e.preventDefault();

    if (submitting.current || success) return;

    submitting.current = true;

    setError("");
    setLoading(true);

    try {
      if (!user?.id) {
        throw new Error("Please login first.");
      }

      if (!service?.id) {
        throw new Error("Selected service is invalid.");
      }

      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        date < minDate ||
        date > maxDate
      ) {
        throw new Error(
          "Please select a valid booking date."
        );
      }

      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
        throw new Error(
          "Please select a valid booking time."
        );
      }

      const appointment = new Date(`${date}T${time}`);

      if (
        !Number.isFinite(appointment.getTime()) ||
        formatLocalDate(appointment) !== date ||
        appointment <= new Date()
      ) {
        throw new Error(
          "Booking time must be in the future."
        );
      }

      if (address.trim().length < 10) {
        throw new Error(
          "Please enter your complete service address."
        );
      }

      if (address.trim().length > 500) {
        throw new Error("Service address is too long.");
      }

      if (notes.trim().length > 1000) {
        throw new Error("Additional instructions are too long.");
      }

      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          worker_service_id: service.id,
          booking_date: date,
          booking_time: time,
          service_address: address.trim(),
          notes: notes.trim(),
          status: "pending",
        });

      if (bookingError) {
        throw bookingError;
      }

      setSuccess(true);

    } catch (err) {

      console.error("Booking Error:", err);

      setError(
        err.message ||
        "Booking failed. Please try again."
      );

    } finally {

      submitting.current = false;
      setLoading(false);

    }
  }

  const inputClass =
    "w-full border border-slate-300 rounded-xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book Service"
        className="bg-white rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >

        {/* Booking Header */}

        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white p-6 rounded-t-2xl">

          <div className="flex justify-between items-start">

            <div className="bg-white/20 rounded-xl p-3">
              <CalendarDays size={28} />
            </div>

            {!success && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                aria-label="Close booking"
                className="p-2 rounded-lg hover:bg-white/20 disabled:opacity-50"
              >
                <X size={23} />
              </button>
            )}

          </div>

          <h2 className="text-2xl font-bold mt-4">
            {success ? "Booking Confirmed" : "Book a Service"}
          </h2>

          <p className="text-blue-100 text-sm mt-2">
            {success
              ? "Your booking request has been submitted."
              : "Schedule your professional service."}
          </p>

        </div>

        <div className="p-6 space-y-5">

          {/* Service Summary */}

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">

            <div className="flex items-center gap-3">

              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <Briefcase size={23} />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Selected Service
                </p>

                <h3 className="text-lg font-bold">
                  {service?.title}
                </h3>
              </div>

            </div>

            {service?.provider_name && (
              <div className="flex items-center gap-2 text-sm text-green-700">
                <ShieldCheck size={18} />
                {service.provider_name}
              </div>
            )}

            {service?.duration_minutes && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock size={17} />
                Estimated Duration: {service.duration_minutes} minutes
              </div>
            )}

            <div className="border-t pt-4">

              <p className="text-sm text-slate-500">
                {pricingLabel}
              </p>

              <p className="text-3xl font-bold text-blue-600 mt-1">

                {formatPrice(service?.price)}

                {pricingType === "hourly" && (
                  <span className="text-sm font-normal">
                    {" "}/ hour
                  </span>
                )}

              </p>

              <p className="text-xs text-slate-500 mt-2">
                {pricingType === "inspection"
                  ? "This is the inspection fee only. Final repair charges will be determined separately."
                  : pricingType === "hourly"
                  ? "Final charges depend on actual service duration."
                  : "Listed price for the described service."}
              </p>

            </div>

          </div>

          {/* Booking Success */}

          {success ? (

            <div className="space-y-5">

              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">

                <CheckCircle
                  size={55}
                  className="text-green-600 mx-auto mb-4"
                />

                <h3 className="text-xl font-bold text-green-700">
                  Booking Successful!
                </h3>

                <p className="text-sm text-green-700 mt-2">
                  Your booking request has been submitted.
                  Please wait for provider confirmation.
                </p>

              </div>

              <div className="border rounded-xl p-4 space-y-3">

                <h3 className="font-bold">
                  Booking Summary
                </h3>

                <p className="text-sm text-slate-600">
                  Date: {date}
                </p>

                <p className="text-sm text-slate-600">
                  Time: {time}
                </p>

                <p className="text-sm text-slate-600 break-words">
                  Address: {address}
                </p>

                <div className="flex justify-between items-center">

                  <span className="text-sm font-medium">
                    Booking Status
                  </span>

                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold rounded-full px-3 py-2">
                    Pending Confirmation
                  </span>

                </div>

              </div>

              <button
                type="button"
                onClick={() => {
                  if (onBooked) {
                    onBooked();
                  } else {
                    onClose();
                  }
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 font-semibold"
              >
                Done
              </button>

            </div>

          ) : (

            /* Booking Form */

            <form
              onSubmit={handleBooking}
              className="space-y-5"
            >

              <h3 className="text-lg font-bold">
                Schedule Your Service
              </h3>

              {/* Date and Time */}

              <div className="grid sm:grid-cols-2 gap-4">

                <label className="block text-sm font-medium">

                  <span className="flex items-center gap-2">
                    <CalendarDays
                      size={17}
                      className="text-blue-600"
                    />
                    Booking Date *
                  </span>

                  <input
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={date}
                    disabled={loading}
                    onChange={e => setDate(e.target.value)}
                    className={inputClass}
                    required
                  />

                </label>

                <label className="block text-sm font-medium">

                  <span className="flex items-center gap-2">
                    <Clock
                      size={17}
                      className="text-blue-600"
                    />
                    Booking Time *
                  </span>

                  <input
                    type="time"
                    value={time}
                    disabled={loading}
                    onChange={e => setTime(e.target.value)}
                    className={inputClass}
                    required
                  />

                </label>

              </div>

              {/* Address */}

              <label className="block text-sm font-medium">

                <span className="flex items-center gap-2">
                  <MapPin
                    size={18}
                    className="text-blue-600"
                  />
                  Service Address *
                </span>

                <textarea
                  value={address}
                  disabled={loading}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="House number, street, locality, city and PIN code"
                  className={inputClass}
                  rows={3}
                  minLength={10}
                  maxLength={500}
                  required
                />

                <span className="block text-right text-xs text-slate-400 mt-1">
                  {address.length}/500
                </span>

              </label>

              {/* Additional Instructions */}

              <label className="block text-sm font-medium">

                <span className="flex items-center gap-2">
                  <FileText
                    size={17}
                    className="text-blue-600"
                  />
                  Additional Instructions (Optional)
                </span>

                <textarea
                  value={notes}
                  disabled={loading}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Describe your service requirement or any special instructions..."
                  className={inputClass}
                  rows={3}
                  maxLength={1000}
                />

                <span className="block text-right text-xs text-slate-400 mt-1">
                  {notes.length}/1000
                </span>

              </label>

              {/* Payment Information */}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">

                <div className="flex gap-3 items-start">

                  <ShieldCheck
                    size={23}
                    className="text-blue-600 shrink-0"
                  />

                  <div>

                    <h4 className="text-sm font-semibold text-blue-700">
                      Booking Information
                    </h4>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      This submits a booking request to the
                      service provider. No payment is collected
                      at this stage. Your requested appointment
                      is subject to provider confirmation.
                    </p>

                  </div>

                </div>

              </div>

              {/* Error Message */}

              {error && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl"
                >
                  {error}
                </div>
              )}

              {/* Action Buttons */}

              <div className="flex gap-3 pt-2">

                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="flex-1 border border-slate-300 hover:bg-slate-50 py-3 rounded-xl font-medium disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
                >

                  {loading && (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}

                  {loading
                    ? "Submitting..."
                    : "Confirm Booking"}

                </button>

              </div>

            </form>

          )}

        </div>

      </div>

    </div>
  );
}