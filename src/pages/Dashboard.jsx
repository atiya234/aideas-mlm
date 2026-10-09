
import {
  FaHome,
  FaWallet,
  FaUsers,
  FaShoppingBag,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaArrowRight,
  FaCopy,
  FaChartLine,
  FaMoneyBillWave,
  FaUserFriends,
  FaBars,
  FaTimes,
  FaClipboardList,
  FaIdCard,
  FaUser,
  FaHeadset,
  FaCheckCircle,
} from "react-icons/fa";

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import stats from "../data/stats.json"

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <FaHome />, path: "/dashboard" },
    { name: "Products", icon: <FaShoppingBag />, path: "/products" },
    { name: "My Orders", icon: <FaClipboardList />, path: "/orders" },
    { name: "My Referrals", icon: <FaUsers />, path: "/referrals" },
    { name: "My Wallet", icon: <FaWallet />, path: "/wallet" },
    { name: "Withdrawals", icon: <FaMoneyBillWave />, path: "/withdrawals" },
    { name: "KYC Verification", icon: <FaIdCard />, path: "/kyc" },
    { name: "My Profile", icon: <FaUser />, path: "/profile" },
    { name: "Support", icon: <FaHeadset />, path: "/support" },
  ];

//   const stats = [
//     {
//       title: "Approved Investment",
//       value: "₹0.00",
//       description: "No approved investments yet",
//       icon: <FaChartLine />,
//       iconStyle: "bg-indigo-50 text-indigo-600",
//     },
//     {
//       title: "ROI Earned",
//       value: "₹0.00",
//       description: "No ROI credited yet",
//       icon: <FaMoneyBillWave />,
//       iconStyle: "bg-blue-50 text-blue-600",
//     },
//     {
//       title: "Referral Earnings",
//       value: "₹0.00",
//       description: "No referral rewards yet",
//       icon: <FaUserFriends />,
//       iconStyle: "bg-purple-50 text-purple-600",
//     },
//     {
//       title: "Available Wallet",
//       value: "₹0.00",
//       description: "Available balance: ₹0.00",
//       icon: <FaWallet />,
//       iconStyle: "bg-amber-50 text-amber-600",
//     },
//   ];

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText("DEMO-1234");
      alert("Demo referral code copied!");
    } catch {
      alert("Could not copy the code. Please copy DEMO-1234 manually.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold">
            A
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-wide">AIdeas</h1>
            <p className="text-xs text-slate-400">Member Portal</p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto text-xl text-slate-300 md:hidden"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        <div className="px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500 font-bold">
              AT
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Member Account</p>
              <p className="text-xs text-slate-400">Demo profile</p>
            </div>
          </div>

          <Link
            to="/login"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <FaSignOutAlt />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-h-screen md:ml-64">
        {/* Top navigation */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
              aria-label="Open sidebar"
            >
              <FaBars />
            </button>

            <div>
              <p className="text-xs text-slate-400">Workspace / Dashboard</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                Overview
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 lg:flex">
              <FaSearch className="text-slate-400" />
              <input
                type="search"
                placeholder="Search..."
                className="w-36 bg-transparent text-sm outline-none"
              />
            </div>

            <button
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
              aria-label="Notifications"
            >
              <FaBell />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-600" />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              AT
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {/* Welcome section */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-indigo-600">
                MEMBER DASHBOARD
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                Welcome back!
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Here's an overview of your account activity.
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Explore Products
              <FaArrowRight />
            </Link>
          </section>

          {/* Demo notice */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
            <FaCheckCircle className="mt-0.5 shrink-0 text-indigo-600" />
            <p>
              <span className="font-semibold">Demo mode:</span> These values
              are placeholders. Verified account information will appear after
              backend integration.
            </p>
          </div>

          {/* Summary cards */}
          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                      {stat.value}
                    </h3>
                  </div>

                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${stat.iconStyle}`}
                  >
                    {stat.icon}
                  </div>
                </div>

                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                  {stat.description}
                </p>
              </div>
            ))}
          </section>

          {/* Main dashboard panels */}
          <section className="mt-8 grid gap-6 xl:grid-cols-3">
            {/* Account overview */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Account Overview
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your account activity at a glance
                  </p>
                </div>

                <div className="rounded-xl bg-slate-100 p-3 text-slate-500">
                  <FaChartLine />
                </div>
              </div>

              <div className="mt-6 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl text-indigo-500">
                  <FaClipboardList />
                </div>

                <h4 className="mt-4 font-semibold text-slate-800">
                  Your account activity will appear here
                </h4>

                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Once you have verified orders and account transactions, you
                  can review your activity in this section.
                </p>

                <Link
                  to="/products"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Browse Products
                  <FaArrowRight />
                </Link>
              </div>
            </div>

            {/* Referral panel */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-lg text-purple-600">
                  <FaUsers />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Referral Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your referral overview
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Demo Referral Code
                </label>

                <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="flex-1 font-semibold tracking-wider text-slate-700">
                    DEMO-1234
                  </span>

                  <button
                    onClick={copyReferralCode}
                    className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                    title="Copy demo referral code"
                    aria-label="Copy referral code"
                  >
                    <FaCopy />
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Placeholder only; not a valid referral code.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Direct Referrals</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Network Members</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">0</p>
                </div>
              </div>

              <Link
                to="/referrals"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                View Referrals
                <FaArrowRight />
              </Link>
            </div>
          </section>

          {/* Recent activity */}
          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Recent Activity
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  A record of your latest account events
                </p>
              </div>

              <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                Demo data
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Activity</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Amount
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          <FaClipboardList />
                        </div>

                        <p className="mt-3 font-medium text-slate-700">
                          No activity yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Your account events will appear here when available.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 text-center text-xs text-slate-400">
            © 2026 AIdeas Platform. Demo interface.
          </footer>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
