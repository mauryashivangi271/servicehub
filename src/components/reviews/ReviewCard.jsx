import { BadgeCheck, UserRound } from "lucide-react";
import StarRating from "./StarRating";

export default function ReviewCard({ review }) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">

      <div className="flex flex-wrap items-center gap-3">

        <div className="flex h-12 w-12 items-center
        justify-center rounded-full bg-blue-100 text-blue-600">
          <UserRound size={24} />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold">
            Service Review
          </h4>

          <span className="flex items-center gap-1
          text-xs text-green-600">
            <BadgeCheck size={15} />
            Verified Booking
          </span>
        </div>

        <p className="text-xs text-slate-500">
          {new Date(review.created_at).toLocaleDateString("en-IN", {
            timeZone: "Asia/Kolkata",
          })}
        </p>

      </div>

      <div className="mt-4 flex items-center gap-2">
        <StarRating rating={review.rating} />
        <span className="font-bold">{review.rating}/5</span>
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words
      text-sm leading-relaxed text-slate-600">
        {review.comment || "Rating submitted without a comment."}
      </p>

      <p className="mt-4 text-xs text-slate-400">
        Booking #{review.booking_id.slice(0, 8)}
      </p>

    </article>
  );
}