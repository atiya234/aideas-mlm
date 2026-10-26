
import { useState, useEffect } from "react";
import {
    Link,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    FaHome,
    FaWallet,
    FaUsers,
    FaShoppingBag,
    FaSignOutAlt,
    FaBell,
    FaBars,
    FaTimes,
    FaClipboardList,
    FaIdCard,
    FaUser,
    FaHeadset,
    FaMoneyBillWave,
    FaChartLine,
} from "react-icons/fa";

import { refreshAccessToken } from "../utils/refreshToken";

const API_BASE = "http://127.0.0.1:8001";

function DashboardLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    // Fetch logged-in user from Django
    useEffect(() => {
        let active = true;

        const fetchUser = async () => {
            try {
                let token = sessionStorage.getItem("access");

                if (!token) {
                    throw new Error("No access token found");
                }

                let response = await fetch(
                    `${API_BASE}/api/profile/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                // Refresh expired token once
                if (response.status === 401) {
                    token = await refreshAccessToken();

                    if (!token) {
                        throw new Error("Session expired");
                    }

                    response = await fetch(
                        `${API_BASE}/api/profile/`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                }

                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const data = await response.json();

                if (active) {
                    setUser(data);
                }
            } catch (error) {
                console.error("Profile error:", error);

                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoadingUser(false);
                }
            }
        };

        fetchUser();

        return () => {
            active = false;
        };
    }, [location.pathname]);

    // User initials
    const initials =
        user?.username
            ?.trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "U";

    // Sidebar menu
    const menuItems = [
        {
            name: "Dashboard",
            icon: <FaHome />,
            path: "/dashboard",
        },
        {
            name: "Products",
            icon: <FaShoppingBag />,
            path: "/products",
        },
        {
            name: "My Orders",
            icon: <FaClipboardList />,
            path: "/orders",
        },
        {
            name: "My Referrals",
            icon: <FaUsers />,
            path: "/referrals",
        },
        {
            name: "My Investments",
            icon: <FaChartLine />,
            path: "/investments",
        },
        {
            name: "My Wallet",
            icon: <FaWallet />,
            path: "/wallet",
        },
        {
            name: "Withdrawals",
            icon: <FaMoneyBillWave />,
            path: "/withdrawals",
        },
        {
            name: "KYC Verification",
            icon: <FaIdCard />,
            path: "/kyc",
        },
        {
            name: "My Profile",
            icon: <FaUser />,
            path: "/profile",
        },
        {
            name: "Support",
            icon: <FaHeadset />,
            path: "/support",
        },
    ];

    const currentPage =
        menuItems.find(
            (item) => item.path === location.pathname
        )?.name || "Overview";

    // Logout
    const handleLogout = () => {
        sessionStorage.removeItem("access");
        sessionStorage.removeItem("refresh");

        localStorage.removeItem("user");

        setUser(null);
        setSidebarOpen(false);

        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">

            {/* MOBILE SIDEBAR OVERLAY */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col overflow-hidden bg-slate-950 text-white transition-transform duration-300 md:translate-x-0 ${
                    sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full"
                }`}
            >

                {/* LOGO - FIXED AT TOP */}
                <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-6">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold">
                        A
                    </div>

                    <div>
                        <h1 className="text-xl font-bold tracking-wide">
                            AIdeas
                        </h1>

                        <p className="text-xs text-slate-400">
                            Member Portal
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto text-xl text-slate-300 md:hidden"
                        aria-label="Close sidebar"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* SCROLLABLE NAVIGATION */}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">

                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
                        Workspace
                    </p>

                    <nav className="space-y-1">

                        {menuItems.map((item) => {
                            const active =
                                location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() =>
                                        setSidebarOpen(false)
                                    }
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                        active
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                                            : "text-slate-400 hover:bg-white/5 hover:text-white"
                                    }`}
                                >
                                    <span className="text-base">
                                        {item.icon}
                                    </span>

                                    <span>{item.name}</span>

                                    {active && (
                                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
                                    )}
                                </Link>
                            );
                        })}

                    </nav>
                </div>

                {/* FIXED BOTTOM PROFILE + LOGOUT */}
                <div className="shrink-0 border-t border-white/10 bg-slate-950 p-4">

                    {/* USER PROFILE */}
                    <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 font-bold">
                            {initials}
                        </div>

                        <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-semibold">
                                {loadingUser
                                    ? "Loading..."
                                    : user?.username || "Member Account"}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                                {user?.email || "No email available"}
                            </p>
                        </div>
                    </div>

                    {/* LOGOUT BUTTON */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                    >
                        <FaSignOutAlt className="text-lg" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="min-h-screen md:ml-64">

                {/* TOP NAVBAR */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-3">

                        {/* MOBILE MENU BUTTON */}
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
                            aria-label="Open sidebar"
                        >
                            <FaBars />
                        </button>

                        {/* CURRENT PAGE */}
                        <div>
                            <p className="text-xs text-slate-400">
                                Workspace / {currentPage}
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                                {currentPage}
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-3 md:gap-5">

                        {/* NOTIFICATIONS */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate("/notifications")
                            }
                            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
                            aria-label="Notifications"
                        >
                            <FaBell size={20} />
                        </button>

                        {/* NAVBAR PROFILE */}
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700"
                            title={user?.username || "User"}
                        >
                            {initials}
                        </div>
                    </div>
                </header>

                {/* CHILD PAGES */}
                <Outlet />
            </div>
        </div>
    );
}

export default DashboardLayout;
