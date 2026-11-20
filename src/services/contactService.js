import {supabase} from "../lib/supabase";
function unwrap({data,error}){if(error)throw error;return data;}
export async function submitEnquiry(form){return unwrap(await supabase.rpc("submit_contact_enquiry",form));}
export async function getEnquiries(){return unwrap(await supabase.from("contact_enquiries").select("*").order("created_at",{ascending:false}).limit(100));}
export async function manageEnquiry(id,status,response){return unwrap(await supabase.rpc("manage_contact_enquiry",{p_id:id,p_status:status,p_admin_response:response}));}
