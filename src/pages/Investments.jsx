
import React, { useEffect, useState } from "react";
import { FaChartLine } from "react-icons/fa";
import { apiFetch } from "../api/apiFetch";

const formatMoney = (paise) =>
  `₹${(Number(paise || 0) / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function Investments() {
  const [investments, setInvestments] = useState([]);
  const [roiHistory, setRoiHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadInvestments = async () => {
      try {
        const [investmentResponse, roiResponse] = await Promise.all([
          apiFetch("/api/investments/my/"),
          apiFetch("/api/investments/roi/history/"),
        ]);

        if (!investmentResponse.ok || !roiResponse.ok) {
          throw new Error("Failed to load investment data.");
        }

        const [investmentData, roiData] = await Promise.all([
          investmentResponse.json(),
          roiResponse.json(),
        ]);

        if (!Array.isArray(investmentData) || !Array.isArray(roiData)) {
          throw new Error("Unexpected API response format.");
        }

        if (!cancelled) {
          setInvestments(investmentData);
          setRoiHistory(roiData);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInvestments();

    return () => {
      cancelled = true;
    };
  }, []);

  // The investments endpoint returns created investments
  // after payment and admin approval.
  const activeInvestments = investments;

  const totalInvestmentPaise = activeInvestments.reduce(
    (sum, investment) =>
      sum + Number(investment.principal_paise || 0),
    0
  );

  const totalCreditedROIPaise = roiHistory.reduce(
    (sum, record) => sum + Number(record.amount_paise || 0),
    0
  );

  const getCompletedDays = (investmentId) =>
    roiHistory.filter(
      (record) => String(record.investment_id) === String(investmentId)
    ).length;

  return (
    <main className="min-h-screen bg-[#eef2ff] p-4 md:p-8">
      <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
        My Investments
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Track your investments and credited daily ROI earnings.
      </p>

      {/* Investment Overview */}
      <section className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <FaChartLine className="text-3xl text-indigo-600" />

        <h3 className="mt-4 text-lg font-bold text-slate-900">
          Investment Overview
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          View your approved investments, ROI rates,
          and remaining eligible working days.
        </p>
      </section>

      {loading && (
        <p className="mt-6 text-sm text-slate-600">
          Loading your investment details...
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Investment Summary */}
          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Approved Investments
              </p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">
                {activeInvestments.length}
              </h3>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Pending Investments
              </p>
              <h3 className="mt-3 text-lg font-bold text-amber-600">
                Not connected
              </h3>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Approved Investment
              </p>
              <h3 className="mt-3 text-2xl font-bold text-indigo-600">
                {formatMoney(totalInvestmentPaise)}
              </h3>
            </div>

            <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Total Daily ROI Credited
              </p>
              <h3 className="mt-3 text-2xl font-bold text-green-600">
                {formatMoney(totalCreditedROIPaise)}
              </h3>
            </div>
          </section>

          {/* Investment List */}
          <section className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">
              My Investment Details
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              View your approved investment packages and ROI details.
            </p>

            {investments.length === 0 ? (
              <div className="mt-6 rounded-xl bg-indigo-50 p-8 text-center">
                <p className="font-medium text-slate-700">
                  No approved investments yet.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Approved investments will appear here after
                  verified payment and admin approval.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {investments.map((investment) => {
                  const principalPaise = Number(
                    investment.principal_paise || 0
                  );

                  const roiPercent = Number(
                    investment.roi_percent || 0
                  );

                  const duration = Number(
                    investment.roi_duration_working_days || 0
                  );

                  const completedDays = getCompletedDays(investment.id);

                  const remainingDays = Math.max(
                    0,
                    duration - completedDays
                  );

                  const progress =
                    duration > 0
                      ? Math.min(100, (completedDays / duration) * 100)
                      : 0;

                  // This is a projected amount, not a wallet credit.
                  const projectedDailyROIPaise = Math.floor(
                    (principalPaise * roiPercent) / 100
                  );

                  const completed = duration > 0 && remainingDays === 0;

                  return (
                    <div
                      key={investment.id}
                      className="rounded-xl border border-indigo-100 bg-indigo-50 p-5"
                    >
                      <h4 className="text-lg font-bold text-slate-900">
                        Investment #{investment.id}
                      </h4>

                      <p className="mt-3 text-sm text-slate-600">
                        Order ID: {investment.order_id}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Investment: {formatMoney(principalPaise)}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Daily ROI Rate: {roiPercent}%
                      </p>

                      <p className="mt-2 text-sm font-semibold text-green-600">
                        Projected Daily ROI:{" "}
                        {formatMoney(projectedDailyROIPaise)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Projection only; actual earnings depend on
                        eligible working days and successful ROI processing.
                      </p>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="text-slate-600">
                            Investment Progress
                          </span>

                          <span className="font-semibold text-indigo-600">
                            {progress.toFixed(0)}%
                          </span>
                        </div>

                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-indigo-600"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <p className="mt-4 text-sm text-slate-600">
                        Completed ROI Days: {completedDays}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Remaining Working Days: {remainingDays}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        Investment Created:{" "}
                        {investment.started_at
                          ? new Date(investment.started_at).toLocaleDateString(
                              "en-IN"
                            )
                          : "Unavailable"}
                      </p>

                      <span
                        className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          completed
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {completed ? "ROI Completed" : "Approved"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Investments;
