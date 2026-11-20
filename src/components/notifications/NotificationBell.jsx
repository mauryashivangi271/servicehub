import {
  useState,
  useEffect,
  useRef,
} from "react";

import { Bell } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
} from "../../services/notificationService";

import NotificationList from "./NotificationList";

export default function NotificationBell() {
  const { user } = useAuth();

  const userId = user?.id;

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const wrapperRef = useRef(null);
  const refreshRef = useRef(null);
  const locked = useRef(false);

  // Load and subscribe to notifications

  useEffect(() => {
    let active = true;
    let requestNumber = 0;

    setNotifications([]);
    setUnreadCount(0);
    setLoading(true);
    setError("");
    setOpen(false);

    if (!userId) {
      setLoading(false);
      return;
    }

    async function load() {
      const currentRequest = ++requestNumber;

      try {
        const [data, count] = await Promise.all([
          getNotifications(userId),
          getUnreadCount(userId),
        ]);

        if (!active || currentRequest !== requestNumber) {
          return;
        }

        setNotifications(data || []);
        setUnreadCount(count);
        setError("");

      } catch (err) {
        if (active && currentRequest === requestNumber) {
          setError(
            err.message || "Unable to load notifications."
          );
        }
      } finally {
        if (active && currentRequest === requestNumber) {
          setLoading(false);
        }
      }
    }

    refreshRef.current = load;

    const unsubscribe = subscribeToNotifications(
      userId,
      load
    );

    load();

    const timer = setInterval(load, 15000);

    return () => {
      active = false;
      refreshRef.current = null;
      clearInterval(timer);
      unsubscribe();
    };
  }, [userId]);

  // Close dropdown on outside click or Escape

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  async function handleRead(notification) {
    if (notification.is_read || locked.current) {
      return;
    }

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await markNotificationRead(notification.id);

      await refreshRef.current?.();

    } catch (err) {
      setError(
        err.message || "Unable to update notification."
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  async function handleReadAll() {
    if (locked.current || unreadCount === 0) return;

    locked.current = true;
    setBusy(true);
    setError("");

    try {
      await markAllNotificationsRead();

      await refreshRef.current?.();

    } catch (err) {
      setError(
        err.message || "Unable to update notifications."
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  if (!userId) return null;

  return (
    <div ref={wrapperRef} className="relative">

      <button
        type="button"
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
        onClick={() => {
          if (!open) refreshRef.current?.();
          setOpen((previous) => !previous);
        }}
        className="relative rounded-xl p-3
        bg-slate-100 hover:bg-slate-200
        text-slate-700 transition-colors"
      >

        <Bell size={23} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1
          min-w-5 h-5 px-1 bg-red-500 text-white
          text-[10px] font-bold rounded-full
          flex items-center justify-center">

            {unreadCount > 99 ? "99+" : unreadCount}

          </span>
        )}

      </button>

      {open && (
        <div className="fixed top-20 left-3 right-3
        sm:absolute sm:top-full sm:left-auto
        sm:right-0 sm:mt-3 sm:w-[390px]
        z-50 bg-white rounded-2xl
        border shadow-xl overflow-hidden">

          <NotificationList
            notifications={notifications}
            loading={loading}
            error={error}
            unreadCount={unreadCount}
            busy={busy}
            onRead={handleRead}
            onReadAll={handleReadAll}
          />

        </div>
      )}

    </div>
  );
}