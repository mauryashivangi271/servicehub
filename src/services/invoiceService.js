import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getBookingInvoice(bookingId) {
  return unwrap(
    await supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("booking_id", bookingId)
      .maybeSingle()
  );
}

export async function getCustomerInvoices(userId) {
  return unwrap(
    await supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("customer_id", userId)
      .order("issued_at", { ascending: false })
  );
}

export async function getProviderInvoices(userId) {
  return unwrap(
    await supabase
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("provider_id", userId)
      .order("issued_at", { ascending: false })
  );
}

export function formatCurrency(paise) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(paise) / 100);
}

export function formatDate(date) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
}