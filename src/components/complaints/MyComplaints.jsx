import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  ShieldAlert,
  RefreshCw,
  Plus,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getMyComplaints,
} from "../../services/complaintService";

import {
  getCustomerBookings,
  getWorkerBookings,
} from "../../services/bookingService";

import ComplaintCard from "./ComplaintCard";
import ComplaintForm from "./ComplaintForm";

export default function MyComplaints() {
  const { user, role } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [bookingId, setBookingId] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [data, bookingData] = await Promise.all([
        getMyComplaints(user.id),

        role === "worker"
          ? getWorkerBookings(user.id)
          : getCustomerBookings(user.id),
      ]);

      setComplaints(data || []);
      setBookings(bookingData || []);
      setError("");

    } catch (err) {
      setError(err.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, role]);

  useEffect(() => {
    load();

    const timer = setInterval(load, 15000);

    return () => clearInterval(timer);
  }, [load]);

  const selectedBooking = bookings.find(
    (booking) => booking.id === bookingId
  );

  const filtered = complaints.filter(
    (item) => filter === "all" || item.status === filter
  );

  const stats = [
    { label: "Total Complaints", value: complaints.length },

    {
      label: "Active Complaints",
      value: complaints.filter((item) =>
        ["open", "under_review", "escalated"].includes(
          item.status
        )
      ).length,
    },

    {
      label: "Resolved",
      value: complaints.filter(
        (item) => item.status === "resolved"
      ).length,
    },

    {
      label: "Rejected",
      value: complaints.filter(
        (item) => item.status === "rejected"
      ).length,
    },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap
        items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold">
            My Complaints
          </h1>

          <p className="text-slate-500">
            Submit and track your service complaints.
          </p>
        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={load}
            aria-label="Refresh complaints"
            className="border bg-white rounded-xl p-3"
          >
            <RefreshCw size={20} />
          </button>

          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2
              bg-blue-600 text-white rounded-xl px-4 py-3"
          >
            <Plus size={20} />
            New Complaint
          </button>

        </div>

      </div>

      {error && (
        <div role="alert"
          className="bg-red-50 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      {message && (
        <div role="status"
          className="bg-green-50 text-green-700 p-4 rounded-xl">
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {stats.map((stat) => (
          <div key={stat.label}
            className="bg-white border rounded-2xl p-5">

            <p className="text-sm text-slate-500">
              {stat.label}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : stat.value}
            </h2>

          </div>
        ))}

      </div>

      {showForm && (
        <div className="space-y-4">

          <div className="bg-white border rounded-xl p-4">

            <label className="block font-medium mb-2">
              Select Booking
            </label>

            <select
              value={bookingId}
              onChange={(event) =>
                setBookingId(event.target.value)
              }
              className="w-full border rounded-xl p-3"
            >

              <option value="">Choose booking</option>

              {bookings.map((booking) => (
                <option key={booking.id} value={booking.id}>
                  {booking.service_title_snapshot ||
                    booking.worker_services?.title ||
                    "Service Booking"}

                  {" - #" + booking.id.slice(0, 8)}
                </option>
              ))}

            </select>

            {!bookings.length && (
              <p className="text-sm text-slate-500 mt-2">
                No bookings available.
              </p>
            )}

          </div>

          {selectedBooking && (
            <ComplaintForm
              key={selectedBooking.id}
              booking={selectedBooking}
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                setBookingId("");
                setMessage("Complaint submitted successfully.");
                load();
              }}
            />
          )}

        </div>
      )}

      <select
        value={filter}
        onChange={(event) =>
          setFilter(event.target.value)
        }
        className="bg-white border rounded-xl p-3"
      >
        <option value="all">All Complaints</option>
        <option value="open">Open</option>
        <option value="under_review">Under Review</option>
        <option value="escalated">Escalated</option>
        <option value="resolved">Resolved</option>
        <option value="rejected">Rejected</option>
      </select>

      {loading ? (
        <div className="bg-white border rounded-xl p-10
          text-center text-slate-500">
          Loading complaints...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl
          p-12 text-center">

          <ShieldAlert
            size={45}
            className="mx-auto text-slate-300"
          />

          <h3 className="font-bold text-lg mt-4">
            No complaints found
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Your submitted complaints will appear here.
          </p>

        </div>
      ) : (
        filtered.map((complaint) => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
          />
        ))
      )}

    </div>
  );
}