import { useState, useEffect, useCallback } from "react";
import { Star, RefreshCw } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProviderReviews } from "../../services/reviewService";
import RatingSummary from "./RatingSummary";
import ReviewCard from "./ReviewCard";

export default function WorkerReviews() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadReviews = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const data = await getProviderReviews(user.id);
      setReviews(data || []);
    } catch (err) {
      setError(err.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = reviews.filter(
    (review) =>
      filter === "all" ||
      review.rating === Number(filter)
  );

  return (
    <section className="space-y-6">

      {/* Header */}

      <div className="flex items-center justify-between gap-3">

        <div>
          <h2 className="text-2xl font-bold">
            Reviews & Ratings
          </h2>

          <p className="text-sm text-slate-500">
            Track your customer feedback and service reputation.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReviews}
          disabled={loading}
          aria-label="Refresh reviews"
          className="rounded-xl border bg-white p-3
          hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={20}
            className={loading ? "animate-spin" : ""}
          />
        </button>

      </div>

      {/* Error Message */}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-red-600"
        >
          {error}
        </p>
      )}

      {/* Loading */}

      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <RefreshCw
            size={30}
            className="mx-auto mb-3 animate-spin text-blue-600"
          />

          <p className="text-slate-500">
            Loading reviews...
          </p>
        </div>
      ) : !error && (
        <>

          {/* Rating Summary */}

          <RatingSummary reviews={reviews} />

          {/* Review Filter */}

          <div className="flex flex-wrap items-center justify-between gap-3">

            <div>
              <h3 className="text-lg font-bold">
                Customer Feedback
              </h3>

              <p className="text-sm text-slate-500">
                {filteredReviews.length} reviews found
              </p>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter reviews by rating"
              className="rounded-xl border bg-white p-3
              text-sm outline-none focus:ring-2
              focus:ring-blue-500"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

          </div>

          {/* Customer Reviews */}

          {filteredReviews.length === 0 ? (
            <div className="rounded-2xl border bg-white p-10 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16
              items-center justify-center rounded-full
              bg-yellow-50">

                <Star
                  size={32}
                  className="text-yellow-400"
                />

              </div>

              <h3 className="text-lg font-semibold">
                No reviews found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {filter === "all"
                  ? "Customer reviews will appear here after completed and paid bookings."
                  : "No reviews match the selected rating."}
              </p>

            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">

              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                />
              ))}

            </div>
          )}

        </>
      )}

    </section>
  );
}