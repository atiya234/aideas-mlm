
import {
    FaArrowRight,
    FaCopy,
    FaChartLine,
    FaMoneyBillWave,
    FaUserFriends,
    FaWallet,
    FaUsers,
    FaClipboardList,
    FaCheckCircle,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import stats from "../data/stats.json";
import { apiFetch } from "../api/apiFetch";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

const formatRupees = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

function countNetworkMembers(nodes = []) {
    return nodes.reduce(
        (total, node) =>
            total + 1 + countNetworkMembers(node.children || []),
        0
    );
}

function ReferralNode({ referral }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-slate-800">
                    {referral.username}
                </p>

                <span className="text-xs font-semibold text-indigo-600">
                    Level {referral.level}
                </span>
            </div>

            {referral.children?.length > 0 && (
                <div className="mt-3 space-y-2 border-l-2 border-indigo-200 pl-3">
                    {referral.children.map((child) => (
                        <ReferralNode key={child.id} referral={child} />
                    ))}
                </div>
            )}
        </div>
    );
}

function Dashboard() {
    // Profile and referral state
    const [profile, setProfile] = useState(null);
    const [referralCount, setReferralCount] = useState(0);
    const [referralTree, setReferralTree] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [profileError, setProfileError] = useState("");

    // Wallet state
    const [walletBalance, setWalletBalance] = useState(null);
    const [walletTransactions, setWalletTransactions] = useState([]);
    const [walletLoading, setWalletLoading] = useState(true);
    const [walletError, setWalletError] = useState("");
    const [hasMoreTransactions, setHasMoreTransactions] = useState(false);

    // Orders are fetched from Django rather than CartContext.
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersError, setOrdersError] = useState("");

    const [myInvestments, setMyInvestments] = useState([]);
    const [roiHistory, setRoiHistory] = useState([]);
    const [investmentLoading, setInvestmentLoading] = useState(true);
    const [investmentError, setInvestmentError] = useState("");

    // Fetch profile, referrals and wallet data
    useEffect(() => {
        const controller = new AbortController();

        const fetchDashboardData = async () => {
            const token = sessionStorage.getItem("access");

            if (!token) {
                setProfileError("Please log in again.");
                setWalletError("Please log in again.");
                setLoadingProfile(false);
                setWalletLoading(false);
                setInvestmentError("Please log in again.");
                setInvestmentLoading(false);
                setOrdersError("Please log in again.");
                setOrdersLoading(false);
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const fetchJSON = async (endpoint) => {
                const response = await apiFetch(endpoint, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        `Request failed: ${endpoint} (${response.status})`
                    );
                }

                return response.json();
            };


            // Fetch profile and referrals
            const loadProfile = async () => {
                try {
                    const [profileData, countData, treeData] =
                        await Promise.all([
                            fetchJSON("/api/profile/"),
                            fetchJSON("/api/referrals/count/"),
                            fetchJSON("/api/referrals/tree/"),
                        ]);

                    if (controller.signal.aborted) return;

                    setProfile(profileData);
                    setReferralCount(
                        Number(countData.total_direct_referrals || 0)
                    );
                    setReferralTree(
                        Array.isArray(treeData.referral_tree)
                            ? treeData.referral_tree
                            : []
                    );
                    setProfileError("");
                } catch (error) {
                    if (controller.signal.aborted) return;
                    console.error("Profile error:", error);
                    setProfileError(
                        "Unable to load profile and referral details."
                    );
                } finally {
                    if (!controller.signal.aborted) {
                        setLoadingProfile(false);
                    }
                }
            };

            // Fetch wallet balance and transactions
            const loadWallet = async () => {
                try {
                    const [balanceData, transactionsData] =
                        await Promise.all([
                            fetchJSON("/api/balance/"),
                            fetchJSON("/api/transactions/"),
                        ]);

                    if (controller.signal.aborted) return;

                    const balancePaise = Number(balanceData.balance_paise);

                    if (!Number.isFinite(balancePaise)) {
                        throw new Error("Invalid wallet balance received");
                    }

                    const transactions = Array.isArray(transactionsData)
                        ? transactionsData
                        : Array.isArray(transactionsData.results)
                            ? transactionsData.results
                            : [];

                    setWalletBalance(balancePaise / 100);
                    setWalletTransactions(transactions);

                    // DRF paginated response may contain more transactions
                    setHasMoreTransactions(
                        !Array.isArray(transactionsData) &&
                        Boolean(transactionsData.next)
                    );

                    setWalletError("");
                } catch (error) {
                    if (controller.signal.aborted) return;
                    console.error("Wallet error:", error);
                    setWalletBalance(null);
                    setWalletTransactions([]);
                    setWalletError("Unable to load wallet details.");
                } finally {
                    if (!controller.signal.aborted) {
                        setWalletLoading(false);
                    }
                }
            };

            const loadInvestments = async () => {
                try {
                    const [investmentData, roiData] = await Promise.all([
                        fetchJSON("/api/investments/my/"),
                        fetchJSON("/api/investments/roi/history/"),
                    ]);

                    if (controller.signal.aborted) return;

                    setMyInvestments(
                        Array.isArray(investmentData) ? investmentData : []
                    );

                    setRoiHistory(
                        Array.isArray(roiData) ? roiData : []
                    );

                    setInvestmentError("");
                } catch (error) {
                    if (controller.signal.aborted) return;

                    console.error("Investment error:", error);
                    setInvestmentError("Unable to load investments and ROI.");
                } finally {
                    if (!controller.signal.aborted) {
                        setInvestmentLoading(false);
                    }
                }
            };


            const loadOrders = async () => {
                try {
                    const data = await fetchJSON("/api/orders/my/");
                    if (controller.signal.aborted) return;

                    // Supports both standard and paginated DRF responses.
                    const items = Array.isArray(data)
                        ? data
                        : Array.isArray(data?.results)
                            ? data.results
                            : null;
                    if (!items) throw new Error("Invalid orders response");
                    setOrders(items);
                    setOrdersError("");
                } catch (error) {
                    if (controller.signal.aborted) return;
                    console.error("Orders error:", error);
                    setOrders([]);
                    setOrdersError("Unable to load orders from Django.");
                } finally {
                    if (!controller.signal.aborted) setOrdersLoading(false);
                }
            };

            loadProfile();
            loadWallet();
            loadInvestments();
            loadOrders();
        };

        fetchDashboardData();

        return () => controller.abort();
    }, []);

    const iconMap = {
        investment: <FaChartLine />,
        roi: <FaMoneyBillWave />,
        referral: <FaUserFriends />,
        wallet: <FaWallet />,
    };


    // Only approved investments are returned by the Django investment API.
    const totalInvestmentPaise = myInvestments.reduce(
        (sum, investment) => sum + Number(investment.principal_paise || 0),
        0
    );
    const totalInvestment = totalInvestmentPaise / 100;

    // Projection only; actual eligibility and remaining duration are determined by backend.
    const estimatedDailyROI = myInvestments.reduce((sum, investment) => {
        const principalPaise = Number(investment.principal_paise || 0);
        const roiPercent = Number(investment.roi_percent || 0);
        return sum + (principalPaise * roiPercent / 10000);
    }, 0);

    // Recorded daily ROI, not projected ROI.
    const totalROIEarned = roiHistory.reduce(
        (sum, record) => sum + Number(record.amount_paise || 0) / 100,
        0
    );

    // Payment and admin approval are distinct order states.
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
        (order) => String(order.approval_status || "").toLowerCase() === "pending"
    ).length;
    const totalSpent = orders
        .filter((order) => String(order.payment_status || "").toLowerCase() === "paid")
        .reduce((total, order) => total + Number(order.amount_paise || 0), 0) / 100;
    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 5);

    // Wallet data comes from Django.
    const recentTransactions = walletTransactions.slice(0, 3);

    const loadedReferralEarnings = walletTransactions
        .filter(
            (transaction) =>
                transaction.transaction_type === "direct_referral_bonus"
        )
        .reduce(
            (total, transaction) =>
                total + Number(transaction.amount_paise || 0) / 100,
            0
        );

    const copyReferralCode = async () => {
        if (!profile?.referral_code) {
            alert("Referral code is not available.");
            return;
        }

        try {
            await navigator.clipboard.writeText(profile.referral_code);
            alert("Referral code copied!");
        } catch (error) {
            console.error(error);
            alert("Unable to copy referral code.");
        }
    };

    const getStatValue = (stat) => {
        switch (stat.iconKey) {
            case "investment":
                return investmentLoading ? "Loading..." : investmentError ? "—" : `₹${formatRupees(totalInvestment)}`;

            case "roi":
                return investmentLoading ? "Loading..." : investmentError ? "—" : `₹${formatRupees(totalROIEarned)}`;

            case "referral":
                if (walletLoading) return "Loading...";
                if (walletError || hasMoreTransactions) return "—";
                return `₹${formatRupees(loadedReferralEarnings)}`;

            case "wallet":
                if (walletLoading) return "Loading...";
                if (walletError || walletBalance === null) return "—";
                return `₹${formatRupees(walletBalance)}`;

            default:
                return stat.value;
        }
    };

    const getStatDescription = (stat) => {
        switch (stat.iconKey) {
            case "investment":
                return investmentError ? "Unable to load investments" : `${myInvestments.length} investment records`;

            case "roi":
                return "Recorded daily ROI history";

            case "referral":
                return walletError
                    ? "Unable to load earnings"
                    : hasMoreTransactions
                        ? "Lifetime total requires backend aggregation"
                        : "Direct referral bonuses";

            case "wallet":
                return walletError
                    ? "Unable to load wallet balance"
                    : "Balance from your wallet ledger";

            default:
                return stat.description;
        }
    };

    return (
        <main className="p-4 md:p-8">
            {/* Welcome Section */}
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-medium text-indigo-600">
                        MEMBER DASHBOARD
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                        Welcome back, {profile?.username || "Member"}!
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                        Here's an overview of your account activity.
                    </p>

                    {profileError && (
                        <p className="mt-2 text-sm text-red-600">
                            {profileError}
                        </p>
                    )}
                </div>

                <Link
                    to="/products"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
                >
                    Explore Products
                    <FaArrowRight />
                </Link>
            </section>

            {/* Welcome Notice */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900">
                <FaCheckCircle className="mt-0.5 shrink-0 text-indigo-600" />

                <p>
                    Welcome back! Track your orders, monitor your referral
                    network, and stay updated on your account activity — all
                    in one place.
                </p>
            </div>

            {/* Summary Cards */}
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
                                    {getStatValue(stat)}
                                </h3>
                            </div>

                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${stat.iconStyle}`}
                            >
                                {iconMap[stat.iconKey]}
                            </div>
                        </div>

                        <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
                            {getStatDescription(stat)}
                        </p>
                    </div>
                ))}
            </section>

            {/* Order Summary */}
            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Orders
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-slate-900">
                        {ordersLoading ? "Loading..." : ordersError ? "—" : totalOrders}
                    </h3>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Pending Orders
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-amber-600">
                        {ordersLoading ? "Loading..." : ordersError ? "—" : pendingOrders}
                    </h3>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm font-medium text-slate-500">
                        Total Spent
                    </p>
                    <h3 className="mt-3 text-2xl font-bold text-indigo-600">
                        {ordersLoading ? "Loading..." : ordersError ? "—" : `₹${formatRupees(totalSpent)}`}
                    </h3>
                </div>
            </section>

            <div className="mt-4 flex justify-end">
                <Link
                    to="/orders"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                    View My Orders
                    <FaArrowRight />
                </Link>
            </div>

            {/* Main Dashboard Panels */}
            <section className="mt-8 grid gap-6 xl:grid-cols-3">
                {/* Account Overview */}
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
                            Investment & ROI Overview
                        </h4>

                        {investmentLoading ? (
                            <p className="mt-2 text-sm text-slate-500">Loading investment details...</p>
                        ) : investmentError ? (
                            <p className="mt-2 text-sm text-red-600">{investmentError}</p>
                        ) : (
                            <>
                                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                    You have {myInvestments.length} investment records worth ₹{formatRupees(totalInvestment)}.
                                </p>
                                <p className="mt-3 text-sm text-slate-600">
                                    Estimated daily ROI (before eligibility checks): ₹{formatRupees(estimatedDailyROI)}
                                </p>
                                <p className="mt-2 font-medium text-green-600">
                                    Total recorded daily ROI: ₹{formatRupees(totalROIEarned)}
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                    Pending approvals are not included in the investments API.
                                </p>
                            </>
                        )}

                        <Link
                            to="/investments"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                            View My Investments
                            <FaArrowRight />
                        </Link>
                    </div>
                </div>

                {/* Referral Panel */}
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
                            My Referral Code
                        </label>

                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <span className="flex-1 font-semibold tracking-wider text-slate-700">
                                {loadingProfile
                                    ? "Loading..."
                                    : profile?.referral_code || "Unavailable"}
                            </span>

                            <button
                                onClick={copyReferralCode}
                                className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                                title="Copy referral code"
                                aria-label="Copy referral code"
                            >
                                <FaCopy />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Direct Referrals
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {referralCount}
                            </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                            <p className="text-xs text-slate-500">
                                Network Members
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {countNetworkMembers(referralTree)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5">
                        <h4 className="font-semibold text-slate-900">
                            My Referral Network
                        </h4>

                        {loadingProfile ? (
                            <p className="mt-2 text-sm text-slate-500">
                                Loading referrals...
                            </p>
                        ) : profileError ? (
                            <p className="mt-2 text-sm text-red-600">
                                Unable to load referrals
                            </p>
                        ) : referralTree.length === 0 ? (
                            <p className="mt-2 text-sm text-slate-500">
                                No referrals found
                            </p>
                        ) : (
                            <div className="mt-3 space-y-2">
                                {referralTree.map((referral) => (
                                    <ReferralNode
                                        key={referral.id}
                                        referral={referral}
                                    />
                                ))}
                            </div>
                        )}
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

            {/* Recent Activity */}
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
                </div>

                {/* Wallet Transactions */}
                <div className="space-y-3 border-b border-slate-100 p-6">
                    <h4 className="mb-3 font-semibold text-slate-800">
                        Recent Wallet Transactions
                    </h4>

                    {walletLoading ? (
                        <p className="text-sm text-slate-500">
                            Loading wallet transactions...
                        </p>
                    ) : walletError ? (
                        <p className="text-sm text-red-600">
                            {walletError}
                        </p>
                    ) : recentTransactions.length === 0 ? (
                        <p className="text-sm text-slate-500">
                            No wallet transactions yet.
                        </p>
                    ) : (
                        recentTransactions.map((transaction) => {
                            const amount =
                                Number(transaction.amount_paise || 0) / 100;

                            const transactionName = String(
                                transaction.transaction_type || "Transaction"
                            ).replaceAll("_", " ");

                            return (
                                <div
                                    key={transaction.id}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3"
                                >
                                    <div className="min-w-0">
                                        <p className="font-medium capitalize text-slate-800">
                                            {transactionName}
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {transaction.created_at
                                                ? new Date(
                                                    transaction.created_at
                                                ).toLocaleDateString("en-IN")
                                                : "Date unavailable"}
                                        </p>

                                        {transaction.reference && (
                                            <p className="mt-1 break-all text-xs text-slate-400">
                                                Ref: {transaction.reference}
                                            </p>
                                        )}
                                    </div>

                                    <p
                                        className={`shrink-0 font-semibold ${amount >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                            }`}
                                    >
                                        {amount > 0 ? "+" : amount < 0 ? "-" : ""}
                                        ₹{formatRupees(Math.abs(amount))}
                                    </p>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Recent Orders */}
                <div className="px-6 pt-6">
                    <h4 className="font-semibold text-slate-800">
                        Recent Orders
                    </h4>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="px-6 py-4 font-semibold">
                                    Activity
                                </th>
                                <th className="px-6 py-4 font-semibold">
                                    Date
                                </th>
                                <th className="px-6 py-4 font-semibold">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-right font-semibold">
                                    Amount
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {ordersLoading ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">Loading orders...</td></tr>
                            ) : ordersError ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-red-600">{ordersError}</td></tr>
                            ) : recentOrders.length === 0 ? (
                                <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-500">No orders yet.</td></tr>
                            ) : (
                                recentOrders.map((order) => {
                                    const approval = String(order.approval_status || "unknown").toLowerCase();
                                    const payment = String(order.payment_status || "unknown").toLowerCase();
                                    const statusStyle = approval === "approved"
                                        ? "bg-green-50 text-green-700"
                                        : approval === "rejected"
                                            ? "bg-red-50 text-red-700"
                                            : "bg-amber-50 text-amber-700";
                                    return (
                                        <tr key={order.id} className="border-t border-slate-100">
                                            <td className="px-6 py-4 font-medium text-slate-800">
                                                Order #{order.id}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {order.created_at
                                                    ? new Date(order.created_at).toLocaleDateString("en-IN")
                                                    : "—"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle}`}>
                                                    {approval}
                                                </span>
                                                <p className="mt-1 text-xs capitalize text-slate-500">Payment: {payment}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                                ₹{formatRupees(Number(order.amount_paise || 0) / 100)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="py-8 text-center text-xs text-slate-400">
                © 2026 AIdeas Platform.
            </footer>
        </main>
    );
}

export default Dashboard;
