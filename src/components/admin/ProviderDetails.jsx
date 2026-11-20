import { useEffect, useState } from "react";
import { X, FileText, ExternalLink } from "lucide-react";
import {
  getProvider,
  getDocumentUrl,
  reviewVerification,
} from "../../services/verificationService";

export default function ProviderDetails({ request, onClose, onReviewed }) {
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getProvider(request.provider_id)
      .then(result => {
        if (active) setData(result);
      })
      .catch(err => {
        if (active) setError(err.message);
      });

    return () => { active = false; };
  }, [request.provider_id]);

  async function viewDocument(path) {
    const tab = window.open("about:blank", "_blank");

    if (!tab) {
      setError("Allow pop-ups to view the document.");
      return;
    }

    tab.opener = null;

    try {
      tab.location.href = await getDocumentUrl(path);
    } catch (err) {
      tab.close();
      setError(err.message);
    }
  }

  async function review(status) {
    setError("");

    if (status !== "approved" && !feedback.trim()) {
      setError("Please provide a reason.");
      return;
    }

    setBusy(true);

    try {
      await reviewVerification(
        request.provider_id,
        status,
        feedback.trim()
      );

      await onReviewed();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const p = data?.profile;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Provider verification details"
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 space-y-6">

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Review Application</h2>
          <button disabled={busy} onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        {!data && !error && <p>Loading provider details...</p>}

        {p && (
          <>
            <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl">

              {[
                ["Professional Type", p.provider_type],
                ["Business Name", p.business_name || "Not applicable"],
                ["Phone", p.phone],
                ["City", p.city],
                ["Service Area", p.service_area],
                ["Skills", p.skills],
                ["Experience", `${p.experience} years`],
                ["Status", data.verification?.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-semibold capitalize mt-1">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-sm text-slate-600">
              {p.description || "No description provided."}
            </p>

            <h3 className="font-bold text-lg">Submitted Documents</h3>

            {data.documents.length === 0 && (
              <p className="text-slate-500">No documents available.</p>
            )}

            {data.documents.map(doc => (
              <div key={doc.id}
                className="flex items-center gap-3 border rounded-xl p-4">

                <FileText className="text-blue-600" />

                <div className="flex-1">
                  <p className="capitalize font-medium">
                    {doc.document_type} proof
                  </p>

                  <p className="text-xs text-slate-500">
                    {new Date(doc.created_at).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => viewDocument(doc.file_path)}
                  className="flex items-center gap-2 text-blue-600 text-sm">
                  View <ExternalLink size={15} />
                </button>
              </div>
            ))}

            {["pending", "approved"].includes(request.status) && (
              <label className="block font-medium text-sm">
                Admin Feedback

                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Required for rejection or suspension..."
                  className="mt-2 w-full border rounded-xl p-3"
                />
              </label>
            )}

            <div className="flex flex-wrap gap-3">

              {request.status === "pending" && (
                <>
                  <button
                    disabled={busy}
                    onClick={() => review("approved")}
                    className="bg-green-600 text-white rounded-xl px-5 py-3 disabled:opacity-50">
                    {busy ? "Processing..." : "Approve Provider"}
                  </button>

                  <button
                    disabled={busy}
                    onClick={() => review("rejected")}
                    className="bg-red-600 text-white rounded-xl px-5 py-3 disabled:opacity-50">
                    Reject Application
                  </button>
                </>
              )}

              {request.status === "approved" && (
                <button
                  disabled={busy}
                  onClick={() => review("suspended")}
                  className="bg-red-600 text-white rounded-xl px-5 py-3">
                  Suspend Provider
                </button>
              )}
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl">
            {error}
          </p>
        )}
      </section>
    </div>
  );
}