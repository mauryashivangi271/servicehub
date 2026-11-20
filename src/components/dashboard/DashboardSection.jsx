
import PhotoUpload from "../profile/PhotoUpload";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

export function Overview({ heading, description, cards }) {
  return (
    <div className="space-y-7">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-700 p-8 sm:p-12 text-white">
        <h2 className="text-2xl font-bold">{heading}</h2>
        <p className="mt-2 text-blue-100">{description}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(card => (
          <div
            key={card.title}
            className="sh-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="mb-5 h-1 w-10 rounded-full bg-blue-600" />
            <h3 className="text-lg font-semibold">
              {card.title}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {card.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSection() {
  const { user, profile, role, setProfile } = useAuth();

  return (
    <ProfileEditor
      key={user?.id}
      user={user}
      profile={profile}
      role={role}
      onUpdated={setProfile}
    />
  );
}

function ProfileEditor({ user, profile, role, onUpdated }) {
  const [form, setForm] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(e) {
    setForm(old => ({
      ...old,
      [e.target.name]: e.target.value,
    }));

    setMessage("");
  }

  async function saveProfile(e) {
    e.preventDefault();

    if (!user?.id || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const fullName = form.full_name.trim();
      const phone = form.phone.trim();

      if (fullName.length < 2) {
        throw new Error("Enter your full name.");
      }

      if (phone && !/^[6-9]\d{9}$/.test(phone)) {
        throw new Error("Enter a valid 10-digit Indian mobile number.");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          address: form.address.trim(),
        })
        .eq("id", user.id)
        .select("full_name, phone, address, avatar_url")
        .single();

      if (error) throw error;
      if (!data) throw new Error("Profile not found.");

      onUpdated?.(data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="max-w-3xl space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-700" />

        <div className="px-7 pb-7">
          <div className="-mt-10 relative"><PhotoUpload profile={profile} name={form.full_name || user?.email} onUpdated={onUpdated} /></div>

          <h2 className="mt-4 text-2xl font-bold">
            My Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage your personal information and account.
          </p>

          <form onSubmit={saveProfile} className="mt-7 space-y-5">

            <div>
              <label htmlFor="full_name" className="mb-2 block text-sm font-medium">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={updateField}
                required
                maxLength={100}
                placeholder="Enter full name"
                className="w-full rounded-xl border border-slate-300 p-3 outline-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Email Address
              </label>
              <input
                aria-label="Email address"
                value={user?.email || ""}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-100 p-3 text-slate-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Mobile Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={updateField}
                maxLength={10}
                placeholder="Enter mobile number"
                className="w-full rounded-xl border border-slate-300 p-3 outline-blue-600"
              />
            </div>

            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-medium">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={updateField}
                rows={3}
                maxLength={500}
                placeholder="Enter your complete address"
                className="w-full rounded-xl border border-slate-300 p-3 outline-blue-600"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">
                Account Role
              </p>
              <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold capitalize text-blue-700">
                {role || "Not assigned"}
              </span>
            </div>

            {message && (
              <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              disabled={saving}
              type="submit"
              className="rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <h3 className="text-xl font-bold">
          Account Security
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Keep your account secure by using a strong password.
        </p>

        <Link
          to="/forgot-password"
          className="mt-5 inline-block rounded-xl border border-blue-600 px-5 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
        >
          Change Password via Email
        </Link>
      </div>
    </section>
  );
}

export function EmptySection({ title }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-3 text-slate-500">
        This feature is not available yet.
      </p>
    </div>
  );
}
