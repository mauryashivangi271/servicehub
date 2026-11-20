import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  onChange,
  size = 24,
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const icon = (
          <Star
            size={size}
            className={
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-300"
            }
          />
        );

        return onChange ? (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            aria-label={`Rate ${star} stars`}
            aria-pressed={rating === star}
            className="rounded p-1 transition hover:scale-110"
          >
            {icon}
          </button>
        ) : (
          <span key={star}>{icon}</span>
        );
      })}
    </div>
  );
}