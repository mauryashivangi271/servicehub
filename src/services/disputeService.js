import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getMyDisputes(userId) {
  const complaints = unwrap(
    await supabase
      .from("complaints")
      .select("id")
      .eq("raised_by", userId)
  );

  const complaintIds = (complaints || []).map(
    (complaint) => complaint.id
  );

  if (complaintIds.length === 0) return [];

  return unwrap(
    await supabase
      .from("disputes")
      .select("*")
      .in("complaint_id", complaintIds)
      .order("created_at", { ascending: false })
  );
}

export async function getAllDisputes() {
  return unwrap(
    await supabase
      .from("disputes")
      .select("*")
      .order("created_at", { ascending: false })
  );
}

export async function manageDispute(
  disputeId,
  action,
  resolution = ""
) {
  return unwrap(
    await supabase.rpc("manage_dispute", {
      p_dispute_id: disputeId,
      p_action: action,
      p_resolution: resolution.trim(),
    })
  );
}