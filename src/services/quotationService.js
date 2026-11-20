import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getQuotations(bookingId) {
  return unwrap(
    await supabase
      .from("quotations")
      .select(`
        *,
        quotation_items (*),
        negotiation_messages (*),
        price_approvals (*)
      `)
      .eq("booking_id", bookingId)
      .order("revision_number", {
        ascending: false,
      })
  );
}

export async function createQuotation({
  bookingId,
  items,
  discount = 0,
  notes = "",
}) {
  return unwrap(
    await supabase.rpc("create_quotation", {
      p_booking_id: bookingId,
      p_items: items,
      p_discount: discount,
      p_notes: notes,
    })
  );
}

export async function respondToQuotation(
  quotationId,
  action,
  message = ""
) {
  return unwrap(
    await supabase.rpc("respond_to_quotation", {
      p_quotation_id: quotationId,
      p_action: action,
      p_message: message,
    })
  );
}

export async function approveQuotation(quotationId) {
  return respondToQuotation(
    quotationId,
    "approve"
  );
}

export async function rejectQuotation(
  quotationId,
  message = ""
) {
  return respondToQuotation(
    quotationId,
    "reject",
    message
  );
}

export async function requestRevision(
  quotationId,
  message
) {
  return respondToQuotation(
    quotationId,
    "request_revision",
    message
  );
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount) || 0);
}