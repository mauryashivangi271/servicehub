import AdminRecords,{date,short} from './AdminRecords';
import {list,unwrap} from '../../services/adminService';
import {supabase} from '../../lib/supabase';
async function load(...args){const result=await list(...args);const ids=result.data.map(r=>r.user_id);if(!ids.length)return result;const {data}=await unwrap(supabase.from('profiles').select('id,full_name').in('id',ids));const names=new Map(data.map(r=>[r.id,r.full_name]));return {...result,data:result.data.map(r=>({...r,name:names.get(r.user_id)}))};}
export default function AdminUsers(){return <AdminRecords title="User Management" table="user_roles" columns="user_id,role,created_at" load={load} filterKey="role" options={['customer','worker','admin']} fields={[["User ID",r=>short(r.user_id)],["Name",r=>r.name||'Profile unavailable'],["Role",r=>r.role],["Joined",r=>date(r.created_at)]]}/>;}
