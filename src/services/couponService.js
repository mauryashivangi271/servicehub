import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getCoupons() {
  return unwrap(
    await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })
  );
}

export async function saveCoupon(coupon) {
  return unwrap(
    await supabase.rpc("save_coupon", {
      p_coupon_id: coupon.id || null,
      p_code: coupon.code.trim().toUpperCase(),
      p_title: coupon.title.trim(),
      p_description: coupon.description || "",
      p_discount_type: coupon.discount_type,
      p_discount_value: Number(coupon.discount_value),
      p_minimum_order_amount: Number(
        coupon.minimum_order_amount
      ),
      p_maximum_discount:
        coupon.maximum_discount === "" ||
        coupon.maximum_discount == null
          ? null
          : Number(coupon.maximum_discount),
      p_usage_limit: Number(coupon.usage_limit),
      p_per_customer_limit: Number(
        coupon.per_customer_limit
      ),
      p_starts_at: new Date(coupon.starts_at).toISOString(),
      p_expires_at: new Date(coupon.expires_at).toISOString(),
    })
  );
}

export async function setCouponStatus(id, active) {
  return unwrap(
    await supabase.rpc("set_coupon_status", {
      p_coupon_id: id,
      p_is_active: active,
    })
  );
}

export async function applyCoupon(bookingId, code) {
  return unwrap(
    await supabase.rpc("apply_booking_coupon", {
      p_booking_id: bookingId,
      p_code: code.trim().toUpperCase(),
    })
  );
}

export async function removeCoupon(bookingId) {
  return unwrap(
    await supabase.rpc("remove_booking_coupon", {
      p_booking_id: bookingId,
    })
  );
}

export async function getBookingCoupon(bookingId) {
  return unwrap(
    await supabase
      .from("booking_coupons")
      .select("*")
      .eq("booking_id", bookingId)
      .maybeSingle()
  );
}

export async function getCouponUsages() {
  return unwrap(
    await supabase
      .from("coupon_usages")
      .select("*, coupons(code, title)")
      .order("used_at", { ascending: false })
      .limit(100)
  );
}

export async function getBookingPaymentOrder(bookingId) {
  return unwrap(
    await supabase
      .from("payment_orders")
      .select("id, status, amount_paise")
      .eq("booking_id", bookingId)
      .maybeSingle()
  );
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount || 0));
}

export function formatPaise(amount) {
  return formatCurrency(Number(amount || 0) / 100);
}

export function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getCouponStatus(coupon) {
  if (!coupon.is_active) return "Inactive";

  const now = Date.now();

  if (now >= new Date(coupon.expires_at).getTime()) {
    return "Expired";
  }

  if (now < new Date(coupon.starts_at).getTime()) {
    return "Scheduled";
  }

  return "Active";
}