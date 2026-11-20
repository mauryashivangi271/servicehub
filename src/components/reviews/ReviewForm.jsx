import { useState, useRef } from "react";
import StarRating from "./StarRating";
import { submitReview } from "../../services/reviewService";

export default function ReviewForm({ booking, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const lock = useRef(false);

  const labels = [
    "Select rating",
    "Poor",
    "Fair",
    "Good",
    "Very Good",
    "Excellent",
  ];

  async function handleSubmit(e) {
    e.preventDefault();

    if (lock.current) return;

    if (!rating) {
      setError("Please select a star rating.");
      return;
    }

    if (!window.confirm("Submit your review?")) return;

    lock.current = true;
    setLoading(true);
    setError("");

    try {
      await submitReview(booking.id, rating, comment);
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-yellow-200
      bg-yellow-50 p-5 space-y-4"
    >
      <h3 className="text-lg font-bold text-slate-900">
        Rate Your Service
      </h3>

      <p className="text-sm text-slate-600">
        Share your experience with this professional.
      </p>

      <StarRating
        rating={rating}
        onChange={loading ? undefined : setRating}
        size={32}
      />

      <p className="font-medium text-yellow-700">
        {labels[rating]}
      </p>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your service experience..."
        rows={4}
        maxLength={2000}
        disabled={loading}
        className="w-full rounded-xl border bg-white p-3
        outline-none focus:ring-2 focus:ring-blue-500"
      />

      <p className="text-right text-xs text-slate-500">
        {comment.length}/2000
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        disabled={loading || rating === 0}
        className="rounded-xl bg-blue-600 px-6 py-3
        font-semibold text-white hover:bg-blue-700
        disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}