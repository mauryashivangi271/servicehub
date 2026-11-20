import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  TicketPercent,
  Lock,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  applyCoupon,
  removeCoupon,
  getBookingCoupon,
  getBookingPaymentOrder,
} from "../../services/couponService";

import CouponSummary from "./CouponSummary";

export default function ApplyCoupon({
  booking,
  onChanged,
  disabled = false,
}) {
  const { user, role } = useAuth();

  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const locked = useRef(false);
  const requestRef = useRef(0);

  const allowed =
    role === "customer" &&
    user?.id === booking.customer_id &&
    booking.status === "completed";

  const load = useCallback(async () => {
    if (!allowed) return;

    const requestId = ++requestRef.current;

    try {
      const [couponData, orderData] = await Promise.all([
        getBookingCoupon(booking.id),
        getBookingPaymentOrder(booking.id),
      ]);

      if (requestId !== requestRef.current) return;

      setCoupon(couponData);
      setOrder(orderData);
      setError("");

    } catch (err) {
      if (requestId === requestRef.current) {
        setError(err.message || "Unable to load coupon.");
      }

    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [booking.id, allowed]);

  useEffect(() => {
    setLoading(true);
    setCoupon(null);
    setOrder(null);
    setCode("");

    if (!allowed) return;

    load();

    const timer = setInterval(load, 15000);

    return () => {
      clearInterval(timer);
      requestRef.current++;
    };
  }, [load, allowed]);

  async function handleApply(event) {
    event.preventDefault();

    if (locked.current || order || disabled) return;

    if (!/^[A-Z0-9_-]{3,30}$/.test(code.trim().toUpperCase())) {
      setError("Enter a valid coupon code.");
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await applyCoupon(booking.id, code);
      await load();
      await onChanged?.();
      setCode("");

    } catch (err) {
      setError(err.message || "Unable to apply coupon.");

    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (locked.current || order || disabled) return;

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await removeCoupon(booking.id);
      await load();
      await onChanged?.();

    } catch (err) {
      setError(err.message || "Unable to remove coupon.");

    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  if (!allowed) return null;

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Loading coupon details...
      </p>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-4 space-y-4">

      <h3 className="flex items-center gap-2 font-bold">

        <TicketPercent className="text-indigo-600" />

        Apply Coupon

      </h3>

      {error && (
        <p role="alert" className="bg-red-50 text-red-700
          rounded-lg p-3 text-sm">
          {error}
        </p>
      )}

      {coupon && <CouponSummary coupon={coupon} />}

      {order ? (
        <p className="flex items-center gap-2 text-sm text-slate-500">
          <Lock size={16} />
          Payment initiated. Coupon changes are locked.
        </p>

      ) : coupon ? (

        <button
          type="button"
          disabled={busy || disabled}
          onClick={handleRemove}
          className="flex items-center gap-2 text-red-600
            text-sm font-semibold disabled:opacity-50"
        >
          <X size={16} />

          {busy ? "Removing..." : "Remove Coupon"}

        </button>

      ) : (

        <form
          onSubmit={handleApply}
          className="flex flex-wrap gap-2"
        >

          <input
            value={code}
            disabled={busy || disabled}
            onChange={(event) =>
              setCode(event.target.value.toUpperCase())
            }
            maxLength={30}
            aria-label="Coupon code"
            placeholder="Enter coupon code"
            className="flex-1 min-w-[140px] border rounded-xl
              p-3 uppercase outline-none focus:ring-2
              focus:ring-indigo-200"
          />

          <button
            type="submit"
            disabled={busy || disabled || !code.trim()}
            className="bg-indigo-600 text-white px-5 py-3
              rounded-xl font-semibold disabled:opacity-50"
          >
            {busy ? "Applying..." : "Apply"}
          </button>

        </form>

      )}

    </div>
  );
}