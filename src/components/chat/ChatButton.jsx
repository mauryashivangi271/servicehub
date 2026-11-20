import { useState, useRef } from "react";

import { MessageCircle } from "lucide-react";

import {
  startConversation,
} from "../../services/chatService";

import ChatWindow from "./ChatWindow";

export default function ChatButton({ booking }) {
  const [conversationId, setConversationId] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locked = useRef(false);

  if (!["accepted", "completed"].includes(booking.status)) {
    return null;
  }

  async function openChat() {
    if (locked.current) return;

    if (conversationId) {
      setOpen(true);
      return;
    }

    locked.current = true;
    setLoading(true);
    setError("");

    try {
      const id = await startConversation(booking.id);

      setConversationId(id);
      setOpen(true);
    } catch (err) {
      setError(err.message || "Unable to open chat.");
    } finally {
      locked.current = false;
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">

      {error && (
        <p className="text-red-600 text-sm">
          {error}
        </p>
      )}

      {!open ? (

        <button
          type="button"
          onClick={openChat}
          disabled={loading}
          className="flex items-center justify-center
          gap-2 w-full bg-blue-50 text-blue-700
          hover:bg-blue-100 rounded-xl p-4
          font-semibold disabled:opacity-50"
        >

          <MessageCircle size={20} />

          {loading ? "Opening Chat..." : "Open Chat"}

        </button>

      ) : (

        <ChatWindow
          conversationId={conversationId}
          title={
            booking.service_title_snapshot ||
            booking.worker_services?.title ||
            "Service Conversation"
          }
          onClose={() => setOpen(false)}
        />

      )}

    </div>
  );
}