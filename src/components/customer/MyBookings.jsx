import { useEffect, useState, useCallback, useRef } from "react";

import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import BookingCard from "../booking/BookingCard";

import {
  getCustomerBookings,
  cancelBooking,
  getDisplayStatus,
} from "../../services/bookingService";

export default function MyBookings() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const actionLock = useRef(false);

  const loadBookings = useCallback(async (silent = false) => {
    if (!user?.id) return;

    if (!silent) setLoading(true);

    setError("");

    try {
      const data = await getCustomerBookings(user.id);
      setBookings(data || []);
    } catch (err) {
      setError(err.message || "Unable to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBookings();

    const timer = setInterval(() => {
      loadBookings(true);
    }, 15000);

    return () => clearInterval(timer);
  }, [loadBookings]);

  async function handleCancel(booking) {
    if (actionLock.current) return;

    if (!window.confirm(
      "Are you sure you want to cancel this booking?"
    )) return;

    actionLock.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await cancelBooking(booking.id);

      setMessage("Booking cancelled successfully.");

      await loadBookings(true);
    } catch (err) {
      setError(err.message || "Unable to cancel booking.");
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }

  function getActions(booking) {
    const status = getDisplayStatus(booking);

    if (
      ["pending", "accepted", "assigned"].includes(status)
    ) {
      return [
        {
          label: "Cancel Booking",
          danger: true,
          onClick: handleCancel,
        },
      ];
    }

    return [];
  }

  const metrics = [
    {
      label: "Pending",
      value: bookings.filter(b => b.status === "pending").length,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Active",
      value: bookings.filter(b => b.status === "accepted").length,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Completed",
      value: bookings.filter(b => b.status === "completed").length,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Cancelled",
      value: bookings.filter(b =>
        ["cancelled", "rejected"].includes(b.status)
      ).length,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    const status = getDisplayStatus(booking);

    const matchesFilter =
      filter === "all" ||
      (filter === "active" && booking.status === "accepted") ||
      filter === status;

    const searchText = [
      booking.id,
      booking.service_title_snapshot,
      booking.worker_services?.title,
      booking.service_address,
    ].join(" ").toLowerCase();

    return (
      matchesFilter &&
      searchText.includes(search.toLowerCase().trim())
    );
  });

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 rounded-2xl p-6 text-white">

        <h1 className="text-2xl font-bold">
          My Bookings
        </h1>

        <p className="text-blue-100 mt-2">
          Track your appointments and service updates.
        </p>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {metrics.map(metric => (
          <div
            key={metric.label}
            className="bg-white border rounded-2xl p-4"
          >

            <div className={`p-3 w-fit rounded-xl ${metric.color}`}>
              <metric.icon size={22} />
            </div>

            <p className="text-sm text-slate-500 mt-3">
              {metric.label}
            </p>

            <h2 className="text-3xl font-bold">
              {metric.value}
            </h2>

          </div>
        ))}

      </div>

      <div className="flex flex-wrap gap-3 bg-white border rounded-xl p-4">

        <div className="flex items-center gap-2 border rounded-lg px-3 flex-1">

          <Search size={18} className="text-slate-400" />

          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search your bookings..."
            className="w-full py-3 outline-none"
          />

        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded-lg p-3"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={() => loadBookings()}
          disabled={loading || busy}
          className="border rounded-lg p-3"
          aria-label="Refresh bookings"
        >
          <RefreshCw
            size={20}
            className={loading ? "animate-spin" : ""}
          />
        </button>

      </div>

      {error && (
        <div role="alert" className="bg-red-50 text-red-700 rounded-xl p-4">
          {error}
        </div>
      )}

      {message && (
        <div role="status" className="bg-green-50 text-green-700 rounded-xl p-4">
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-slate-500">
          Loading your bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border rounded-2xl text-center p-12">

          <CalendarDays
            size={48}
            className="mx-auto text-slate-300"
          />

          <h3 className="text-lg font-bold mt-4">
            No bookings found
          </h3>

          <p className="text-slate-500 mt-2">
            Your matching appointments will appear here.
          </p>

        </div>
      ) : (
        <div className="grid gap-5">

          {filteredBookings.map(booking => (
            <BookingCard
              key={`${booking.id}-${getDisplayStatus(booking)}`}
              booking={booking}
              actions={getActions(booking)}
              busy={busy}
            />
          ))}

        </div>
      )}

    </div>
  );
}