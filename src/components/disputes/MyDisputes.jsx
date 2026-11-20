import {
  useState,
  useEffect,
  useCallback,
} from "react";

import { Scale, RefreshCw } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getMyDisputes,
} from "../../services/disputeService";

import DisputeCard from "./DisputeCard";

export default function MyDisputes() {
  const { user } = useAuth();

  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;

    try {
      const data = await getMyDisputes(user.id);

      setDisputes(data || []);
      setError("");

    } catch (err) {
      setError(err.message || "Unable to load disputes.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();

    const timer = setInterval(load, 15000);

    return () => clearInterval(timer);
  }, [load]);

  const filtered = disputes.filter(
    (item) => filter === "all" || item.status === filter
  );

  return (
    <div className="space-y-6">

      <div className="flex justify-between
        items-center gap-3">

        <div>
          <h1 className="text-2xl font-bold">
            My Disputes
          </h1>

          <p className="text-slate-500">
            Track escalated complaints and resolutions.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          aria-label="Refresh disputes"
          className="bg-white border rounded-xl p-3"
        >
          <RefreshCw size={20} />
        </button>

      </div>

      {error && (
        <div role="alert"
          className="bg-red-50 text-red-700 p-4 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {[
          ["Total Disputes", disputes.length],

          ["Active", disputes.filter((item) =>
            ["open", "investigating"].includes(item.status)
          ).length],

          ["Resolved", disputes.filter(
            (item) => item.status === "resolved"
          ).length],

          ["Rejected", disputes.filter(
            (item) => item.status === "rejected"
          ).length],

        ].map(([label, value]) => (
          <div key={label}
            className="bg-white border rounded-2xl p-5">

            <p className="text-sm text-slate-500">
              {label}
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {loading ? "..." : value}
            </h2>

          </div>
        ))}

      </div>

      <select
        value={filter}
        onChange={(event) =>
          setFilter(event.target.value)
        }
        className="border bg-white rounded-xl p-3"
      >
        <option value="all">All Disputes</option>
        <option value="open">Open</option>
        <option value="investigating">Investigating</option>
        <option value="resolved">Resolved</option>
        <option value="rejected">Rejected</option>
      </select>

      {loading ? (
        <p className="text-center p-10 text-slate-500">
          Loading disputes...
        </p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl
          p-12 text-center">

          <Scale
            size={45}
            className="mx-auto text-slate-300"
          />

          <h3 className="font-bold text-lg mt-4">
            No disputes found
          </h3>

          <p className="text-sm text-slate-500 mt-2">
            Complaints escalated by the administrator
            will appear here.
          </p>

        </div>
      ) : (
        filtered.map((dispute) => (
          <DisputeCard
            key={dispute.id}
            dispute={dispute}
          />
        ))
      )}

    </div>
  );
}