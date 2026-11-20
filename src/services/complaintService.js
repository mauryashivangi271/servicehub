import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export const complaintCategories = [
  { value: "service_quality", label: "Service Quality" },
  { value: "payment", label: "Payment Issue" },
  { value: "behaviour", label: "Behaviour Issue" },
  { value: "delay", label: "Service Delay" },
  { value: "incomplete_service", label: "Incomplete Service" },
  { value: "other", label: "Other Issue" },
];

export async function submitComplaint({
  bookingId,
  category,
  subject,
  description,
}) {
  return unwrap(
    await supabase.rpc("submit_complaint", {
      p_booking_id: bookingId,
      p_category: category,
      p_subject: subject.trim(),
      p_description: description.trim(),
    })
  );
}

export async function getMyComplaints(userId) {
  return unwrap(
    await supabase
      .from("complaints")
      .select("*")
      .eq("raised_by", userId)
      .order("created_at", { ascending: false })
  );
}

export async function getBookingComplaints(bookingId, userId) {
  return unwrap(
    await supabase
      .from("complaints")
      .select("*")
      .eq("booking_id", bookingId)
      .eq("raised_by", userId)
      .order("created_at", { ascending: false })
  );
}

export async function getAllComplaints() {
  return unwrap(
    await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false })
  );
}

export async function manageComplaint(
  complaintId,
  action,
  response = ""
) {
  return unwrap(
    await supabase.rpc("manage_complaint", {
      p_complaint_id: complaintId,
      p_action: action,
      p_response: response.trim(),
    })
  );
}

export function formatDate(value) {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatStatus(value) {
  return (value || "unknown").replaceAll("_", " ");
}