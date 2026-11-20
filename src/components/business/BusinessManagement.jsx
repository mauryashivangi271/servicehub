import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  ShieldAlert,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getProvider } from "../../services/verificationService";
import { getBusiness } from "../../services/businessService";

import BusinessProfile from "./BusinessProfile";
import EmployeeManagement from "./EmployeeManagement";

export default function BusinessManagement() {
  const { user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [verification, setVerification] = useState(null);
  const [business, setBusiness] = useState(null);
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getProvider(user.id);

        const company =
          data.profile?.provider_type === "business" &&
          data.verification?.status === "approved"
            ? await getBusiness(user.id)
            : null;

        if (!active) return;

        setProvider(data.profile);
        setVerification(data.verification);
        setBusiness(company);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (user?.id) load();

    return () => {
      active = false;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <p className="p-8 text-slate-500">
        Loading business information...
      </p>
    );
  }

  if (error) {
    return (
      <p role="alert" className="p-5 bg-red-50 text-red-700 rounded-xl">
        {error}
      </p>
    );
  }

  if (
    provider?.provider_type !== "business" ||
    verification?.status !== "approved"
  ) {
    return (
      <div className="bg-white border rounded-2xl p-10 text-center">
        <ShieldAlert size={45} className="mx-auto mb-4 text-amber-500" />

        <h2 className="text-xl font-bold">
          Business Verification Required
        </h2>

        <p className="text-slate-500 mt-3">
          Complete your business verification and receive admin
          approval to access business management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl p-7">

        <Building2 size={38} className="mb-4" />

        <h1 className="text-2xl font-bold">
          Business Management
        </h1>

        <p className="text-blue-100 mt-2">
          Manage your company and professional team.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">

        {[
          ["profile", "Business Profile", Building2],
          ["employees", "Employees", Users],
        ].map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium ${
              tab === id
                ? "bg-blue-600 text-white"
                : "bg-white border text-slate-600"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <BusinessProfile
          business={business}
          provider={provider}
          onSaved={setBusiness}
        />
      ) : business ? (
        <EmployeeManagement business={business} />
      ) : (
        <div className="bg-white border rounded-xl p-8 text-center">

          <h3 className="font-semibold">
            Complete your business profile first.
          </h3>

          <button
            onClick={() => setTab("profile")}
            className="mt-5 bg-blue-600 text-white px-5 py-3 rounded-xl"
          >
            Create Business Profile
          </button>
        </div>
      )}
    </div>
  );
}