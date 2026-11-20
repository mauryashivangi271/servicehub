import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  Scale,
  Search,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getAllDisputes,
  manageDispute,
} from "../../services/disputeService";

import DisputeCard from "./DisputeCard";

function DisputeActions({ dispute, onUpdated }) {
  const [resolution, setResolution] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const locked = useRef(false);

  if (!["open", "investigating"].includes(dispute.status)) {
    return null;
  }

  async function handleAction(action) {
    if (locked.current) return;

    if (
      action !== "investigate" &&
      resolution.trim().length < 10
    ) {
      setError("Please provide a detailed resolution.");
      return;
    }

    if (!window.confirm(`Confirm dispute action: ${action}?`)) {
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await manageDispute(
        dispute.id,
        action,
        resolution
      );

      setResolution("");
      await onUpdated?.();

    } catch (err) {
      setError(err.message || "Unable to update dispute.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  const actions = [
    {
      label: "Start Investigation",
      action: "investigate",
      style: "bg-blue-600 text-white",
    },
    {
      label: "Resolve Dispute",
      action: "resolve",
      style: "bg-green-600 text-white",
    },
    {
      label: "Reject Dispute",
      action: "reject",
      style: "bg-red-600 text-white",
    },
  ];

  return (
    <div className="border-t pt-4 space-y-3">

      <h3 className="font-semibold">
        Dispute Investigation
      </h3>

      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <textarea
        value={resolution}
        onChange={(event) =>
          setResolution(event.target.value)
        }
        rows={5}
        maxLength={3000}
        disabled={busy}
        placeholder="Enter investigation findings and resolution..."
        className="w-full border rounded-xl p-3"
      />

      <div className="flex flex-wrap gap-3">

        {actions
          .filter((item) =>
            !(item.action === "investigate" &&
              dispute.status === "investigating")
          )
          .map((item) => (
            <button
              type="button"
              key={item.action}
              onClick={() => handleAction(item.action)}
              disabled={busy}
              className={`${item.style} px-4 py-3
                rounded-xl font-medium text-sm
                disabled:opacity-50`}
            >
              {busy ? "Please wait..." : item.label}
            </button>
          ))}

      </div>

      <p className="text-xs text-slate-500">
        Resolving a dispute does not automatically
        issue a payment refund.
      </p>

    </div>
  );
}

export default function AdminDisputes() {
  const { role } = useAuth();

  const [disputes, setDisputes] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (role !== "admin") return;

    try {
      const data = await getAllDisputes();

      setDisputes(data || []);
      setError("");

    } catch (err) {
      setError(err.message || "Unable to load disputes.");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    load();

    const timer = setInterval(load, 15000);

    return () => clearInterval(timer);
  }, [load]);

  if (role !== "admin") {
    return <p>Admin access required.</p>;
  }

  const filtered = disputes.filter((item) => {
    const matchesStatus =
      filter === "all" || item.status === filter;

    const matchesSearch =
      `${item.id} ${item.reason} ${item.booking_id} ${item.complaint_id}`
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap
        justify-between items-center gap-3">

        <div>
          <h1 className="text-2xl font-bold">
            Dispute Management
          </h1>

          <p className="text-slate-500">
            Investigate escalated service complaints.
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
          ["Total", disputes.length],

          ["Open", disputes.filter(
            (item) => item.status === "open"
          ).length],

          ["Investigating", disputes.filter(
            (item) => item.status === "investigating"
          ).length],

          ["Resolved", disputes.filter(
            (item) => item.status === "resolved"
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

      <div className="flex flex-wrap gap-3">

        <div className="bg-white flex items-center
          gap-2 border rounded-xl p-3 flex-1">

          <Search size={18} className="text-slate-400" />

          <input
            placeholder="Search disputes..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="outline-none w-full"
          />

        </div>

        <select
          value={filter}
          onChange={(event) =>
            setFilter(event.target.value)
          }
          className="border rounded-xl bg-white p-3"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

      </div>

      {loading ? (
        <p className="p-10 text-center text-slate-500">
          Loading disputes...
        </p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl
          p-12 text-center">

          <Scale
            size={45}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-4 font-bold">
            No disputes found
          </h3>

        </div>
      ) : (
        filtered.map((dispute) => (
          <DisputeCard key={dispute.id} dispute={dispute}>

            <DisputeActions
              dispute={dispute}
              onUpdated={load}
            />

          </DisputeCard>
        ))
      )}

    </div>
  );
}