import { useEffect, useState } from "react";
import { ShieldCheck, Clock, XCircle, Users, RefreshCw } from "lucide-react";
import { getVerificationRequests } from "../../services/verificationService";
import ProviderDetails from "./ProviderDetails";

export default function VerificationRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");

    try {
      setRequests(await getVerificationRequests());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const visible = requests.filter(
    r => filter === "all" || r.status === filter
  );

  const metrics = [
    ["Total Applications", requests.length, Users, "text-blue-600"],
    ["Pending", requests.filter(r => r.status === "pending").length,
      Clock, "text-amber-600"],
    ["Approved", requests.filter(r => r.status === "approved").length,
      ShieldCheck, "text-green-600"],
    ["Rejected", requests.filter(r => r.status === "rejected").length,
      XCircle, "text-red-600"],
  ];

  const colors = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    suspended: "bg-slate-200 text-slate-700",
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap justify-between items-center gap-4">

        <div>
          <h1 className="text-2xl font-bold">
            Worker Verification
          </h1>
          <p className="text-slate-500 mt-1">
            Review and manage professional applications.
          </p>
        </div>

        <button
          disabled={loading}
          onClick={load}
          className="flex items-center gap-2 border bg-white p-3 rounded-xl">
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {metrics.map(([label, number, Icon, color]) => (
          <div key={label}
            className="bg-white border rounded-2xl p-5">

            <Icon className={`${color} mb-4`} size={27} />

            <p className="text-sm text-slate-500">{label}</p>

            <h2 className="text-3xl font-bold mt-2">
              {loading || error ? "—" : number}
            </h2>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">

        {["all", "pending", "approved", "rejected", "suspended"].map(item => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`capitalize px-4 py-2 rounded-lg text-sm font-medium ${
              filter === item
                ? "bg-blue-600 text-white"
                : "bg-white border text-slate-600"
            }`}>
            {item}
          </button>
        ))}
      </div>

      <section className="bg-white border rounded-2xl overflow-hidden">

        {loading ? (
          <div className="p-10 text-center animate-pulse text-slate-500">
            Loading applications...
          </div>
        ) : error ? (
          <div role="alert" className="p-6 text-red-700">
            {error}
          </div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <ShieldCheck size={42} className="mx-auto mb-3 text-slate-300" />
            No verification applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">

              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {["Provider", "Type", "City", "Submitted", "Status", "Action"]
                    .map(label => (
                      <th key={label} className="p-4 whitespace-nowrap">
                        {label}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {visible.map(r => (
                  <tr key={r.id}
                    className="border-t hover:bg-slate-50">

                    <td className="p-4 font-medium">
                      {r.provider_profiles?.business_name ||
                        r.provider_profiles?.phone || r.provider_id}
                    </td>

                    <td className="p-4 capitalize">
                      {r.provider_profiles?.provider_type}
                    </td>

                    <td className="p-4">{r.provider_profiles?.city}</td>

                    <td className="p-4 whitespace-nowrap">
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full capitalize text-xs ${colors[r.status]}`}>
                        {r.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <button
                        onClick={() => setSelected(r)}
                        className="font-semibold text-blue-600">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selected && (
        <ProviderDetails
          key={selected.id}
          request={selected}
          onClose={() => setSelected(null)}
          onReviewed={async () => {
            setSelected(null);
            await load();
          }}
        />
      )}
    </div>
  );
}