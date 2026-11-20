import { useState } from "react";
import { UserRound, Building2, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { saveProvider } from "../../services/verificationService";

export default function WorkerOnboarding({ existing, onSaved }) {
  const { user, profile } = useAuth();

  const [form, setForm] = useState({
    provider_type:
      existing?.provider_type ||
      (user?.user_metadata?.requested_worker_type === "business"
        ? "business" : "individual"),

    business_name: existing?.business_name || "",
    phone: existing?.phone || "",
    city: existing?.city || "",
    service_area: existing?.service_area || "",
    skills: existing?.skills || "",
    experience: existing?.experience ?? 0,
    description: existing?.description || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        user_id: user.id,
        business_name: form.provider_type === "business"
          ? form.business_name.trim() : null,
        phone: form.phone.trim(),
        city: form.city.trim(),
        service_area: form.service_area.trim(),
        skills: form.skills.trim(),
        description: form.description.trim(),
        experience: Number(form.experience),
        updated_at: new Date().toISOString(),
      };

      if (!/^[6-9]\d{9}$/.test(payload.phone)) {
        throw new Error("Enter a valid Indian mobile number.");
      }

      if (!payload.city || !payload.service_area || !payload.skills) {
        throw new Error("Complete all required fields.");
      }

      if (payload.provider_type === "business" &&
          !payload.business_name) {
        throw new Error("Enter your business name.");
      }

      await saveProvider(payload, Boolean(existing));
      await onSaved();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-slate-300 rounded-xl px-4 py-3 " +
    "outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <form onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-5 md:p-8 space-y-6">

      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Professional Information
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Tell us about yourself and your professional services.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { id: "individual", name: "Individual", Icon: UserRound },
          { id: "business", name: "Business / Agency", Icon: Building2 },
        ].map(({ id, name, Icon }) => (
          <button
            type="button"
            key={id}
            aria-pressed={form.provider_type === id}
            onClick={() => update("provider_type", id)}
            className={`border-2 rounded-2xl p-6 text-center transition ${
              form.provider_type === id
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <Icon size={32} className="mx-auto mb-3" />
            <span className="font-semibold">{name}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <label className="block text-sm font-medium">
          Full Name
          <input
            value={profile?.full_name || user?.user_metadata?.full_name || ""}
            readOnly
            className={`${inputClass} mt-2 bg-slate-50`}
          />
        </label>

        {form.provider_type === "business" && (
          <label className="block text-sm font-medium">
            Business Name *
            <input
              required
              value={form.business_name}
              onChange={e => update("business_name", e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </label>
        )}

        {[
          ["phone", "Mobile Number", "tel"],
          ["city", "City", "text"],
          ["service_area", "Service Area / Locality", "text"],
          ["skills", "Professional Skills", "text"],
          ["experience", "Years of Experience", "number"],
        ].map(([key, label, type]) => (
          <label key={key} className="block text-sm font-medium">
            {label} *
            <input
              required
              type={type}
              min={type === "number" ? 0 : undefined}
              max={type === "number" ? 80 : undefined}
              value={form[key]}
              disabled={loading}
              onChange={e => update(key, e.target.value)}
              className={`${inputClass} mt-2`}
            />
          </label>
        ))}
      </div>

      <label className="block text-sm font-medium">
        About Your Services
        <textarea
          rows={4}
          value={form.description}
          onChange={e => update("description", e.target.value)}
          className={`${inputClass} mt-2`}
          placeholder="Describe your experience and expertise..."
        />
      </label>

      {error && (
        <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl">
          {error}
        </p>
      )}

      <button
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        <Save size={18} />
        {loading ? "Saving..." : "Save Professional Profile"}
      </button>
    </form>
  );
}