import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, CalendarDays, RefreshCw, Search, ShieldCheck, ScrollText, UserRound } from "lucide-react";
import { refreshAccessToken } from "../utils/refreshToken";

const API_URL = "http://127.0.0.1:8001/api/admin/audit/logs/";

const normalizeLogs = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.logs)) return payload.logs;
  return [];
};

const getAction = (log) => String(log.action ?? log.action_type ?? "unknown");
const getActor = (log) => String(log.admin_username ?? log.actor_username ?? log.username ?? log.admin ?? log.actor ?? "System");
const getTarget = (log) =>
  log.target_type
    ? `${log.target_type} #${log.target_id ?? "—"}`
    : String(log.target ?? log.object_repr ?? log.resource ?? log.model_name ?? "—");
const getDate = (log) => log.created_at ?? log.timestamp ?? log.performed_at ?? null;
const readable = (value) => String(value ?? "—").replaceAll("_", " ");

const AdminAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const request = (token) => fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let token = sessionStorage.getItem("access");
      if (!token) throw new Error("Please log in as an admin.");
      let response = await request(token);
      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error("Session expired. Please log in again.");
        response = await request(token);
      }
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.detail || payload.error || `Unable to load audit logs (${response.status}).`);
      }
      setLogs(normalizeLogs(payload));
    } catch (err) {
      setError(err.message || "Unable to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const actions = useMemo(() => [...new Set(logs.map(getAction))].sort(), [logs]);
  const filteredLogs = useMemo(() => logs.filter((log) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [getActor(log), getAction(log), getTarget(log), log.description, log.details, log.object_id]
      .some((value) => String(value ?? "").toLowerCase().includes(term));
    const matchesAction = actionFilter === "all" || getAction(log) === actionFilter;
    const matchesDate = !dateFilter || String(getDate(log) ?? "").slice(0, 10) === dateFilter;
    return matchesSearch && matchesAction && matchesDate;
  }), [logs, search, actionFilter, dateFilter]);

  const stats = [
    { label: "Audit Records", value: logs.length, icon: ScrollText, color: "bg-indigo-50 text-indigo-600" },
    { label: "Actions Recorded", value: actions.length, icon: Activity, color: "bg-purple-50 text-purple-600" },
    { label: "Recorded Actors", value: new Set(logs.map(getActor)).size, icon: UserRound, color: "bg-blue-50 text-blue-600" },
    { label: "Matching Records", value: filteredLogs.length, icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600" },
  ];

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  return (
    <main className="min-h-screen min-w-0 bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-indigo-600"><ScrollText size={17} /> Admin / Audit Logs</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Audit Logs</h1>
            <p className="mt-2 text-sm text-slate-500">Review recorded administrative actions and system activity.</p>
          </div>
          <button type="button" onClick={fetchLogs} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}{error.includes("404") && <p className="mt-1">The Django audit API endpoint has not been found. Check its backend URL and routing.</p>}</div>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-slate-900">{loading ? "—" : value}</p></div>
                <div className={`rounded-xl p-3 ${color}`}><Icon size={22} /></div>
              </div>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Activity History</h2>
            <p className="mt-1 text-sm text-slate-500">Search and filter records returned by the audit API.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="relative">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search admin, action, record..." aria-label="Search audit logs" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-400" />
              </div>
              <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)} aria-label="Filter by action" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-indigo-400">
                <option value="all">All Actions</option>
                {actions.map((action) => <option key={action} value={action}>{readable(action)}</option>)}
              </select>
              <div className="relative">
                <CalendarDays size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter by date" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm outline-none focus:border-indigo-400" />
              </div>
            </div>
          </div>

          {loading ? <p className="p-8 text-sm text-slate-500">Loading audit logs...</p> : filteredLogs.length === 0 ? (
            <div className="p-10 text-center">
              <ScrollText size={32} className="mx-auto text-slate-300" />
              <p className="mt-3 font-semibold text-slate-700">No audit records found</p>
              <p className="mt-1 text-sm text-slate-500">{error ? "Unable to load records." : logs.length ? "Try changing your filters." : "No records have been returned by the API."}</p>
              {(search || actionFilter !== "all" || dateFilter) && <button type="button" onClick={() => { setSearch(""); setActionFilter("all"); setDateFilter(""); }} className="mt-3 text-sm font-semibold text-indigo-600">Clear Filters</button>}
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Admin / Actor</th><th className="px-5 py-4">Action</th><th className="px-5 py-4">Record</th><th className="px-5 py-4">Details</th><th className="px-5 py-4">Date & Time</th></tr></thead>
                  <tbody>{filteredLogs.map((log, index) => <tr key={log.id ?? index} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">{getActor(log)}</td>
                    <td className="px-5 py-4"><span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold capitalize text-indigo-700">{readable(getAction(log))}</span></td>
                    <td className="px-5 py-4 text-slate-600">{getTarget(log)}</td>
                    <td className="max-w-xs break-words px-5 py-4 text-slate-600">{typeof (log.description ?? log.details) === "object" ? JSON.stringify(log.description ?? log.details) : (log.description ?? log.details ?? "—")}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(getDate(log))}</td>
                  </tr>)}</tbody>
                </table>
              </div>
              <div className="space-y-3 p-4 md:hidden">{filteredLogs.map((log, index) => <article key={log.id ?? index} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-slate-900">{getActor(log)}</p><span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold capitalize text-indigo-700">{readable(getAction(log))}</span></div>
                <p className="mt-2 break-words text-sm text-slate-600">{getTarget(log)}</p>
                <p className="mt-2 break-words text-sm text-slate-500">{typeof (log.description ?? log.details) === "object" ? JSON.stringify(log.description ?? log.details) : (log.description ?? log.details ?? "—")}</p>
                <p className="mt-3 text-xs text-slate-400">{formatDate(getDate(log))}</p>
              </article>)}</div>
            </>
          )}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-500">Showing {filteredLogs.length} of {logs.length} loaded records</div>
        </section>
      </div>
    </main>
  );
};

export default AdminAudit;
