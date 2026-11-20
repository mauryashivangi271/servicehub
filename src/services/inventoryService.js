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

export async function getInventory(businessId) {
  return unwrap(
    await supabase
      .from("inventory_items")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
  );
}

export async function getEmployees(businessId) {
  return unwrap(
    await supabase
      .from("business_employees")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true)
      .order("full_name")
  );
}

export async function getStockHistory(businessId) {
  return unwrap(
    await supabase
      .from("inventory_movements")
      .select("*, inventory_items!inner(name, sku, business_id)")
      .eq("inventory_items.business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(100)
  );
}

export async function getAssignments(businessId) {
  return unwrap(
    await supabase
      .from("inventory_assignments")
      .select(`
        *,
        inventory_items!inner(name, sku, business_id),
        business_employees(full_name)
      `)
      .eq("inventory_items.business_id", businessId)
      .order("assigned_at", { ascending: false })
  );
}

export async function saveInventoryItem(businessId, item) {
  return unwrap(
    await supabase.rpc("save_inventory_item", {
      p_business_id: businessId,
      p_item_id: item.id || null,
      p_name: item.name.trim(),
      p_sku: item.sku.trim(),
      p_category: item.category,
      p_unit: item.unit.trim(),
      p_minimum_stock: Number(item.minimum_stock),
      p_unit_price: Number(item.unit_price),
      p_description: item.description || "",
    })
  );
}

export async function updateStock(itemId, type, quantity, notes) {
  return unwrap(
    await supabase.rpc("update_inventory_stock", {
      p_item_id: itemId,
      p_movement_type: type,
      p_quantity: Number(quantity),
      p_notes: notes || "",
    })
  );
}

export async function assignTool(
  itemId,
  employeeId,
  quantity,
  notes
) {
  return unwrap(
    await supabase.rpc("assign_inventory_tool", {
      p_item_id: itemId,
      p_employee_id: employeeId,
      p_quantity: Number(quantity),
      p_notes: notes || "",
    })
  );
}

export async function returnTool(assignmentId) {
  return unwrap(
    await supabase.rpc("return_inventory_tool", {
      p_assignment_id: assignmentId,
    })
  );
}

export async function setInventoryStatus(itemId, active) {
  return unwrap(
    await supabase.rpc("set_inventory_status", {
      p_item_id: itemId,
      p_is_active: active,
    })
  );
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number(amount || 0));
}

export function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
}