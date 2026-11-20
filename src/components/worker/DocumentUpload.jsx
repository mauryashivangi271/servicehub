import { useState } from "react";
import { UploadCloud, FileCheck, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { uploadDocument } from "../../services/verificationService";

export default function DocumentUpload({
  providerType, documents, onUploaded
}) {
  const { user } = useAuth();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const required = [
    { id: "identity", title: "Identity Proof", required: true },
    { id: "address", title: "Address Proof", required: true },
    ...(providerType === "business"
      ? [{ id: "business", title: "Business Registration Proof", required: true }]
      : []),
    { id: "professional", title: "Professional Certificate", required: false },
  ];

  async function handleUpload(type, file) {
    if (!file) return;

    setBusy(type);
    setError("");

    try {
      await uploadDocument(user.id, type, file);
      await onUploaded();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="bg-white border rounded-2xl p-5 md:p-8 space-y-5">

      <div>
        <h2 className="text-xl font-bold">Verification Documents</h2>
        <p className="text-sm text-slate-500 mt-1">
          Upload clear and valid supporting documents.
        </p>
      </div>

      <div className="flex items-center gap-3 bg-blue-50 text-blue-700 p-4 rounded-xl">
        <ShieldCheck size={24} />
        <p className="text-sm">
          Your documents are private and accessible only
          to authorized users.
        </p>
      </div>

      {required.map(doc => {
        const uploaded = documents.some(
          item => item.document_type === doc.id
        );

        return (
          <div key={doc.id}
            className="border border-slate-200 rounded-xl p-4 flex flex-wrap items-center gap-4">

            <div className={`p-3 rounded-xl ${
              uploaded ? "bg-green-50 text-green-600"
              : "bg-blue-50 text-blue-600"
            }`}>
              {uploaded ? <FileCheck /> : <UploadCloud />}
            </div>

            <div className="flex-1 min-w-40">
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {doc.required ? "Required" : "Optional"} · PDF, JPG, PNG · 5 MB
              </p>

              {uploaded && (
                <p className="text-xs text-green-600 mt-1">Uploaded</p>
              )}
            </div>

            <label className={`bg-slate-100 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer ${
              busy ? "opacity-50 cursor-not-allowed" : "hover:bg-slate-200"
            }`}>
              {busy === doc.id
                ? "Uploading..."
                : uploaded ? "Upload newer copy" : "Choose File"}

              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,application/pdf"
                disabled={Boolean(busy)}
                onChange={e => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  handleUpload(doc.id, file);
                }}
              />
            </label>
          </div>
        );
      })}

      {error && (
        <p role="alert" className="p-3 bg-red-50 text-red-700 rounded-xl">
          {error}
        </p>
      )}
    </section>
  );
}