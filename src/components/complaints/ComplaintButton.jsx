import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { ShieldAlert } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getBookingComplaints,
} from "../../services/complaintService";

import ComplaintForm from "./ComplaintForm";
import ComplaintCard from "./ComplaintCard";

export default function ComplaintButton({ booking }) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!booking?.id || !user?.id) return;

    setLoading(true);

    try {
      const data = await getBookingComplaints(
        booking.id,
        user.id
      );

      setComplaints(data || []);
      setError("");

    } catch (err) {
      setError(err.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [booking?.id, user?.id]);

  useEffect(() => {
    if (!open) return;

    load();
  }, [open, load]);

  const hasActiveComplaint = complaints.some((item) =>
    ["open", "under_review", "escalated"].includes(item.status)
  );

  return (
    <div className="space-y-4">

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex items-center justify-center
          gap-2 w-full bg-red-50 text-red-700
          hover:bg-red-100 rounded-xl p-4 font-semibold"
      >
        <ShieldAlert size={20} />

        {open ? "Close Support" : "Raise Complaint / Support"}

      </button>

      {open && (
        <div className="space-y-4">

          {error && (
            <div role="alert"
              className="bg-red-50 text-red-600 p-3 rounded-xl">
              {error}

              <button
                type="button"
                onClick={load}
                className="ml-3 underline"
              >
                Retry
              </button>

            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">
              Loading support requests...
            </p>
          ) : (
            <>
              {complaints.map((complaint) => (
                <ComplaintCard
                  key={complaint.id}
                  complaint={complaint}
                />
              ))}

              {!hasActiveComplaint && !error && (
                <ComplaintForm
                  booking={booking}
                  onClose={() => setOpen(false)}
                  onSuccess={load}
                />
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
}