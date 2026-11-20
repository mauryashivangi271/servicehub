import StarRating from "./StarRating";

export default function RatingSummary({ reviews = [] }) {
  const total = reviews.length;

  const average = total
    ? reviews.reduce((sum, item) => sum + item.rating, 0) / total
    : 0;

  return (
    <div className="grid gap-6 rounded-2xl border
    bg-white p-6 shadow-sm md:grid-cols-2">

      <div className="flex flex-col items-center justify-center gap-3">

        <h2 className="text-5xl font-bold text-slate-900">
          {total ? average.toFixed(1) : "—"}
        </h2>

        <StarRating rating={average} size={27} />

        <p className="text-sm text-slate-500">
          {total} verified reviews
        </p>

      </div>

      <div className="space-y-3">

        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter(
            (item) => item.rating === star
          ).length;

          const percentage = total ? (count / total) * 100 : 0;

          return (
            <div key={star} className="flex items-center gap-3">

              <span className="w-10 text-sm font-medium">
                {star} ★
              </span>

              <div className="h-3 flex-1 overflow-hidden
              rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{ width: `${percentage}%` }}
                />

              </div>

              <span className="w-8 text-right text-sm text-slate-500">
                {count}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}