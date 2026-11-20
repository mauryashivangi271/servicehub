import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Star } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getCustomerReviews } from "../../services/reviewService";
import ReviewCard from "./ReviewCard";

export default function CustomerReviews() {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReviews = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      setReviews(await getCustomerReviews(user.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <section className="space-y-6">

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">My Reviews</h2>

          <p className="text-sm text-slate-500">
            Manage your submitted service reviews.
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="rounded-xl border bg-white p-3"
          aria-label="Refresh reviews"
        >
          <RefreshCw
            size={20}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-4 text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading reviews...</p>
      ) : !error && reviews.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <Star size={40} className="mx-auto mb-4 text-slate-300" />

          <h3 className="font-semibold">No reviews yet</h3>

          <p className="mt-2 text-sm text-slate-500">
            Complete and pay for a booking to submit your review.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

    </section>
  );
}