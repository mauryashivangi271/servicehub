import { useState, useRef } from "react";
import {
  AlertCircle,
  Send,
  X,
} from "lucide-react";

import {
  submitComplaint,
} from "../../services/complaintService";

const categories = [
  { value: "service_quality", label: "Service Quality" },
  { value: "payment", label: "Payment Issue" },
  { value: "behaviour", label: "Behaviour Issue" },
  { value: "delay", label: "Service Delay" },
  { value: "incomplete_service", label: "Incomplete Service" },
  { value: "other", label: "Other" },
];

export default function ComplaintForm({
  booking,
  onSuccess,
  onClose,
}) {
  const [category, setCategory] = useState("service_quality");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const submitting = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting.current || success) return;

    setError("");

    if (!booking?.id) {
      setError("Please select a valid booking.");
      return;
    }

    if (subject.trim().length < 5) {
      setError("Subject must contain at least 5 characters.");
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must contain at least 10 characters.");
      return;
    }

    submitting.current = true;
    setLoading(true);

    try {
      await submitComplaint({
        bookingId: booking.id,
        category,
        subject: subject.trim(),
        description: description.trim(),
      });

      setSuccess(true);
      setSubject("");
      setDescription("");

    } catch (err) {
      setError(
        err.message || "Unable to submit complaint."
      );

      submitting.current = false;
      setLoading(false);
      return;
    }

    try {
      await onSuccess?.();
    } catch {
      setError(
        "Complaint submitted, but refresh failed. Please refresh the page."
      );
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">

      <div className="flex items-center justify-between gap-3">

        <div className="flex items-center gap-3">

          <div className="bg-red-50 text-red-600 p-3 rounded-xl">
            <AlertCircle size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Raise a Complaint
            </h2>

            <p className="text-sm text-slate-500">
              Report an issue with your booking.
            </p>
          </div>

        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close complaint form"
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        )}

      </div>

      {booking?.id && (
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs text-slate-500">
            Booking Reference
          </p>

          <p className="font-semibold text-slate-900">
            #{booking.id.slice(0, 8).toUpperCase()}
          </p>

          <p className="text-sm text-slate-600 mt-1">
            {booking.service_title_snapshot ||
              booking.worker_services?.title ||
              "Service Booking"}
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm"
        >
          {error}
        </div>
      )}

      {success ? (
        <div
          role="status"
          className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4"
        >
          Your complaint has been submitted successfully.
          The ServiceHub administration team will review it.
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>
            <label
              htmlFor="complaint-category"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Complaint Category
            </label>

            <select
              id="complaint-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              required
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
            >
              {categories.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="complaint-subject"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Subject
            </label>

            <input
              id="complaint-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter complaint subject"
              minLength={5}
              maxLength={150}
              required
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500"
            />

            <p className="text-xs text-slate-500 text-right mt-1">
              {subject.length}/150
            </p>
          </div>

          <div>
            <label
              htmlFor="complaint-description"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Description
            </label>

            <textarea
              id="complaint-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in detail..."
              rows={5}
              minLength={10}
              maxLength={3000}
              required
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 resize-y"
            />

            <p className="text-xs text-slate-500 text-right mt-1">
              {description.length}/3000
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3">

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              <Send size={18} />

              {loading
                ? "Submitting..."
                : "Submit Complaint"}
            </button>

          </div>

        </form>
      )}

    </section>
  );
}
