import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteNotification,
  getSocketUrl,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../utils/notificationApi";

const SOCKET_SCRIPT_ID = "socket-io-client-runtime";

function loadSocketClient() {
  if (window.io) {
    return Promise.resolve(window.io);
  }

  const existingScript = document.getElementById(SOCKET_SCRIPT_ID);

  if (existingScript) {
    return new Promise((resolve, reject) => {
      existingScript.addEventListener("load", () => resolve(window.io), { once: true });
      existingScript.addEventListener("error", reject, { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = SOCKET_SCRIPT_ID;
    script.src = `${getSocketUrl()}/socket.io/socket.io.js`;
    script.async = true;
    script.onload = () => (window.io ? resolve(window.io) : reject(new Error("Socket client unavailable.")));
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function BellIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function NotificationBell({ enabled = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const menuRef = useRef(null);

  async function refreshNotifications() {
    if (!enabled) {
      return;
    }

    try {
      const data = await listNotifications({ page: 1, limit: 6 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError("");
    } catch (err) {
      setError(err.message || "Notifications unavailable.");
    }
  }

  useEffect(() => {
    refreshNotifications();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let socket;

    loadSocketClient()
      .then((io) => {
        socket = io(getSocketUrl(), {
          withCredentials: true,
          transports: ["websocket", "polling"],
        });
        socket.on("notification:new", (notification) => {
          setNotifications((current) => [notification, ...current].slice(0, 6));
          setUnreadCount((count) => count + 1);
        });
        socket.on("notification:read", () => refreshNotifications());
        socket.on("notification:delete", () => refreshNotifications());
      })
      .catch(() => {});

    return () => {
      socket?.disconnect();
    };
  }, [enabled]);

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", closeOnOutsideClick);
    }

    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [isOpen]);

  async function handleRead(id) {
    await markNotificationRead(id);
    refreshNotifications();
  }

  async function handleDelete(id) {
    await deleteNotification(id);
    refreshNotifications();
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    refreshNotifications();
  }

  if (!enabled) {
    return null;
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Open notifications"
        onClick={() => setIsOpen((current) => !current)}
        className="relative grid size-11 place-items-center rounded-full border border-[#d8e5d3] bg-[#f1f6f0] text-[#173a0b] transition hover:border-[#9cec6d] hover:bg-[#e5eedf]"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-lg border border-[#d8e5d3] bg-[#fbfcfa] p-3 shadow-[0_24px_60px_rgba(16,47,0,0.16)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-[#173a0b]">Notifications</p>
            <button type="button" onClick={handleReadAll} className="text-xs font-black text-[#46623d]">
              Mark all read
            </button>
          </div>

          {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}

          <div className="mt-3 grid gap-2">
            {notifications.length ? (
              notifications.map((notification) => (
                <article key={notification.id} className={`rounded-lg border p-3 ${notification.isRead ? "border-[#d8e5d3] bg-white" : "border-[#9cec6d] bg-[#efffe8]"}`}>
                  <p className="text-sm font-black text-[#173a0b]">{notification.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[#46623d]">{notification.message}</p>
                  <div className="mt-2 flex gap-2">
                    {!notification.isRead && (
                      <button type="button" onClick={() => handleRead(notification.id)} className="text-[11px] font-black text-[#173a0b]">
                        Read
                      </button>
                    )}
                    <button type="button" onClick={() => handleDelete(notification.id)} className="text-[11px] font-black text-red-700">
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg bg-[#f7faf6] p-3 text-sm font-bold text-[#46623d]">No notifications yet.</p>
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="mt-3 flex min-h-10 items-center justify-center rounded-full bg-[#173a0b] px-4 text-xs font-black text-white"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
