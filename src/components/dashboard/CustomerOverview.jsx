import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  Heart,
  Search,
  MessageSquare,
  Wallet,
  Receipt,
  Star,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

export default function CustomerOverview({ onSelect }) {
  const { user, profile } = useAuth();

  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError("");

    try {
      const bookingCount = () =>
        supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", user.id);

      const results = await Promise.all([
        bookingCount(),
        bookingCount().eq("status", "pending"),
        bookingCount().eq("status", "completed"),

        supabase
          .from("customer_favorites")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", user.id),

        supabase
          .from("bookings")
          .select(`
            id,
            service_title_snapshot,
            booking_date,
            status
          `)
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      for (const result of results) {
        if (result.error) throw result.error;
      }

      setStats({
        total: results[0].count,
        pending: results[1].count,
        completed: results[2].count,
        favorites: results[3].count,
      });

      setBookings(results[4].data || []);
    } catch (err) {
      setStats(null);
      setBookings([]);
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const cards = [
    {
      title: "Total Bookings",
      value: stats?.total,
      icon: CalendarDays,
      color: "bg-blue-50 text-blue-600",
      target: "bookings",
    },
    {
      title: "Pending Bookings",
      value: stats?.pending,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
      target: "bookings",
    },
    {
      title: "Completed Services",
      value: stats?.completed,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      target: "bookings",
    },
    {
      title: "Saved Services",
      value: stats?.favorites,
      icon: Heart,
      color: "bg-rose-50 text-rose-600",
      target: "favorites",
    },
  ];

  const actions = [
    { title: "Find Services", icon: Search, id: "services" },
    { title: "My Bookings", icon: CalendarDays, id: "bookings" },
    { title: "Messages", icon: MessageSquare, id: "messages" },
    { title: "Payments", icon: Wallet, id: "payments" },
    { title: "My Invoices", icon: Receipt, id: "invoices" },
    { title: "My Reviews", icon: Star, id: "reviews" },
  ];

  const statusColors = {
    pending: "bg-amber-50 text-amber-700",
    accepted: "bg-blue-50 text-blue-700",
    completed: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <section className="space-y-6">

      {/* Welcome Banner */}

      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-700 p-6 text-white sm:p-10">

        <p className="mb-2 text-sm text-blue-200">
          YOUR PERSONAL WORKSPACE
        </p>

        <h2 className="text-2xl font-bold sm:text-3xl">
          Welcome, {profile?.full_name || "Customer"}!
        </h2>

        <p className="mt-3 text-sm text-blue-100 sm:text-base">
          Discover trusted professionals and manage
          your local service bookings.
        </p>

        <button
          type="button"
          onClick={() => onSelect("services")}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-blue-700 hover:bg-blue-50"
        >
          Explore Services
          <ArrowRight size={18} />
        </button>

      </div>

      {/* Dashboard Heading */}

      <div className="flex flex-wrap items-center justify-between gap-3">

        <div>
          <h3 className="text-xl font-bold">
            Your Activity
          </h3>

          <p className="text-sm text-slate-500">
            Your latest ServiceHub statistics
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>

      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-red-700"
        >
          {error}
        </p>
      )}

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              type="button"
              key={card.title}
              onClick={() => onSelect(card.target)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >

              <div className={`mb-4 inline-flex rounded-xl p-3 ${card.color}`}>
                <Icon size={22} />
              </div>

              <p className="text-sm text-slate-500">
                {card.title}
              </p>

              <h3 className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : card.value ?? "—"}
              </h3>

            </button>
          );
        })}

      </div>

      {/* Recent Bookings */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          <h3 className="text-lg font-bold">
            Recent Bookings
          </h3>

          <button
            type="button"
            onClick={() => onSelect("bookings")}
            className="text-sm font-semibold text-blue-600"
          >
            View All
          </button>

        </div>

        {loading ? (
          <p className="py-6 text-center text-slate-500">
            Loading bookings...
          </p>
        ) : error ? (
          <p className="py-6 text-center text-slate-500">
            Booking information unavailable.
          </p>
        ) : bookings.length === 0 ? (
          <div className="py-8 text-center">

            <CalendarDays
              size={36}
              className="mx-auto mb-3 text-slate-300"
            />

            <p className="text-slate-500">
              You have no bookings yet.
            </p>

            <button
              type="button"
              onClick={() => onSelect("services")}
              className="mt-3 font-semibold text-blue-600"
            >
              Find a Service
            </button>

          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >

                <div className="min-w-0">
                  <p className="break-words font-semibold text-slate-800">
                    {booking.service_title_snapshot || "Service Booking"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    #{booking.id.slice(0, 8).toUpperCase()}
                    {" · "}
                    {booking.booking_date}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                    statusColors[booking.status] ||
                    "bg-slate-100 text-slate-600"
                  }`}
                >
                  {booking.status}
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

      {/* Quick Actions */}

      <div>

        <h3 className="mb-4 text-xl font-bold">
          Quick Actions
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                type="button"
                key={action.id}
                onClick={() => onSelect(action.id)}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-blue-300 hover:shadow-sm"
              >

                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Icon size={22} />
                </div>

                <span className="flex-1 font-semibold text-slate-700">
                  {action.title}
                </span>

                <ArrowRight
                  size={16}
                  className="text-slate-400"
                />

              </button>
            );
          })}

        </div>

      </div>

    </section>
  );
}