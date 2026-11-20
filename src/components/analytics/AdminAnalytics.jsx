import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  RefreshCw,
  BarChart3,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getAnalytics,
} from "../../services/analyticsService";

import AnalyticsSummary from "./AnalyticsSummary";
import RevenueChart from "./RevenueChart";
import BookingChart from "./BookingChart";
import CategoryPerformance from "./CategoryPerformance";
import EmployeePerformance from "./EmployeePerformance";
import ReportExport from "./ReportExport";

export function AnalyticsDashboard({
  expectedRole,
  showInventory = expectedRole === "admin",
}) {
  const { user, role } = useAuth();

  const [months, setMonths] = useState(6);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestRef = useRef(0);

  const admin = expectedRole === "admin";

  const allowed =
    !!user?.id && role === expectedRole;

  const load = useCallback(async () => {
    if (!allowed) return;

    const requestId = ++requestRef.current;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const result = await getAnalytics(months);

      if (requestId !== requestRef.current) return;

      if (result.role !== expectedRole) {
        throw new Error("Invalid analytics access.");
      }

      setData(result);

    } catch (err) {
      if (requestId === requestRef.current) {
        setError(
          err.message || "Unable to load analytics."
        );
      }
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }

  }, [allowed, months, expectedRole, user?.id]);

  useEffect(() => {
    load();

    return () => {
      requestRef.current++;
    };
  }, [load]);

  if (!allowed) {
    return (
      <div className="bg-red-50 text-red-700 rounded-xl p-5">
        Analytics access denied.
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <header className="flex flex-wrap justify-between items-center gap-4">

        <div>

          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="text-indigo-600" />

            {admin
              ? "Platform Analytics"
              : "Performance Analytics"}
          </h1>

          <p className="text-slate-500 mt-1">
            {admin
              ? "Monitor ServiceHub platform performance."
              : "Track bookings, earnings and service performance."}
          </p>

        </div>

        <div className="flex flex-wrap gap-2">

          <select
            aria-label="Reporting period"
            value={months}
            onChange={(event) =>
              setMonths(Number(event.target.value))
            }
            className="bg-white border rounded-xl p-3"
          >
            <option value={1}>This Month</option>
            <option value={3}>Last 3 Months</option>
            <option value={6}>Last 6 Months</option>
            <option value={12}>Last 12 Months</option>
            <option value={24}>Last 24 Months</option>
          </select>

          <button
            type="button"
            disabled={loading}
            aria-label="Refresh analytics"
            onClick={load}
            className="bg-white border rounded-xl p-3 disabled:opacity-50"
          >
            <RefreshCw
              size={20}
              className={loading ? "animate-spin" : ""}
            />
          </button>

          <ReportExport data={loading ? null : data} />

        </div>

      </header>

      {error && (
        <div
          role="alert"
          className="bg-red-50 text-red-700 p-4 rounded-xl"
        >
          {error}

          <button
            onClick={load}
            className="ml-3 underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white border rounded-2xl
          p-16 text-center text-slate-500">

          Loading analytics...

        </div>
      )}

      {!loading && data && (
        <>

          <AnalyticsSummary
            summary={data.summary}
            showInventory={showInventory}
            admin={admin}
          />

          <RevenueChart
            data={data.monthly}
            admin={admin}
          />

          <div className="grid xl:grid-cols-2 gap-5">

            <BookingChart data={data.booking_status} />

            <CategoryPerformance data={data.categories} />

          </div>

          {!admin && data.employees?.length > 0 && (
            <EmployeePerformance
              employees={data.employees}
            />
          )}

          <p className="text-xs text-slate-500">
            Booking statistics use booking creation dates.
            Financial charts use captured payment dates.
            Reporting months follow IST. Customer, provider
            and inventory totals represent current records.
            Refunded payments are excluded from financial charts.
          </p>

        </>
      )}

    </div>
  );
}

export default function AdminAnalytics() {
  return <AnalyticsDashboard expectedRole="admin" />;
}