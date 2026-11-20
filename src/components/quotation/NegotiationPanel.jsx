import { MessageSquare } from "lucide-react";

export default function NegotiationPanel({
  quotation,
  userId,
}) {
  const messages = [
    ...(quotation.negotiation_messages || []),
  ].sort(
    (a, b) =>
      new Date(a.created_at) - new Date(b.created_at)
  );

  return (
    <section className="bg-slate-50 border rounded-xl p-4 space-y-4">

      <div className="flex items-center gap-2">

        <MessageSquare
          size={20}
          className="text-blue-600"
        />

        <h3 className="font-bold">
          Price Discussion
        </h3>

      </div>

      {messages.length === 0 ? (
        <p className="text-slate-500 text-sm">
          No negotiation messages yet.
        </p>
      ) : (
        <div className="space-y-3 max-h-72 overflow-y-auto">

          {messages.map(message => {
            const ownMessage =
              message.sender_id === userId;

            return (
              <div
                key={message.id}
                className={`flex ${
                  ownMessage
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div className={`max-w-[85%] rounded-xl p-3 ${
                  ownMessage
                    ? "bg-blue-600 text-white"
                    : "bg-white border text-slate-700"
                }`}>

                  <p className="text-xs font-bold mb-1">
                    {ownMessage
                      ? "You"
                      : message.sender_id === quotation.customer_id
                        ? "Customer"
                        : "Service Provider"}
                  </p>

                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.message}
                  </p>

                  <p className="text-xs opacity-70 mt-2">
                    {new Date(message.created_at).toLocaleString(
                      "en-IN",
                      { timeZone: "Asia/Kolkata" }
                    )}
                  </p>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </section>
  );
}
