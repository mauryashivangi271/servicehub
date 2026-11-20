import { useState } from "react";
import { Building2, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { saveBusiness } from "../../services/businessService";

export default function BusinessProfile({
  business,
  provider,
  onSaved,
}) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    business_name: business?.business_name || provider?.business_name || "",
    registration_number: business?.registration_number || "",
    business_address: business?.business_address || "",
    description: business?.description || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full mt-2 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500";

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!form.business_name.trim() || !form.business_address.trim()) {
        throw new Error("Complete all required fields.");
      }

      const result = await saveBusiness({
        owner_id: user.id,
        business_name: form.business_name.trim(),
        registration_number: form.registration_number.trim(),
        business_address: form.business_address.trim(),
        description: form.description.trim(),
      });

      setSuccess("Business profile saved successfully.");
      onSaved(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center gap-4">
        <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
          <Building2 size={28} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Business Profile</h2>
          <p className="text-sm text-slate-500">
            Manage your company information.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {[
          ["business_name", "Business Name", true],
          ["registration_number", "Registration Number", false],
        ].map(([key, label, required]) => (
          <label key={key} className="text-sm font-medium">
            {label}
            {required && " *"}
            <input
              required={required}
              value={form[key]}
              className={inputClass}
              disabled={loading || key === "business_name"}
              onChange={e =>
                setForm(prev => ({
                  ...prev,
                  [key]: e.target.value,
                }))
              }
            />
          </label>
        ))}
      </div>

      <label className="block text-sm font-medium">
        Business Address *
        <textarea
          required
          rows={3}
          value={form.business_address}
          disabled={loading}
          className={inputClass}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              business_address: e.target.value,
            }))
          }
        />
      </label>

      <label className="block text-sm font-medium">
        Business Description
        <textarea
          rows={4}
          value={form.description}
          disabled={loading}
          className={inputClass}
          onChange={e =>
            setForm(prev => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />
      </label>

      {error && (
        <p role="alert" className="bg-red-50 text-red-700 p-3 rounded-xl">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="bg-green-50 text-green-700 p-3 rounded-xl">
          {success}
        </p>
      )}

      <button
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        <Save size={18} />
        {loading ? "Saving..." : "Save Business Profile"}
      </button>
    </form>
  );
}