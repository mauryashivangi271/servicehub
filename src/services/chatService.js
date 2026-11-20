import { supabase } from "../lib/supabase";

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getConversations() {
  return unwrap(
    await supabase
      .from("conversations")
      .select("*")
      .order("created_at", { ascending: false })
  );
}

export async function startConversation(bookingId) {
  return unwrap(
    await supabase.rpc("start_conversation", {
      p_booking_id: bookingId,
    })
  );
}

export async function getMessages(conversationId) {
  return unwrap(
    await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(100)
  ).reverse();
}

export async function sendMessage(conversationId, message) {
  return unwrap(
    await supabase.rpc("send_message", {
      p_conversation_id: conversationId,
      p_message: message.trim(),
    })
  );
}

export function subscribeToMessages(conversationId, callback) {
  const channel = supabase
    .channel(`chat-${conversationId}-${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}