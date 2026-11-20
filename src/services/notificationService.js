import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getNotifications(userId) {
  return unwrap(
    await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
  );
}

export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;

  return count || 0;
}

export async function markNotificationRead(id) {
  return unwrap(
    await supabase.rpc("mark_notification_read", {
      p_notification_id: id,
    })
  );
}

export async function markAllNotificationsRead() {
  return unwrap(
    await supabase.rpc("mark_all_notifications_read")
  );
}

export function subscribeToNotifications(userId, callback) {
  const channel = supabase
    .channel(`notifications-${userId}-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}