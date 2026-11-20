import { useState, useRef } from "react";
import { Send } from "lucide-react";

import { sendMessage } from "../../services/chatService";

export default function MessageInput({
  conversationId,
  onSent,
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const locked = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const text = message.trim();

    if (!text || locked.current) return;

    locked.current = true;
    setSending(true);
    setError("");

    try {
      await sendMessage(conversationId, text);

      setMessage("");

      onSent?.();
    } catch (err) {
      setError(err.message || "Unable to send message.");
    } finally {
      locked.current = false;
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t bg-white p-4"
    >
      {error && (
        <p className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">

        <input
          type="text"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="Type your message..."
          aria-label="Type your message"
          maxLength={2000}
          disabled={sending}
          className="min-w-0 flex-1 border rounded-xl
          px-4 py-3 outline-none focus:ring-2
          focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={!message.trim() || sending}
          aria-label="Send message"
          className="bg-blue-600 hover:bg-blue-700
          text-white rounded-xl p-3
          disabled:opacity-50"
        >
          <Send size={20} />
        </button>

      </div>

      <p className="mt-2 text-xs text-slate-400">
        {message.length}/2000
      </p>
    </form>
  );
}