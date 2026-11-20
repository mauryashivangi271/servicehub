import { supabase } from "../lib/supabase";
function unwrap({data,error}) {if(error) throw error; return data;}
export async function getFavorites(userId){return unwrap(await supabase.from("customer_favorites").select("service_id").eq("customer_id",userId)) || [];}
export async function setFavorite(userId,serviceId,saved){const table=supabase.from("customer_favorites"); return unwrap(await (saved ? table.insert({customer_id:userId,service_id:serviceId}) : table.delete().eq("customer_id",userId).eq("service_id",serviceId)));}
