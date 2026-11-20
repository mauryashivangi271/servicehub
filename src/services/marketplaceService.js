import { supabase } from "../lib/supabase";

export async function getPublicServices() {
  const { data, error } = await supabase.rpc(
    "get_public_services"
  );

  if (error) throw error;

  return data || [];
}

export async function getPublicCategories() {
  const { data, error } = await supabase
    .from("service_categories")
    .select("id, name, description")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;

  return data || [];
}