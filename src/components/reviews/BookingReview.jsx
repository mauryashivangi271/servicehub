import { useState, useEffect, useCallback } from "react";

import { useAuth } from "../../context/AuthContext";

import { getBookingReview } from "../../services/reviewService";
import { getBookingPayment } from "../../services/paymentService";

import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";

export default function BookingReview({ booking }) {
  const { user, role } = useAuth();

  const [review, setReview] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id || booking.status !== "completed") {
      return;
    }

    try {
      const [existingReview, payment] = await Promise.all([
        getBookingReview(booking.id),
        getBookingPayment(booking.id),
      ]);

      setReview(existingReview);
      setPaid(payment?.status === "captured");
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load review.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, booking.id, booking.status]);

  useEffect(() => {
    load();

    const timer = setInterval(load, 10000);

    return () => clearInterval(timer);
  }, [load]);

  if (booking.status !== "completed") {
    return null;
  }

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading review...
      </p>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (review) {
    return <ReviewCard review={review} />;
  }

  if (role !== "customer") {
    return null;
  }

  if (!paid) {
    return (
      <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4">
        <h3 className="font-semibold text-slate-900">
          Reviews & Ratings
        </h3>

        <p className="mt-1 text-sm text-slate-600">
          You can submit a review after successful payment.
        </p>
      </div>
    );
  }

  return (
    <ReviewForm
      booking={booking}
      onSuccess={load}
    />
  );
}