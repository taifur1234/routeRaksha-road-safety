import { useEffect, useState } from "react";
import {
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../utils/notificationApi";

const notificationTypes = [
  "REPORT_APPROVED",
  "REPORT_REJECTED",
  "ACHIEVEMENT",
  "ADMIN",
  "SAFETY_ALERT",
  "SYSTEM",
];

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [read, setRead] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadNotifications() {
    setIsLoading(true);

    try {
      const data = await listNotifications({ page, type, read, search });
      setNotifications(data.notifications || []);
      setPagination(data.pagination || null);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [page, type, read, search]);

  async function handleRead(id) {
    await markNotificationRead(id);
    loadNotifications();
  }

  async function handleReadAll() {
    await markAllNotificationsRead();
    loadNotifications();
  }

  async function handleDelete(id) {
    await deleteNotification(id);
    loadNotifications();
  }

  return (
    <main className="motion-page min-h-[calc(100vh-4.75rem)] bg-[#fbfcfa] px-4 py-10 text-[#173a0b] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#46623d]">Inbox</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight">Notifications</h1>
          </div>
          <button onClick={handleReadAll} className="min-h-11 rounded-full bg-[#173a0b] px-5 text-sm font-black text-white">
            Mark all as read
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search notifications"
            className="min-h-11 rounded-full border border-[#cddcc7] bg-white px-4 text-sm font-bold outline-none focus:border-[#173a0b]"
          />
          <select
            value={type}
            onChange={(event) => {
              setPage(1);
              setType(event.target.value);
            }}
            className="min-h-11 rounded-full border border-[#cddcc7] bg-white px-4 text-sm font-bold outline-none focus:border-[#173a0b]"
          >
            <option value="">All types</option>
            {notificationTypes.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={read}
            onChange={(event) => {
              setPage(1);
              setRead(event.target.value);
            }}
            className="min-h-11 rounded-full border border-[#cddcc7] bg-white px-4 text-sm font-bold outline-none focus:border-[#173a0b]"
          >
            <option value="">All statuses</option>
            <option value="false">Unread</option>
            <option value="true">Read</option>
          </select>
        </div>

        {error && <p className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}

        <div className="mt-8 grid gap-3">
          {!isLoading &&
            notifications.map((notification) => (
                <article key={notification.id} className={`rounded-lg border p-5 ${notification.isRead ? "border-[#d8e5d3] bg-white" : "border-[#9cec6d] bg-[#efffe8]"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-[#f1f6f0] px-3 py-1 text-[11px] font-black text-[#46623d]">
                        {notification.type.replaceAll("_", " ")}
                      </span>
                      <h2 className="mt-3 text-lg font-black text-[#173a0b]">{notification.title}</h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#46623d]">{notification.message}</p>
                      <p className="mt-2 text-xs font-bold text-[#78936d]">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <button onClick={() => handleRead(notification.id)} className="rounded-full border border-[#d8e5d3] bg-white px-3 py-2 text-xs font-black">
                          Read
                        </button>
                      )}
                      <button onClick={() => handleDelete(notification.id)} className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
          {!isLoading && !notifications.length && (
            <p className="rounded-lg border border-[#d8e5d3] bg-white p-6 text-center text-sm font-bold text-[#46623d]">
              No notifications found.
            </p>
          )}
        </div>

        {pagination?.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-full border border-[#d8e5d3] bg-white px-4 py-2 text-sm font-black disabled:opacity-50">
              Previous
            </button>
            <span className="text-sm font-black text-[#46623d]">Page {pagination.page} of {pagination.pages}</span>
            <button disabled={page >= pagination.pages} onClick={() => setPage((value) => value + 1)} className="rounded-full border border-[#d8e5d3] bg-white px-4 py-2 text-sm font-black disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default NotificationsPage;
