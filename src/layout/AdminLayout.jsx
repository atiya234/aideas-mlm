
import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Headphones,
  CalendarDays,
  Network,
  ScrollText,
  GitBranch,
} from "lucide-react";

const AdminLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Referral Levels",
      path: "/admin/referral-levels",
      icon: GitBranch,
    },
    {
      name: "Holidays",
      path: "/admin/holidays",
      icon: CalendarDays,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Network",
      path: "/admin/network",
      icon: Network,
    },
    {
      name: "Support",
      path: "/admin/support",
      icon: Headphones,
    },
    {
      name: "Audit Logs",
      path: "/admin/audit",
      icon: ScrollText,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <h1 className="text-lg font-bold text-indigo-700">
          AIdeas Admin
        </h1>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={menuOpen}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64
          flex-col bg-slate-900 text-white
          transition-transform duration-300
          lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-5">
          <h2 className="text-xl font-bold">
            AIdeas Admin
          </h2>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close admin menu"
            className="rounded-lg p-1 text-white hover:bg-slate-700 lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`
                }
              >
                <Icon size={19} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-700 p-4">
          <p className="text-xs text-slate-400">
            AIdeas MLM & ROI Admin Panel
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;
