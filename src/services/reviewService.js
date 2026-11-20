import { supabase } from "../lib/supabase";

export async function submitReview(bookingId, rating, comment) {
  const { data, error } = await supabase.rpc("submit_review", {
    p_booking_id: bookingId,
    p_rating: rating,
    p_comment: comment,
  });

  if (error) throw error;
  return data;
}

export async function getBookingReview(bookingId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getCustomerReviews(userId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProviderReviews(userId) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProviderRating(providerId) {
  const { data, error } = await supabase
    .rpc("get_provider_rating", {
      p_provider_id: providerId,
    })
    .single();

  if (error) throw error;
  return data;
}