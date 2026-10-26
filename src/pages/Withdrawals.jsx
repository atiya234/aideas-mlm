
import React, { useContext, useEffect, useState } from "react";
import BankAccount from "./BankAccount";
import { KYCContext } from "../Context/KYCContext";
import { apiFetch } from "../api/apiFetch";


function Withdrawals() {
  // Withdrawal amount entered by user
  const [amount, setAmount] = useState("");

  // Real wallet balance from Django (stored in paise)
  const [walletBalancePaise, setWalletBalancePaise] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  // Real withdrawal history from Django
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  // Existing KYC context
  const { kycStatus } = useContext(KYCContext);

  const isKycVerified = kycStatus === "Verified";

  // Existing bank account component state
  const [bankDetailsSubmitted, setBankDetailsSubmitted] =
    useState(false);

  // RazorpayX fund account verification is not connected yet
  const hasFundAccount = false;

  // Payout requests are not enabled yet
  const payoutsEnabled = false;

  // Convert paise to rupees
  const walletBalance = walletBalancePaise / 100;

  // Validate entered withdrawal amount
  const withdrawalAmount = Number(amount);

  const isAmountValid =
    amount.trim() !== "" &&
    Number.isFinite(withdrawalAmount) &&
    withdrawalAmount >= 1 &&
    Number.isInteger(withdrawalAmount * 100) &&
    withdrawalAmount <= walletBalance;

  // Check Friday in Indian timezone
  const todayIST = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
  }).format(new Date());

  const isFriday = todayIST === "Friday";

  // Check whether all UI requirements are satisfied
  const isEligible =
    isAmountValid &&
    isFriday &&
    isKycVerified &&
    hasFundAccount &&
    payoutsEnabled;

  // Fetch real wallet balance
  useEffect(() => {
    const controller = new AbortController();

    const fetchWalletBalance = async () => {
      const token = sessionStorage.getItem("access");

      try {
        setWalletLoading(true);
        setWalletError("");

        if (!token) {
          throw new Error("Please log in to view your wallet.");
        }

        const response = await apiFetch("/api/balance/", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch wallet balance: ${response.status}`
          );
        }

        const data = await response.json();

        setWalletBalancePaise(Number(data.balance_paise ?? 0));
      } catch (error) {
        if (error.name !== "AbortError") {
          setWalletError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setWalletLoading(false);
        }
      }
    };

    fetchWalletBalance();

    return () => controller.abort();
  }, []);

  // Fetch real withdrawal history
  useEffect(() => {
    const controller = new AbortController();

    const fetchWithdrawalHistory = async () => {
      const token = sessionStorage.getItem("access");

      try {
        setHistoryLoading(true);
        setHistoryError("");

        if (!token) {
          throw new Error(
            "Please log in to view withdrawal history."
          );
        }

        const response = await apiFetch("/api/withdrawals/my/", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch withdrawals: ${response.status}`
          );
        }

        const data = await response.json();

        setWithdrawalHistory(
          Array.isArray(data) ? data : data.results ?? []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setHistoryError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setHistoryLoading(false);
        }
      }
    };

    fetchWithdrawalHistory();

    return () => controller.abort();
  }, []);

  return (
    <main className="min-h-screen bg-[#eef2ff] p-4 md:p-8">
      <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
        Withdrawals
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        View your wallet balance and track withdrawal requests.
      </p>

      {/* WALLET BALANCE */}
      <div className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          Available Wallet Balance
        </p>

        {walletLoading ? (
          <p className="mt-3 text-slate-500">
            Loading wallet balance...
          </p>
        ) : walletError ? (
          <p className="mt-3 text-red-500">
            {walletError}
          </p>
        ) : (
          <h3 className="mt-3 text-3xl font-bold text-indigo-600">
            ₹{walletBalance.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
        )}

        <p className="mt-2 text-xs text-slate-400">
          Balance calculated from your Django wallet ledger.
        </p>
      </div>

      {/* WITHDRAWAL REQUEST */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900">
          Request Withdrawal
        </h3>

        <p
          className={`mt-2 text-sm font-medium ${
            isFriday ? "text-green-600" : "text-red-500"
          }`}
        >
          {isFriday
            ? "Today is Friday (IST)."
            : `Today is ${todayIST}. Withdrawals are allowed only on Fridays (IST).`}
        </p>

        <div className="mt-6">
          <label
            htmlFor="withdrawal-amount"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Withdrawal Amount (₹)
          </label>

          <input
            id="withdrawal-amount"
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />

          {amount !== "" && (
            <p
              className={`mt-2 text-sm ${
                isAmountValid
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {!Number.isFinite(withdrawalAmount)
                ? "Enter a valid amount"
                : withdrawalAmount < 1
                ? "Minimum withdrawal amount is ₹1"
                : !Number.isInteger(withdrawalAmount * 100)
                ? "Enter an amount with at most 2 decimal places"
                : walletLoading || walletError
                ? "Wallet balance is not available"
                : withdrawalAmount > walletBalance
                ? "Insufficient wallet balance"
                : "Valid withdrawal amount"}
            </p>
          )}

          {/* KYC STATUS */}
          <p
            className={`mt-4 text-sm font-medium ${
              isKycVerified
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {kycStatus === "Pending Verification"
              ? "KYC submitted. Verification pending."
              : isKycVerified
              ? "KYC verified."
              : "Please complete your KYC verification."}
          </p>

          {/* BANK ACCOUNT STATUS */}
          <p
            className={`mt-2 text-sm font-medium ${
              bankDetailsSubmitted
                ? "text-amber-600"
                : "text-red-500"
            }`}
          >
            {bankDetailsSubmitted
              ? "Bank details submitted. Verification pending."
              : "Please submit your bank account details."}
          </p>

          <p className="mt-2 text-sm text-amber-600">
            Payout account verification is not yet connected.
          </p>
        </div>

        <button
          type="button"
          disabled={!isEligible || walletLoading || !!walletError}
          className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Request Withdrawal
        </button>

        <p className="mt-3 text-center text-sm text-amber-600">
          Withdrawal requests are temporarily unavailable until
          secure payout integration is complete.
        </p>
      </div>

      {/* WITHDRAWAL HISTORY */}
      <div className="mt-6 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-900">
          Withdrawal History
        </h3>

        {historyLoading ? (
          <p className="text-slate-500">
            Loading withdrawal history...
          </p>
        ) : historyError ? (
          <p className="text-red-500">
            {historyError}
          </p>
        ) : withdrawalHistory.length === 0 ? (
          <p className="text-slate-500">
            No withdrawals found.
          </p>
        ) : (
          <div className="space-y-3">
            {withdrawalHistory.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    ₹{(
                      Number(withdrawal.amount_paise) / 100
                    ).toFixed(2)}
                  </p>

                  <p className="text-sm text-slate-500">
                    {new Date(
                      withdrawal.created_at
                    ).toLocaleDateString("en-IN")}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Withdrawal #{withdrawal.id}
                  </p>
                </div>

                <span
                  className={`text-sm font-semibold capitalize ${
                    withdrawal.status === "completed"
                      ? "text-green-600"
                      : withdrawal.status === "pending" ||
                        withdrawal.status === "processing"
                      ? "text-yellow-600"
                      : "text-red-500"
                  }`}
                >
                  {withdrawal.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EXISTING BANK ACCOUNT COMPONENT */}
      <BankAccount
        onBankSubmitted={() =>
          setBankDetailsSubmitted(true)
        }
      />
    </main>
  );
}

export default Withdrawals;
