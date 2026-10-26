
import { useState, useEffect } from "react";
import { FaCopy, FaUsers, FaUserFriends } from "react-icons/fa";
import { apiFetch } from "../api/apiFetch";

function flattenReferralTree(nodes) {
    let members = [];

    for (const node of nodes) {
        members.push({
            id: node.id,
            username: node.username,
            level: node.level,
        });

        if (Array.isArray(node.children) && node.children.length > 0) {
            members = [
                ...members,
                ...flattenReferralTree(node.children),
            ];
        }
    }

    return members;
}

function Referrals() {
    const levels = [1, 2, 3, 4, 5, 6, 7];

    const [referralCode, setReferralCode] = useState("");
    const [referrals, setReferrals] = useState([]);
    const [referralTree, setReferralTree] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const networkMembers = flattenReferralTree(referralTree);

    // Load real referral information from Django
    useEffect(() => {
        let active = true;

        const fetchReferrals = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    profileRes,
                    referralsRes,
                    treeRes,
                ] = await Promise.all([
                    apiFetch("/api/profile/"),
                    apiFetch("/api/referrals/"),
                    apiFetch("/api/referrals/tree/"),
                ]);

                if (
                    !profileRes.ok ||
                    !referralsRes.ok ||
                    !treeRes.ok
                ) {
                    throw new Error(
                        "Failed to fetch referral data."
                    );
                }

                const profileData = await profileRes.json();
                const referralsData = await referralsRes.json();
                const treeData = await treeRes.json();

                if (!active) return;

                setReferralCode(
                    profileData.referral_code || ""
                );

                setReferrals(
                    Array.isArray(referralsData)
                        ? referralsData
                        : Array.isArray(referralsData.results)
                        ? referralsData.results
                        : []
                );

                setReferralTree(
                    Array.isArray(treeData.referral_tree)
                        ? treeData.referral_tree
                        : []
                );

            } catch (err) {
                if (active) {
                    setError(err.message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        fetchReferrals();

        return () => {
            active = false;
        };
    }, []);

    // Search direct referrals
    const filteredReferrals = referrals.filter((referral) => {
        const search = searchTerm.toLowerCase().trim();

        return (
            (referral.username || "")
                .toLowerCase()
                .includes(search) ||
            (referral.email || "")
                .toLowerCase()
                .includes(search) ||
            (referral.referral_code || "")
                .toLowerCase()
                .includes(search)
        );
    });

    // Copy user's own referral code
    const copyReferralCode = async () => {
        if (!referralCode) return;

        try {
            await navigator.clipboard.writeText(referralCode);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 2000);

        } catch (err) {
            alert("Unable to copy referral code.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#eef2ff] p-8 text-center text-indigo-600">
                Loading referral data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#eef2ff] p-8 text-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#eef2ff] p-4 md:p-8">

            {/* PAGE HEADING */}
            <div>
                <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                    My Referrals
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                    Track your referrals and grow your network.
                </p>
            </div>

            {/* REFERRAL STATISTICS */}
            <section className="mt-8 grid gap-5 sm:grid-cols-2">

                {/* DIRECT REFERRALS */}
                <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

                    <FaUserFriends className="text-2xl text-indigo-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Direct Referrals
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-900">
                        {referrals.length}
                    </h3>

                    <p className="mt-2 text-xs text-slate-400">
                        Members directly referred by you
                    </p>
                </div>

                {/* TOTAL NETWORK */}
                <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">

                    <FaUsers className="text-2xl text-indigo-600" />

                    <p className="mt-4 text-sm text-slate-500">
                        Total Network Members
                    </p>

                    <h3 className="mt-2 text-3xl font-bold text-slate-900">
                        {networkMembers.length}
                    </h3>

                    <p className="mt-2 text-xs text-slate-400">
                        Members across all 7 referral levels
                    </p>
                </div>
            </section>

            {/* REFERRAL CODE */}
            <section className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">

                <h3 className="text-lg font-bold text-slate-900">
                    Your Referral Code
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    Share your referral code with others to invite new members.
                </p>

                <div className="mt-5 flex max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">

                    <span className="min-w-0 flex-1 break-all font-semibold tracking-wider text-slate-800">
                        {referralCode || "Not available"}
                    </span>

                    <button
                        type="button"
                        onClick={copyReferralCode}
                        disabled={!referralCode}
                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FaCopy />

                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>

                <p className="mt-3 text-xs text-slate-400">
                    Your referral code is unique to your account.
                </p>
            </section>

            {/* REFERRAL HISTORY */}
            <section className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">

                <div className="flex flex-wrap items-center justify-between gap-3">

                    <h3 className="text-lg font-bold text-slate-900">
                        Referral History
                    </h3>

                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {referrals.length} Direct Members
                    </span>
                </div>

                {/* SEARCH */}
                <div className="mt-6">

                    <input
                        type="text"
                        placeholder="Search by username, email or referral code..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(e.target.value)
                        }
                        className="mb-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                {/* REFERRAL TABLE */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">

                    <table className="w-full text-left text-sm">

                        <thead className="bg-indigo-50 text-slate-600">
                            <tr>
                                <th className="px-6 py-4 font-semibold">
                                    Member Name
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Email
                                </th>

                                <th className="px-6 py-4 font-semibold">
                                    Referral Code
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 bg-white">

                            {filteredReferrals.length > 0 ? (
                                filteredReferrals.map((referral) => (
                                    <tr
                                        key={referral.id}
                                        className="hover:bg-indigo-50/50"
                                    >
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {referral.username}
                                        </td>

                                        <td className="px-6 py-4 text-slate-600">
                                            {referral.email || "Not available"}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-indigo-600">
                                            {referral.referral_code}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-8 text-center text-slate-500"
                                    >
                                        {searchTerm
                                            ? "No matching referrals found."
                                            : "No direct referrals yet."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 7 LEVEL REFERRAL NETWORK */}
            <section className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">

                <h3 className="text-lg font-bold text-slate-900">
                    7-Level Referral Network
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    View members across your referral network, grouped by level.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                    {levels.map((level) => {
                        const members = networkMembers.filter(
                            (member) => member.level === level
                        );

                        return (
                            <div
                                key={level}
                                className="rounded-xl border border-indigo-100 bg-indigo-50 p-5"
                            >
                                <h4 className="font-bold text-indigo-700">
                                    Level {level}
                                </h4>

                                <p className="mt-2 text-sm text-slate-600">
                                    {members.length}{" "}
                                    {members.length === 1
                                        ? "Member"
                                        : "Members"}
                                </p>

                                <div className="mt-4 space-y-2">

                                    {members.map((member) => (
                                        <div
                                            key={member.id}
                                            className="rounded-lg bg-white p-3 shadow-sm"
                                        >
                                            <p className="font-semibold text-slate-800">
                                                {member.username}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Level {member.level}
                                            </p>
                                        </div>
                                    ))}

                                    {members.length === 0 && (
                                        <p className="text-sm text-slate-400">
                                            No members yet
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}

export default Referrals;
