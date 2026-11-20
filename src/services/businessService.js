import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getBusiness(userId) {
  return unwrap(
    await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", userId)
      .maybeSingle()
  );
}

export async function saveBusiness(payload) {
  return unwrap(
    await supabase
      .from("businesses")
      .upsert(payload, { onConflict: "owner_id" })
      .select()
      .single()
  );
}

export async function getEmployees(businessId) {
  return unwrap(
    await supabase
      .from("business_employees")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
  );
}

export async function addEmployee(payload) {
  return unwrap(
    await supabase
      .from("business_employees")
      .insert(payload)
      .select()
      .single()
  );
}

export async function updateEmployee(id, payload) {
  return unwrap(
    await supabase
      .from("business_employees")
      .update(payload)
      .eq("id", id)
      .select()
      .single()
  );
}

export async function changeEmployeeStatus(id, status) {
  return updateEmployee(id, {
    is_active: status,
  });
}