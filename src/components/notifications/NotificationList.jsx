import {
  Bell,
  MessageCircle,
  Star,
  CalendarDays,
  CreditCard,
  ShieldAlert,
  CheckCheck,
} from "lucide-react";

const icons = {
  message: MessageCircle,
  review: Star,
  booking: CalendarDays,
  payment: CreditCard,
  complaint: ShieldAlert,
  dispute: ShieldAlert,
  general: Bell,
};

export default function NotificationList({
  notifications = [],
  loading = false,
  error = "",
  unreadCount = 0,
  busy = false,
  onRead,
  onReadAll,
}) {
  return (
    <div className="bg-white text-slate-900">

      <div className="flex items-center justify-between
      gap-3 border-b p-4">

        <div>
          <h2 className="font-bold text-lg">
            Notifications
          </h2>

          <p className="text-xs text-slate-500">
            {unreadCount} unread notifications
          </p>
        </div>

        <button
          type="button"
          onClick={onReadAll}
          disabled={busy || unreadCount === 0}
          className="flex items-center gap-1
          text-blue-600 text-xs font-medium
          disabled:opacity-50"
        >
          <CheckCheck size={16} />
          Mark all as read
        </button>

      </div>

      {error && (
        <p role="alert"
          className="p-3 text-sm bg-red-50 text-red-600">
          {error}
        </p>
      )}

      <div className="max-h-[420px] overflow-y-auto">

        {loading && (
          <p className="p-8 text-center text-slate-500">
            Loading notifications...
          </p>
        )}

        {!loading && notifications.length === 0 && !error && (
          <div className="text-center py-12 px-5">

            <Bell
              size={40}
              className="mx-auto text-slate-300"
            />

            <h3 className="font-semibold mt-4">
              No notifications yet
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Your notifications will appear here.
            </p>

          </div>
        )}

        {notifications.map((notification) => {
          const Icon = icons[notification.type] || Bell;

          return (
            <button
              type="button"
              key={notification.id}
              disabled={busy}
              onClick={() => onRead(notification)}
              className={`flex items-start text-left
              gap-3 p-4 w-full border-b
              transition-colors ${
                notification.is_read
                  ? "bg-white hover:bg-slate-50"
                  : "bg-blue-50 hover:bg-blue-100"
              }`}
            >

              <div className="bg-blue-100 text-blue-600
              rounded-full p-3 shrink-0">

                <Icon size={20} />

              </div>

              <div className="min-w-0 flex-1">

                <h3 className="font-semibold text-sm">
                  {notification.title}
                </h3>

                <p className="mt-1 text-sm text-slate-600
                break-words whitespace-pre-wrap">
                  {notification.message}
                </p>

                <p className="text-xs text-slate-400 mt-2">

                  {new Date(
                    notification.created_at
                  ).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                </p>

              </div>

              {!notification.is_read && (
                <span className="h-2.5 w-2.5
                rounded-full bg-blue-600 shrink-0 mt-2" />
              )}

            </button>
          );
        })}

      </div>

      {notifications.length > 0 && (
        <div className="p-3 text-center text-xs text-slate-500">
          Showing latest {notifications.length} notifications
        </div>
      )}

    </div>
  );
}