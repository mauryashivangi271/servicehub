import { useState, useEffect, useCallback, useRef } from "react";

import {
  CalendarDays,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

import BookingCard from "../booking/BookingCard";
import EmployeeAssignment from "../booking/EmployeeAssignment";
import { getWorkerActions } from "../booking/bookingActions";

import {
  getWorkerBookings,
  updateBookingStatus,
  getDisplayStatus,
} from "../../services/bookingService";

export default function ManageBookings({ mode = "all" }) {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [isBusiness, setIsBusiness] = useState(false);
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
      const [data, provider] = await Promise.all([
        getWorkerBookings(user.id),

        supabase
          .from("provider_profiles")
          .select("provider_type")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (provider.error) throw provider.error;

      setBookings(data || []);
      setIsBusiness(
        provider.data?.provider_type === "business"
      );
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

  useEffect(() => {
    setFilter("all");
    setSearch("");
  }, [mode]);

  async function changeStatus(booking, status) {
    if (actionLock.current) return;

    if (!window.confirm(
      `Update booking to ${status.replaceAll("_", " ")}?`
    )) return;

    actionLock.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await updateBookingStatus(booking.id, status);

      setMessage("Booking updated successfully.");

      await loadBookings(true);
    } catch (err) {
      setError(err.message || "Unable to update booking.");
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }

  const metrics = [
    {
      label: "Pending",
      value: bookings.filter(b => b.status === "pending").length,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Active",
      value: bookings.filter(b => b.status === "accepted").length,
      icon: CalendarDays,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Completed",
      value: bookings.filter(b => b.status === "completed").length,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Cancelled",
      value: bookings.filter(b =>
        ["cancelled", "rejected"].includes(b.status)
      ).length,
      icon: XCircle,
      color: "text-red-600 bg-red-50",
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    if (mode === "requests" && booking.status !== "pending") {
      return false;
    }

    if (mode === "bookings" && booking.status === "pending") {
      return false;
    }

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

      <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-2xl p-6">

        <h1 className="text-2xl font-bold">
          {mode === "requests"
            ? "Service Requests"
            : "Booking Management"}
        </h1>

        <p className="text-blue-100 mt-2">
          Manage customer bookings and track service progress.
        </p>

      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(metric => (
          <div
            key={metric.label}
            className="bg-white border rounded-2xl p-4"
          >
            <div className={`w-fit p-3 rounded-xl ${metric.color}`}>
              <metric.icon size={22} />
            </div>

            <p className="text-slate-500 mt-3 text-sm">
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
            placeholder="Search bookings..."
            className="w-full py-3 outline-none bg-transparent"
          />
        </div>

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border rounded-lg p-3"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="accepted">Accepted</option>
          <option value="assigned">Assigned</option>
          <option value="on_the_way">On the Way</option>
          <option value="arrived">Arrived</option>
          <option value="inspection">Inspection</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={() => loadBookings()}
          disabled={loading || busy}
          className="p-3 border rounded-lg hover:bg-slate-50"
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
        <div className="text-center p-10 text-slate-500">
          Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center">

          <CalendarDays
            size={45}
            className="mx-auto text-slate-300"
          />

          <h3 className="font-bold text-lg mt-4">
            No bookings found
          </h3>

          <p className="text-slate-500 mt-2">
            Matching bookings will appear here.
          </p>

        </div>
      ) : (
        <div className="grid gap-5">

          {filteredBookings.map(booking => (
            <div
              key={`${booking.id}-${getDisplayStatus(booking)}`}
              className="space-y-3"
            >

              <BookingCard
                booking={booking}
                actions={getWorkerActions(
                  booking,
                  changeStatus,
                  isBusiness
                )}
                busy={busy}
              />

              {isBusiness &&
                booking.status === "accepted" &&
                ["not_started", "assigned"].includes(
                  booking.execution_stage
                ) && (
                  <EmployeeAssignment
                    booking={booking}
                    onAssigned={() => loadBookings(true)}
                  />
                )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}