import { useEffect, useState, useRef } from "react";

import { MessageCircle, X } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getMessages,
  subscribeToMessages,
} from "../../services/chatService";

import MessageInput from "./MessageInput";

export default function ChatWindow({
  conversationId,
  title = "Service Conversation",
  onClose,
}) {
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);
  const refreshRef = useRef(null);

  useEffect(() => {
    let active = true;
    let requestNumber = 0;

    setMessages([]);
    setLoading(true);
    setError("");

    async function load() {
      const currentRequest = ++requestNumber;

      try {
        const data = await getMessages(conversationId);

        if (!active || currentRequest !== requestNumber) {
          return;
        }

        setMessages(data || []);
        setError("");
      } catch (err) {
        if (active && currentRequest === requestNumber) {
          setError(err.message || "Unable to load messages.");
        }
      } finally {
        if (active && currentRequest === requestNumber) {
          setLoading(false);
        }
      }
    }

    refreshRef.current = load;

    const unsubscribe = subscribeToMessages(
      conversationId,
      load
    );

    load();

    const timer = setInterval(load, 10000);

    return () => {
      active = false;
      refreshRef.current = null;
      unsubscribe();
      clearInterval(timer);
    };
  }, [conversationId]);

  const lastMessageId = messages.at(-1)?.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [lastMessageId]);

  return (
    <div className="flex flex-col h-[580px]
    bg-white border rounded-2xl overflow-hidden">

      {/* Chat Header */}

      <div className="flex items-center justify-between
      bg-blue-600 text-white p-4">

        <div className="flex items-center gap-3">

          <div className="bg-white/20 p-3 rounded-full">
            <MessageCircle size={22} />
          </div>

          <div>
            <h3 className="font-semibold">
              {title}
            </h3>

            <p className="text-xs text-blue-100">
              Private booking conversation
            </p>
          </div>

        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X size={22} />
          </button>
        )}

      </div>

      {/* Messages */}

      <div className="flex-1 min-h-0 overflow-y-auto
      p-5 bg-slate-50 space-y-4">

        {loading && (
          <p className="text-center text-slate-500">
            Loading messages...
          </p>
        )}

        {error && (
          <p className="text-red-600 text-center">
            {error}
          </p>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="text-center py-16">

            <MessageCircle
              size={45}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-4 font-semibold">
              Start a conversation
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Send your first message.
            </p>

          </div>
        )}

        {messages.map((message) => {
          const own = message.sender_id === user?.id;

          return (
            <div
              key={message.id}
              className={`flex ${
                own ? "justify-end" : "justify-start"
              }`}
            >

              <div
                className={`max-w-[80%] px-4 py-3
                rounded-2xl ${
                  own
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white border rounded-bl-sm"
                }`}
              >

                <p className="text-sm whitespace-pre-wrap
                break-words">
                  {message.message}
                </p>

                <p
                  className={`text-xs text-right mt-2 ${
                    own
                      ? "text-blue-100"
                      : "text-slate-400"
                  }`}
                >
                  {new Date(
                    message.created_at
                  ).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>

              </div>

            </div>
          );
        })}

        <div ref={bottomRef} />

      </div>

      <MessageInput
        key={conversationId}
        conversationId={conversationId}
        onSent={() => refreshRef.current?.()}
      />

    </div>
  );
}