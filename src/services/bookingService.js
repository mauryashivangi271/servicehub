import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getCustomerBookings(userId) {
  return unwrap(
    await supabase
      .from("bookings")
      .select(`
        *,
        worker_services (
          title,
          price,
          pricing_type,
          duration_minutes
        )
      `)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })
  );
}

export async function getWorkerBookings(userId) {
  return unwrap(
    await supabase
      .from("bookings")
      .select(`
        *,
        worker_services!inner (
          title,
          price,
          worker_id,
          pricing_type,
          duration_minutes
        )
      `)
      .eq("worker_services.worker_id", userId)
      .order("created_at", { ascending: false })
  );
}

export async function getBookingHistory(bookingId) {
  return unwrap(
    await supabase
      .from("booking_status_history")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true })
  );
}

export async function updateBookingStatus(
  bookingId,
  status
) {
  if (
    status === "accepted" ||
    status === "cancelled" ||
    status === "rejected"
  ) {
    return unwrap(
      await supabase.rpc("manage_booking_request", {
        p_booking_id: bookingId,
        p_action:
          status === "accepted" ? "accept" : "cancel",
      })
    );
  }

  return unwrap(
    await supabase.rpc("advance_booking_execution", {
      p_booking_id: bookingId,
      p_stage: status,
    })
  );
}

export async function assignBookingEmployee(
  bookingId,
  employeeId
) {
  return unwrap(
    await supabase.rpc("assign_booking_employee", {
      p_booking_id: bookingId,
      p_employee_id: employeeId,
    })
  );
}

export async function cancelBooking(bookingId) {
  return updateBookingStatus(
    bookingId,
    "cancelled"
  );
}

export function getDisplayStatus(booking) {
  if (
    booking.status === "accepted" &&
    booking.execution_stage &&
    booking.execution_stage !== "not_started"
  ) {
    return booking.execution_stage;
  }

  return booking.status;
}