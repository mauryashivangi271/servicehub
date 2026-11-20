import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  TicketPercent,
  Plus,
  Search,
  RefreshCw,
  CheckCircle,
  History,
  IndianRupee,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getCoupons,
  getCouponUsages,
  setCouponStatus,
  getCouponStatus,
  formatPaise,
} from "../../services/couponService";

import CouponForm from "./CouponForm";
import CouponCard from "./CouponCard";
import CouponUsageHistory from "./CouponUsageHistory";

export default function AdminCoupons() {
  const { user, role } = useAuth();

  const [coupons, setCoupons] = useState([]);
  const [usages, setUsages] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("coupons");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const locked = useRef(false);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    if (role !== "admin" || !user?.id) return;

    const requestId = ++requestRef.current;

    try {
      const [couponData, usageData] = await Promise.all([
        getCoupons(),
        getCouponUsages(),
      ]);

      if (requestId !== requestRef.current) return;

      setCoupons(couponData || []);
      setUsages(usageData || []);
      setError("");

    } catch (err) {
      if (requestId === requestRef.current) {
        setError(err.message || "Unable to load coupons.");
      }

    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, role]);

  useEffect(() => {
    setCoupons([]);
    setUsages([]);
    setLoading(true);
    setShowForm(false);
    setEditing(null);

    if (role !== "admin" || !user?.id) return;

    load();

    const timer = setInterval(load, 15000);

    return () => {
      clearInterval(timer);
      requestRef.current++;
    };
  }, [load, user?.id, role]);

  const filtered = coupons.filter((coupon) => {
    const matchesSearch =
      `${coupon.code} ${coupon.title}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      getCouponStatus(coupon).toLowerCase() === filter;

    return matchesSearch && matchesFilter;
  });

  const activeCoupons = coupons.filter(
    (coupon) => getCouponStatus(coupon) === "Active"
  ).length;

  const recentDiscount = usages.reduce(
    (total, usage) =>
      total + Number(usage.discount_amount_paise),
    0
  );

  const stats = [
    {
      label: "Loaded Coupons",
      value: coupons.length,
      icon: TicketPercent,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Active Coupons",
      value: activeCoupons,
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Recent Redemptions",
      value: usages.length,
      icon: History,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Recent Discounts",
      value: formatPaise(recentDiscount),
      icon: IndianRupee,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  function openCreate() {
    setEditing(null);
    setShowForm(true);
    setMessage("");
    setTab("coupons");
  }

  function openEdit(coupon) {
    setEditing(coupon);
    setShowForm(true);
    setMessage("");
  }

  async function handleSaved() {
    setShowForm(false);
    setEditing(null);
    setMessage("Coupon saved successfully.");

    await load();
  }

  async function handleToggle(coupon) {
    if (locked.current) return;

    const action = coupon.is_active
      ? "Deactivate"
      : "Activate";

    if (!window.confirm(`${action} ${coupon.code}?`)) {
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await setCouponStatus(
        coupon.id,
        !coupon.is_active
      );

      setMessage("Coupon status updated successfully.");

      await load();

    } catch (err) {
      setError(err.message || "Unable to update coupon.");

    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  if (role !== "admin") {
    return <p>Admin access required.</p>;
  }

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-10 text-center">
        Loading coupons...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>

          <h1 className="text-2xl font-bold">
            Coupons & Discounts
          </h1>

          <p className="text-slate-500 mt-1">
            Manage promotional offers and customer discounts.
          </p>

        </div>

        <div className="flex gap-2">

          <button
            onClick={load}
            aria-label="Refresh coupons"
            className="bg-white border rounded-xl p-3"
          >
            <RefreshCw size={20} />
          </button>

          <button
            disabled={busy || showForm}
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600
              text-white px-4 py-3 rounded-xl disabled:opacity-50"
          >
            <Plus size={20} />
            Create Coupon
          </button>

        </div>

      </div>

      {error && (
        <p role="alert" className="bg-red-50 text-red-700 p-4 rounded-xl">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="bg-green-50 text-green-700 p-4 rounded-xl">
          {message}
        </p>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">

        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white border rounded-2xl p-5 shadow-sm"
          >

            <div className={`${color} p-3 rounded-xl w-fit`}>
              <Icon size={23} />
            </div>

            <p className="text-slate-500 text-sm mt-4">
              {label}
            </p>

            <h2 className="text-2xl font-bold mt-1 break-words">
              {value}
            </h2>

          </div>
        ))}

      </div>

      <p className="text-xs text-slate-500">
        Redemption statistics cover the latest 100 usage records.
      </p>

      {showForm && (
        <CouponForm
          key={editing?.id || "new-coupon"}
          coupon={editing}
          onSaved={handleSaved}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      <div className="flex flex-wrap gap-2 border-b pb-3">

        {[
          { id: "coupons", label: "All Coupons" },
          { id: "history", label: "Usage History" },
        ].map((item) => (
          <button
            key={item.id}
            disabled={showForm}
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-5 py-3 font-medium
              disabled:opacity-50 ${
                tab === item.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white border text-slate-600"
              }`}
          >
            {item.label}
          </button>
        ))}

      </div>

      {tab === "coupons" && (

        <>

          <div className="flex flex-wrap gap-3">

            <div className="flex items-center gap-2 flex-1
              bg-white border rounded-xl p-3">

              <Search size={20} className="text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search coupons..."
                className="w-full outline-none"
              />

            </div>

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="bg-white border rounded-xl p-3"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>

          </div>

          {filtered.length === 0 ? (

            <div className="bg-white border rounded-2xl p-12 text-center">

              <TicketPercent
                size={48}
                className="mx-auto text-slate-300"
              />

              <h3 className="font-bold mt-4">
                No coupons found
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Create a promotional coupon to get started.
              </p>

            </div>

          ) : (

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-4">

              {filtered.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  busy={busy || showForm}
                  onEdit={openEdit}
                  onToggle={handleToggle}
                />
              ))}

            </div>

          )}

        </>

      )}

      {tab === "history" && (
        <CouponUsageHistory usages={usages} />
      )}

    </div>
  );
}