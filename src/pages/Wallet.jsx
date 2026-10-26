
import React, { useEffect, useState } from "react";
import { FaWallet } from "react-icons/fa";
import { apiFetch } from "../api/apiFetch";

function Wallet() {
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


useEffect(() => {
  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("access");

      if (!token) {
        throw new Error("Please login again.");
      }

      const [balanceResponse, transactionsResponse] =
        await Promise.all([
          apiFetch("/api/balance/"),
          apiFetch("/api/transactions/"),
        ]);

      if (!balanceResponse.ok || !transactionsResponse.ok) {
        throw new Error(
          "Unable to fetch wallet data. Please try again."
        );
      }

      const balanceData = await balanceResponse.json();
      const transactionsData = await transactionsResponse.json();

      setBalance(balanceData.balance_paise);

      setTransactions(
        Array.isArray(transactionsData)
          ? transactionsData
          : transactionsData.results ?? []
      );
    } catch (err) {
      console.error("Wallet API error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchWallet();
}, []);


    // Convert paise into rupees
    const availableBalance = balance / 100;

    // Calculate total ROI earnings
    const totalROI = transactions
        .filter(
            (transaction) =>
                transaction.transaction_type === "investment_roi"
        )
        .reduce(
            (total, transaction) => total + transaction.amount_paise,
            0
        ) / 100;

    // Calculate direct referral earnings
    const referralEarnings = transactions
        .filter(
            (transaction) =>
                transaction.transaction_type === "direct_referral_bonus"
        )
        .reduce(
            (total, transaction) => total + transaction.amount_paise,
            0
        ) / 100;

    // Sort transactions by latest date
    const sortedTransactions = [...transactions].sort(
        (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
    );

    // Make transaction names readable
    const formatTransactionType = (type) => {
        return type
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    return (
        <main className="min-h-screen bg-[#eef2ff] p-4 md:p-8">

            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                My Wallet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
                Track your wallet balance and earnings.
            </p>

            {loading && (
                <p className="mt-6 text-indigo-600">
                    Loading wallet data...
                </p>
            )}

            {error && (
                <p className="mt-6 rounded-lg bg-red-100 p-4 text-red-600">
                    {error}
                </p>
            )}

            {/* Available Balance */}
            <section className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">

                <FaWallet className="text-3xl text-indigo-600" />

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                    ₹{availableBalance.toFixed(2)}
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    Available Balance
                </p>

            </section>

            {/* Earnings Cards */}
            <section className="mt-6 grid gap-5 sm:grid-cols-2">

                <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">

                    <p className="text-sm text-slate-500">
                        Total ROI Earnings
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-green-600">
                        ₹{totalROI.toFixed(2)}
                    </h3>

                </div>

                <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">

                    <p className="text-sm text-slate-500">
                        Referral Earnings
                    </p>

                    <h3 className="mt-3 text-2xl font-bold text-indigo-600">
                        ₹{referralEarnings.toFixed(2)}
                    </h3>

                </div>

            </section>

            {/* Transaction History */}
            <section className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">

                <h3 className="text-lg font-bold text-slate-900">
                    Transaction History
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                    View your wallet credits and debits.
                </p>

                <div className="mt-6 overflow-x-auto">

                    <table className="w-full text-left text-sm">

                        <thead className="bg-indigo-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Amount</th>
                            </tr>
                        </thead>

                        <tbody>

                            {sortedTransactions.length === 0 ? (

                                <tr>
                                    <td
                                        colSpan="3"
                                        className="px-4 py-8 text-center text-slate-500"
                                    >
                                        {loading
                                            ? "Loading transactions..."
                                            : error
                                                ? "Unable to load transactions."
                                                : "No transactions found."}
                                    </td>
                                </tr>

                            ) : (

                                sortedTransactions.map((transaction) => (

                                    <tr
                                        key={transaction.id}
                                        className="border-b border-slate-100"
                                    >

                                        <td className="px-4 py-4">
                                            {new Date(
                                                transaction.created_at
                                            ).toLocaleDateString("en-IN")}
                                        </td>

                                        <td className="px-4 py-4">

                                            <div className="flex items-center gap-3">

                                                <span>
                                                    {formatTransactionType(
                                                        transaction.transaction_type
                                                    )}
                                                </span>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        transaction.amount_paise >= 0
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                                >
                                                    {transaction.amount_paise >= 0
                                                        ? "Credit"
                                                        : "Debit"}
                                                </span>

                                            </div>

                                        </td>

                                        <td
                                            className={`px-4 py-4 font-semibold ${
                                                transaction.amount_paise >= 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {transaction.amount_paise >= 0
                                                ? "+"
                                                : "-"}
                                            ₹
                                            {(
                                                Math.abs(transaction.amount_paise) / 100
                                            ).toFixed(2)}
                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </main>
    );
}

export default Wallet;
