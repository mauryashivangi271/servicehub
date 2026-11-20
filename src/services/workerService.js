import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getActiveCategories() {
  return unwrap(
    await supabase
      .from("service_categories")
      .select("*")
      .eq("is_active", true)
      .order("name")
  );
}

export async function getWorkerServices(userId) {
  return unwrap(
    await supabase
      .from("worker_services")
      .select("*, service_categories(name, is_active)")
      .eq("worker_id", userId)
      .order("created_at", { ascending: false })
  );
}

export async function createService(payload) {
  return unwrap(
    await supabase
      .from("worker_services")
      .insert(payload)
      .select()
      .single()
  );
}

export async function updateService(id, payload) {
  return unwrap(
    await supabase
      .from("worker_services")
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()
  );
}

export async function toggleService(id, status) {
  return updateService(id, {
    is_active: status,
  });
}