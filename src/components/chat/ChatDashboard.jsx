import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

import {
  MessageCircle,
  Plus,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getConversations,
  startConversation,
} from "../../services/chatService";

import {
  getCustomerBookings,
  getWorkerBookings,
} from "../../services/bookingService";

import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

export default function ChatDashboard() {
  const { user, role } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);

  const [bookingId, setBookingId] = useState("");
  const [showNew, setShowNew] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const locked = useRef(false);

  const load = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const [conversationData, bookingData] =
        await Promise.all([
          getConversations(),
          role === "worker"
            ? getWorkerBookings(user.id)
            : getCustomerBookings(user.id),
        ]);

      const allBookings = bookingData || [];

      const items = (conversationData || []).map((item) => {
        const booking = allBookings.find(
          (entry) => entry.id === item.booking_id
        );

        return {
          ...item,
          title:
            booking?.service_title_snapshot ||
            booking?.worker_services?.title ||
            "Service Conversation",
        };
      });

      setConversations(items);

      setBookings(
        allBookings.filter((booking) =>
          ["accepted", "completed"].includes(booking.status)
        )
      );

      setError("");

      return items;
    } catch (err) {
      setError(err.message || "Unable to load conversations.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [user?.id, role]);

  useEffect(() => {
    load();

    const timer = setInterval(load, 15000);

    return () => clearInterval(timer);
  }, [load]);

  async function createConversation() {
    if (!bookingId || locked.current) return;

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      const id = await startConversation(bookingId);

      const updated = await load();

      const conversation = updated.find(
        (item) => item.id === id
      );

      if (conversation) {
        setSelected(conversation);
      }

      setShowNew(false);
      setBookingId("");
    } catch (err) {
      setError(err.message || "Unable to start conversation.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">

      <div className="flex flex-wrap items-center
      justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold">
            Messages
          </h1>

          <p className="text-slate-500 mt-1">
            Communicate about your service bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2
          bg-blue-600 hover:bg-blue-700 text-white
          px-4 py-3 rounded-xl font-medium"
        >
          <Plus size={20} />
          New Conversation
        </button>

      </div>

      {error && (
        <div className="bg-red-50 text-red-600
        p-4 rounded-xl">
          {error}
        </div>
      )}

      {showNew && (

        <div className="bg-white border rounded-2xl
        p-5 space-y-4">

          <h3 className="font-semibold">
            Select a service booking
          </h3>

          <select
            value={bookingId}
            onChange={(event) =>
              setBookingId(event.target.value)
            }
            className="w-full border rounded-xl p-3"
          >

            <option value="">
              Choose booking
            </option>

            {bookings.map((booking) => (

              <option
                key={booking.id}
                value={booking.id}
              >
                {booking.service_title_snapshot ||
                  booking.worker_services?.title ||
                  "Service Booking"}

                {" - #" + booking.id.slice(0, 8)}
              </option>

            ))}

          </select>

          {bookings.length === 0 && (
            <p className="text-sm text-slate-500">
              An accepted or completed booking is required.
            </p>
          )}

          <button
            type="button"
            onClick={createConversation}
            disabled={!bookingId || busy}
            className="bg-blue-600 text-white px-5
            py-3 rounded-xl disabled:opacity-50"
          >
            {busy ? "Opening..." : "Start Chat"}
          </button>

        </div>

      )}

      {loading ? (

        <div className="bg-white border rounded-xl
        p-10 text-center text-slate-500">
          Loading conversations...
        </div>

      ) : (

        <div className="grid grid-cols-1
        lg:grid-cols-[320px_minmax(0,1fr)] gap-5">

          <ConversationList
            conversations={conversations}
            selected={selected}
            onSelect={setSelected}
            onRefresh={load}
          />

          {selected ? (

            <ChatWindow
              key={selected.id}
              conversationId={selected.id}
              title={selected.title}
              onClose={() => setSelected(null)}
            />

          ) : (

            <div className="h-[580px] border rounded-2xl
            bg-white flex flex-col items-center
            justify-center text-center p-6">

              <div className="bg-blue-50 rounded-full
              p-6 text-blue-600">

                <MessageCircle size={45} />

              </div>

              <h2 className="text-xl font-bold mt-5">
                Your Conversations
              </h2>

              <p className="text-slate-500 mt-2">
                Select a conversation or start a new chat.
              </p>

            </div>

          )}

        </div>

      )}

    </div>
  );
}