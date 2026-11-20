import { useState } from "react";

import {
  MessageCircle,
  Search,
  RefreshCw,
} from "lucide-react";

export default function ConversationList({
  conversations = [],
  selected,
  onSelect,
  onRefresh,
}) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((item) =>
    `${item.title} ${item.booking_id}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border rounded-2xl
    overflow-hidden flex flex-col h-[580px]">

      <div className="p-4 border-b">

        <div className="flex justify-between items-center">

          <h2 className="text-xl font-bold">
            Messages
          </h2>

          <button
            type="button"
            onClick={onRefresh}
            aria-label="Refresh conversations"
            className="text-blue-600 p-2"
          >
            <RefreshCw size={18} />
          </button>

        </div>

        <div className="flex items-center gap-2
        border rounded-xl px-3 py-2 mt-4">

          <Search
            size={18}
            className="text-slate-400"
          />

          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full outline-none text-sm"
          />

        </div>

      </div>

      <div className="flex-1 overflow-y-auto">

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-500">

            <MessageCircle
              size={35}
              className="mx-auto mb-3 text-slate-300"
            />

            No conversations found.

          </div>
        )}

        {filtered.map((item) => (

          <button
            type="button"
            key={item.id}
            onClick={() => onSelect(item)}
            className={`w-full text-left p-4 border-b
            flex items-center gap-3 ${
              selected?.id === item.id
                ? "bg-blue-50"
                : "hover:bg-slate-50"
            }`}
          >

            <div className="bg-blue-100 rounded-full
            p-3 text-blue-600 shrink-0">

              <MessageCircle size={22} />

            </div>

            <div className="min-w-0">

              <h3 className="font-semibold truncate">
                {item.title}
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                Booking #{item.booking_id.slice(0, 8)}
              </p>

            </div>

          </button>

        ))}

      </div>

    </div>
  );
}