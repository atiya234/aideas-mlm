
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ShieldCheck,
  TrendingUp,
  Inbox,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { refreshAccessToken } from "../utils/refreshToken";

const API_URL = "http://127.0.0.1:8001/api/notifications/";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [updatingAll, setUpdatingAll] = useState(false);

  // Send authenticated request to Django.
  const fetchWithAuth = async (url, options = {}) => {
    let token = sessionStorage.getItem("access");

    if (!token) {
      throw new Error("Please login to view notifications.");
    }

    const makeRequest = (accessToken) =>
      fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });

    let response = await makeRequest(token);

    if (response.status === 401) {
      token = await refreshAccessToken();

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      response = await makeRequest(token);
    }

    if (!response.ok) {
      let message = `Request failed (${response.status})`;

      try {
        const data = await response.json();
        message = data.detail || data.error || message;
      } catch {
        // Keep the default error message.
      }

      throw new Error(message);
    }

    return response.json();
  };

  // Fetch notifications from Django.
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchWithAuth(API_URL);

      const notificationList = Array.isArray(data)
        ? data
        : data.results ?? [];

      setNotifications(notificationList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Mark one notification as read.
  const markAsRead = async (id) => {
    try {
      setUpdatingId(id);
      setError("");
      setSuccess("");

      await fetchWithAuth(`${API_URL}${id}/read/`, {
        method: "PATCH",
      });

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // Mark all notifications as read.
  const markAllAsRead = async () => {
    try {
      setUpdatingAll(true);
      setError("");
      setSuccess("");

      await fetchWithAuth(`${API_URL}read-all/`, {
        method: "PATCH",
      });

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );

      setSuccess("All notifications marked as read.");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingAll(false);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const readCount = notifications.length - unreadCount;

  // Select icon using the notification title.
  const getNotificationIcon = (notification) => {
    const title = (notification.title || "").toLowerCase();

    if (title.includes("kyc")) {
      return <ShieldCheck size={22} />;
    }

    if (title.includes("investment") || title.includes("roi")) {
      return <TrendingUp size={22} />;
    }

    return <Bell size={22} />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">

        {/* Page Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              <Bell className="shrink-0 text-indigo-600" size={28} />
              Notifications
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Stay updated with your account activity and important alerts.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:w-auto"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || updatingAll || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <CheckCheck size={18} />
              {updatingAll ? "Updating..." : "Mark All as Read"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            role="status"
            className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">

          {/* Total Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Bell size={22} />
            </div>

            <p className="text-sm text-slate-500">
              Total Notifications
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {notifications.length}
            </h2>
          </div>

          {/* Unread Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Inbox size={22} />
            </div>

            <p className="text-sm text-slate-500">
              Unread Notifications
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {unreadCount}
            </h2>
          </div>

          {/* Read Notifications */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCheck size={22} />
            </div>

            <p className="text-sm text-slate-500">
              Read Notifications
            </p>

            <h2 className="mt-1 text-3xl font-bold text-slate-900">
              {readCount}
            </h2>
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* List Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-5 sm:px-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                Recent Notifications
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Your latest account updates
              </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              {unreadCount} Unread
            </span>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16">
              <RefreshCw
                size={28}
                className="animate-spin text-indigo-600"
              />

              <p className="text-sm text-slate-500">
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (

            /* Empty State */
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-5 text-slate-400">
                <Bell size={30} />
              </div>

              <h3 className="font-semibold text-slate-800">
                No notifications yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Your notifications will appear here when there are new account updates.
              </p>
            </div>

          ) : (

            /* Notification Items */
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex flex-col gap-4 p-4 transition sm:flex-row sm:items-start sm:justify-between sm:p-6 ${
                    notification.is_read
                      ? "bg-white"
                      : "bg-indigo-50/50"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                    {/* Icon */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
                        notification.is_read
                          ? "bg-slate-100 text-slate-500"
                          : "bg-indigo-100 text-indigo-600"
                      }`}
                    >
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Notification Content */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-sm font-semibold text-slate-900 sm:text-base">
                          {notification.title}
                        </h3>

                        {!notification.is_read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                        )}
                      </div>

                      <p className="mt-2 max-w-xl break-words text-sm leading-6 text-slate-600">
                        {notification.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-xs text-slate-400">
                          {formatDate(notification.created_at)}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            notification.is_read
                              ? "bg-slate-100 text-slate-600"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {notification.is_read ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mark as Read */}
                  {!notification.is_read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notification.id)}
                      disabled={updatingId === notification.id || updatingAll}
                      className="flex w-full shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      <Check size={15} />
                      {updatingId === notification.id
                        ? "Updating..."
                        : "Mark as Read"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
