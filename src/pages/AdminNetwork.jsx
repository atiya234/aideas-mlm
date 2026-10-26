
import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Network,
  CheckCircle2,
  UserX,
  GitBranch,
} from "lucide-react";


import ReferralTree from "../components/ReferralTree";

const AdminNetwork = () => {

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [users, setUsers] = useState([])

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("")

  useEffect(() => {
    const controller = new AbortController();
    const fetchNetwork = async () => {
      try {
        setLoading(true);
        setError("");
        const token = sessionStorage.getItem("access");
        if (!token) throw new Error("Please log in as admin.");

        const response = await fetch("http://127.0.0.1:8001/api/admin/network/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch network (${response.status})`
          )
        }
        const data = await response.json();
        setUsers(data.members || []);
      } catch (error) {
        if (error.name !== "AbortError") setError(error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchNetwork();
    return () => controller.abort();
  }, []);

  // Search and filter users
  const filteredUsers = users.filter((user) => {
    const searchText = search.trim().toLowerCase();

    const matchesSearch =
      (user.name || "").toLowerCase().includes(searchText) ||
      (user.code || "").toLowerCase().includes(searchText) ||
      (user.referredBy || "").toLowerCase().includes(searchText);

    const matchesStatus =
      selectedStatus === "All" ||
      user.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Dashboard statistics
  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  const referralCounts = users.reduce((counts, user) => {
    if (user.parent_id != null) {
      counts[user.parent_id] = (counts[user.parent_id] || 0) + 1;
    }
    return counts;
  }, {});

  const membersWithReferrals = Object.keys(referralCounts).length;

  const stats = [
    {
      title: "Total Members",
      value: totalUsers,
      icon: Users,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Active Members",
      value: activeUsers,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Inactive Members",
      value: inactiveUsers,
      icon: UserX,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Members With Referrals",
      value: membersWithReferrals,
      icon: GitBranch,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus("All");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">

        {/* Page Header */}
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Network size={18} />
            Admin / Network
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Network Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage and explore referral relationships,
            member statuses, and network levels.
          </p>
        </div>
        {loading && (
          <p className="text-sm text-indigo-600">
            Loading network members...
          </p>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <h2 className="mt-3 text-3xl font-bold text-slate-900">
                      {stat.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Network Table Section */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Section Header and Filters */}
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Referral Network
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search and filter registered network members.
                </p>
              </div>

              <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {filteredUsers.length} Members Found
              </span>
            </div>

            {/* Filters */}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">

              {/* Search Input */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or referral code..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>



              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Referral Code</th>
                  <th className="px-6 py-4">Referred By</th>
                  <th className="px-6 py-4">Direct Referrals</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                          {(user.name || "?").charAt(0)}
                        </div>

                        <span className="font-semibold text-slate-800">
                          {user.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-semibold text-slate-700">
                        {user.code}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-600">
                      {user.referredBy}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                        {referralCounts[user.id] || 0}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${user.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                          }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${user.status === "Active"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                            }`}
                        />

                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Member Cards */}
          <div className="space-y-3 p-4 md:hidden">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                      {(user.name || "?").charAt(0)}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">
                        {user.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {user.code}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                      }`}
                  >
                    {user.status}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Referred By
                    </p>

                    <p className="mt-1 break-all text-sm font-medium text-slate-700">
                      {user.referredBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Direct Referrals
                    </p>

                    <p className="mt-1 text-sm font-semibold text-indigo-600">
                      {referralCounts[user.id] || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!loading && !error && filteredUsers.length === 0 && (
            <div className="px-6 py-14 text-center">
              <Search
                size={36}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-3 font-semibold text-slate-700">
                No members found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Table Footer */}
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:px-6">
            Showing {filteredUsers.length} of {totalUsers} members
          </div>
        </div>

        {/* Referral Tree Component */}
        <div className="mt-8">
          {!loading && !error && users.length > 0 && (
            <ReferralTree users={users} />
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminNetwork;
