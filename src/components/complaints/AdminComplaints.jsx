import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  ShieldAlert,
  RefreshCw,
  Search,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getAllComplaints,
  manageComplaint,
} from "../../services/complaintService";

import ComplaintCard from "./ComplaintCard";

function ComplaintActions({ complaint, onUpdated }) {
  const [response, setResponse] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const locked = useRef(false);

  if (!["open", "under_review"].includes(complaint.status)) {
    return null;
  }

  async function handleAction(action) {
    if (locked.current) return;

    if (action !== "review" && response.trim().length < 10) {
      setError("Please provide a detailed explanation.");
      return;
    }

    if (!window.confirm(`Confirm complaint action: ${action}?`)) {
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await manageComplaint(
        complaint.id,
        action,
        response
      );

      setResponse("");
      await onUpdated?.();

    } catch (err) {
      setError(err.message || "Unable to update complaint.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  const actions = [
    {
      label: "Start Review",
      action: "review",
      style: "bg-blue-600 text-white",
    },
    {
      label: "Resolve",
      action: "resolve",
      style: "bg-green-600 text-white",
    },
    {
      label: "Reject",
      action: "reject",
      style: "bg-red-600 text-white",
    },
    {
      label: "Escalate to Dispute",
      action: "escalate",
      style: "bg-purple-600 text-white",
    },
  ];

  return (
    <div className="border-t pt-4 space-y-3">

      <h3 className="font-semibold">
        Admin Investigation
      </h3>

      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}

      <textarea
        rows={4}
        value={response}
        maxLength={3000}
        disabled={busy}
        onChange={(event) =>
          setResponse(event.target.value)
        }
        placeholder="Enter investigation notes or resolution..."
        className="w-full border rounded-xl p-3"
      />

      <div className="flex flex-wrap gap-2">

        {actions
          .filter((item) =>
            !(item.action === "review" &&
              complaint.status === "under_review")
          )
          .map((item) => (
            <button
              type="button"
              key={item.action}
              disabled={busy}
              onClick={() => handleAction(item.action)}
              className={`${item.style} px-4 py-2.5
                rounded-xl text-sm font-medium
                disabled:opacity-50`}
            >
              {busy ? "Please wait..." : item.label}
            </button>
          ))}

      </div>

    </div>
  );
}

export default function AdminComplaints() {
  const { role } = useAuth();

  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (role !== "admin") return;

    try {
      const data = await getAllComplaints();

      setComplaints(data || []);
      setError("");

    } catch (err) {
      setError(err.message || "Unable to load complaints.");
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

  const filtered = complaints.filter((item) => {
    const matchesStatus =
      filter === "all" || item.status === filter;

    const matchesSearch =
      `${item.subject} ${item.id} ${item.booking_id} ${item.raised_by}`
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
            Complaint Management
          </h1>

          <p className="text-slate-500">
            Investigate and resolve service complaints.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          aria-label="Refresh complaints"
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
          ["Total", complaints.length],

          ["Open", complaints.filter(
            (item) => item.status === "open"
          ).length],

          ["Under Review", complaints.filter(
            (item) => item.status === "under_review"
          ).length],

          ["Escalated", complaints.filter(
            (item) => item.status === "escalated"
          ).length],

        ].map(([label, value]) => (
          <div key={label}
            className="bg-white border p-5 rounded-2xl">

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

        <div className="flex items-center gap-2
          bg-white border rounded-xl p-3 flex-1">

          <Search size={18} className="text-slate-400" />

          <input
            placeholder="Search complaints..."
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
          className="border bg-white rounded-xl p-3"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="under_review">Under Review</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">Resolved</option>
          <option value="rejected">Rejected</option>
        </select>

      </div>

      {loading ? (
        <p className="text-center text-slate-500 p-8">
          Loading complaints...
        </p>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-2xl
          p-12 text-center">

          <ShieldAlert
            size={45}
            className="mx-auto text-slate-300"
          />

          <h3 className="font-bold mt-4">
            No complaints found
          </h3>

        </div>
      ) : (
        filtered.map((complaint) => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
          >

            <p className="text-xs text-slate-500 break-all">
              Raised by: {complaint.raised_by}
            </p>

            <ComplaintActions
              complaint={complaint}
              onUpdated={load}
            />

          </ComplaintCard>
        ))
      )}

    </div>
  );
}