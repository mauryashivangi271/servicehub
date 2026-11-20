import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getProvider,
  submitVerification,
} from "../../services/verificationService";

import WorkerOnboarding from "./WorkerOnboarding";
import DocumentUpload from "./DocumentUpload";

export default function Verification() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!user?.id) return;

    try {
      setData(await getProvider(user.id));
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      await submitVerification();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-slate-500 animate-pulse">
      Loading verification details...
    </div>;
  }

  if (!data) {
    return (
      <div className="p-6 bg-red-50 rounded-xl">
        <p>{error || "Unable to load verification."}</p>
        <button onClick={load} className="mt-3 text-blue-600">
          Try again
        </button>
      </div>
    );
  }

  const status = data.verification?.status || "not submitted";

  const editable = ["not submitted", "rejected"].includes(status);

  const required = data.profile?.provider_type === "business"
    ? ["identity", "address", "business"]
    : ["identity", "address"];

  const ready = Boolean(data.profile) && required.every(type =>
    data.documents.some(doc => doc.document_type === type)
  );

  const colors = {
    approved: "bg-green-50 text-green-700",
    pending: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-700",
    suspended: "bg-red-50 text-red-700",
    "not submitted": "bg-slate-100 text-slate-700",
  };

  const StatusIcon = status === "approved"
    ? ShieldCheck
    : status === "pending" ? Clock : AlertCircle;

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl p-7">

        <ShieldCheck size={38} className="mb-4" />

        <h1 className="text-2xl font-bold">
          Professional Verification
        </h1>

        <p className="text-blue-100 mt-2">
          Build customer trust by completing your verification.
        </p>
      </div>

      <div className={`rounded-xl p-5 flex items-center gap-4 ${colors[status]}`}>
        <StatusIcon size={28} />

        <div>
          <h3 className="font-bold capitalize">{status}</h3>

          <p className="text-sm mt-1">
            {status === "approved"
              ? "Your professional account is verified."
              : status === "pending"
              ? "Your application is awaiting admin review."
              : status === "rejected"
              ? "Correct your application and resubmit."
              : status === "suspended"
              ? "Your verification is suspended. Contact support."
              : "Complete the steps below to apply."}
          </p>

          {data.verification?.admin_feedback && (
            <p className="text-sm mt-2">
              Admin feedback: {data.verification.admin_feedback}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {[
          ["Account", true],
          ["Profile", Boolean(data.profile)],
          ["Documents", ready],
          ["Approval", status === "approved"],
        ].map(([label, done], index) => (
          <div key={label}
            className="bg-white border rounded-xl p-4 text-center">

            {done ? (
              <CheckCircle2 className="mx-auto text-green-600 mb-2" />
            ) : (
              <div className="mx-auto mb-2 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                {index + 1}
              </div>
            )}

            <p className="text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      {editable && (
        <>
          <WorkerOnboarding
            existing={data.profile}
            onSaved={load}
          />

          {data.profile && (
            <DocumentUpload
              providerType={data.profile.provider_type}
              documents={data.documents}
              onUploaded={load}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={!ready || submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold disabled:opacity-50"
          >
            {submitting
              ? "Submitting..."
              : status === "rejected"
              ? "Resubmit for Verification"
              : "Submit for Verification"}
          </button>
        </>
      )}

      {error && (
        <p role="alert" className="p-4 bg-red-50 text-red-700 rounded-xl">
          {error}
        </p>
      )}
    </div>
  );
}