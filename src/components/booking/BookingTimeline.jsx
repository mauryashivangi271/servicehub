import {
  Clock,
  CheckCircle2,
  History,
} from "lucide-react";

import BookingStatusBadge from "./BookingStatusBadge";

export default function BookingTimeline({
  history = [],
  currentStatus,
}) {
  const events = [...history].sort(
    (a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
  );

  function formatDate(value) {
    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5">

      <h3 className="flex items-center gap-2 text-lg font-bold mb-5">
        <History size={21} className="text-blue-600" />
        Booking Timeline
      </h3>

      {events.length === 0 ? (
        <div className="space-y-3">

          <p className="text-sm text-slate-500">
            Detailed booking history is not available.
          </p>

          <BookingStatusBadge status={currentStatus} />

        </div>
      ) : (
        <div className="space-y-0">

          {events.map((event, index) => {
            const latest = index === events.length - 1;

            return (
              <div
                key={event.id}
                className="flex gap-4"
              >

                <div className="flex flex-col items-center">

                  <div
                    className={`p-2 rounded-full ${
                      latest
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >

                    {latest
                      ? <Clock size={19} />
                      : <CheckCircle2 size={19} />}

                  </div>

                  {!latest && (
                    <div className="w-0.5 bg-slate-200 flex-1 min-h-10" />
                  )}

                </div>

                <div className="pb-6 flex-1">

                  <BookingStatusBadge
                    status={event.new_status}
                  />

                  <p className="text-xs text-slate-500 mt-2">
                    {formatDate(event.created_at)}
                  </p>

                  {latest && (
                    <p className="text-xs text-blue-600 font-medium mt-2">
                      Latest recorded update
                    </p>
                  )}

                </div>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}