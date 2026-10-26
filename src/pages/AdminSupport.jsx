import React, { useEffect, useState } from "react";
import { refreshAccessToken } from "../utils/refreshToken";

const API_URL =
  "http://127.0.0.1:8001/api/support/admin/tickets/";

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusDrafts, setStatusDrafts] = useState({});

  const apiRequest = async (url, options = {}) => {
    const sendRequest = (token) =>
      fetch(url, {
        ...options,
        headers: {
          ...(options.body
            ? { "Content-Type": "application/json" }
            : {}),
          Authorization: `Bearer ${token}`,
        },
      });

    let token = sessionStorage.getItem("access");

    if (!token) {
      throw new Error("Please login as admin.");
    }

    let response = await sendRequest(token);

    if (response.status === 401) {
      token = await refreshAccessToken();

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      response = await sendRequest(token);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.detail || data.error || `Request failed (${response.status})`
      );
    }

    return data;
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest(API_URL);

      const records = Array.isArray(data)
        ? data
        : data.results ?? [];

      setTickets(records);

      setStatusDrafts(
        Object.fromEntries(
          records.map((ticket) => [ticket.id, ticket.status])
        )
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (ticket) => {
    const status = statusDrafts[ticket.id] ?? ticket.status;

    if (status === ticket.status) return;

    try {
      setUpdatingId(ticket.id);
      setError("");
      setSuccess("");

      await apiRequest(`${API_URL}${ticket.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setSuccess(`Ticket #${ticket.id} updated successfully.`);

      await fetchTickets();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "resolved"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Support Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage support requests submitted by users.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-5 py-2 text-white disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["Total Tickets", tickets.length],
          ["Open Tickets", openTickets],
          ["Resolved Tickets", resolvedTickets],
        ].map(([title, value]) => (
          <div
            key={title}
            className="rounded-xl bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{title}</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {value}
            </h2>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-5 rounded-lg bg-green-50 p-4 text-green-700">
          {success}
        </p>
      )}

      <div className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">
          User Support Tickets
        </h2>

        {loading ? (
          <p className="mt-5 text-slate-500">Loading tickets...</p>
        ) : tickets.length === 0 ? (
          <p className="mt-5 text-slate-500">
            No support tickets found.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-indigo-600">
                      Ticket #{ticket.id}
                    </p>

                    <h3 className="mt-1 font-bold text-slate-900">
                      {ticket.subject}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      By {ticket.username || "-"}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700">
                    {(ticket.status || "").replaceAll("_", " ")}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-sm text-slate-700">
                  {ticket.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                  <select
                    value={statusDrafts[ticket.id] ?? ticket.status}
                    onChange={(e) =>
                      setStatusDrafts((prev) => ({
                        ...prev,
                        [ticket.id]: e.target.value,
                      }))
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <button
                    onClick={() => updateStatus(ticket)}
                    disabled={
                      updatingId !== null ||
                      (statusDrafts[ticket.id] ?? ticket.status) ===
                        ticket.status
                    }
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {updatingId === ticket.id
                      ? "Saving..."
                      : "Update Status"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;