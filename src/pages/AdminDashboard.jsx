
import React, { useEffect, useState } from "react";
import { refreshAccessToken } from "../utils/refreshToken";

const AdminDashboard = () => {
  // Admin support ticket management
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportLoading, setSupportLoading] = useState(true);
  const [supportError, setSupportError] = useState("");
  const [supportSuccess, setSupportSuccess] = useState("");
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [ticketStatusDrafts, setTicketStatusDrafts] = useState({});

  const supportApi = async (url, options = {}) => {
    const request = (token) => fetch(url, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    let token = sessionStorage.getItem("access");
    if (!token) throw new Error("Please log in as an admin.");
    let response = await request(token);
    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) throw new Error("Session expired. Please log in again.");
      response = await request(token);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.detail || data.error || `Request failed (${response.status})`);
    }
    return data;
  };

  const fetchSupportTickets = async () => {
    try {
      setSupportLoading(true);
      setSupportError("");
      const data = await supportApi("http://127.0.0.1:8001/api/support/admin/tickets/");
      const tickets = Array.isArray(data) ? data : (data.results ?? []);
      setSupportTickets(tickets);
      setTicketStatusDrafts(Object.fromEntries(tickets.map((ticket) => [ticket.id, ticket.status])));
    } catch (err) {
      setSupportError(err.message);
    } finally {
      setSupportLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const handleSupportStatusUpdate = async (ticket) => {
    const newStatus = ticketStatusDrafts[ticket.id] ?? ticket.status;
    if (newStatus === ticket.status) return;
    try {
      setUpdatingTicketId(ticket.id);
      setSupportError("");
      setSupportSuccess("");
      await supportApi(`http://127.0.0.1:8001/api/support/admin/tickets/${ticket.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setSupportSuccess(`Ticket #${ticket.id} updated to ${newStatus.replaceAll("_", " ")}.`);
      await fetchSupportTickets();
    } catch (err) {
      setSupportError(err.message);
    } finally {
      setUpdatingTicketId(null);
    }
  };

  const [adminOrders, setAdminOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  const [investments, setInvestments] = useState([]);
  const [investmentsLoading, setInvestmentsLoading] = useState(true);
  const [investmentsError, setInvestmentsError] = useState("");

  const [dailyRoiRecords, setDailyRoiRecords] = useState([]);
  const [roiLoading, setRoiLoading] = useState(true);
  const [roiError, setRoiError] = useState("");


  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState("");

  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);
  const [withdrawalsError, setWithdrawalsError] = useState("");


  const fetchWithdrawals = async () => {
    const token = sessionStorage.getItem("access");

    try {
      setWithdrawalsLoading(true);
      setWithdrawalsError("");

      const response = await fetch(
        "http://127.0.0.1:8001/api/withdrawals/admin/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch withdrawals: ${response.status}`
        );
      }

      const data = await response.json();

      setWithdrawals(
        Array.isArray(data) ? data : data.results ?? []
      );

    } catch (error) {
      setWithdrawalsError(error.message);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);


  const fetchWalletTransactions = async () => {
    const token = sessionStorage.getItem("access");

    try {
      setWalletLoading(true);
      setWalletError("");


      const response = await fetch(
        "http://127.0.0.1:8001/api/admin/transactions/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (!response.ok) {
        throw new Error(
          `Failed to fetch wallet transactions: ${response.status}`
        );
      }

      const data = await response.json();

      // Supports both normal lists and paginated DRF responses.
      setWalletTransactions(
        Array.isArray(data) ? data : data.results ?? []
      );

    } catch (error) {
      setWalletError(error.message);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletTransactions();
  }, []);




  const fetchDailyRoi = async () => {
    const token = sessionStorage.getItem("access");

    try {
      setRoiLoading(true);
      setRoiError("");

      const response = await fetch(
        "http://127.0.0.1:8001/api/investments/admin/daily-roi/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ROI: ${response.status}`);
      }

      const data = await response.json();
      setDailyRoiRecords(data);
    } catch (error) {
      setRoiError(error.message);
    } finally {
      setRoiLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyRoi();
  }, []);



  const fetchInvestments = async () => {
    const token = sessionStorage.getItem("access");

    try {
      setInvestmentsLoading(true);
      setInvestmentsError("");

      const response = await fetch(
        "http://127.0.0.1:8001/api/investments/admin/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch investments");
      }

      const data = await response.json();
      setInvestments(data);
    } catch (error) {
      setInvestmentsError(error.message);
    } finally {
      setInvestmentsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);





  const fetchAdminOrders = async () => {
    const token = sessionStorage.getItem("access");

    try {
      setOrdersLoading(true);
      setOrdersError("");

      const response = await fetch(
        "http://127.0.0.1:8001/api/orders/admin/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch orders: ${response.status}`);
      }

      const data = await response.json();
      setAdminOrders(data);
    } catch (error) {
      setOrdersError(error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOrders();
  }, []);



  const [viewingId, setViewingId] = useState(null);


  const handleViewDocument = async (id) => {
    const token = sessionStorage.getItem("access");
    if (!token) {
      setError("plz login in as an admin")
      return;
    }
    try {
      setViewingId(id);
      setError("");
      const response = await fetch(
        `http://127.0.0.1:8001/api/kyc/admin/${id}/document/`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Unable to load document(${response.status})`
        );
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, "_blank");
      if (!newTab) {
        setError("plz allow pop-ups to view doc")
      }


    } catch (error) {
      setError(error.message);
    } finally {
      setViewingId(null)
    }
  }

  const totalOrders = adminOrders.length;

  const pendingOrders = adminOrders.filter(
    (order) => order.approval_status === "pending"
  ).length;

  const approvedOrders = adminOrders.filter(
    (order) => order.approval_status === "approved"
  ).length;

  const rejectedOrders = adminOrders.filter(
    (order) => order.approval_status === "rejected"
  ).length;

  // KYC states
  const [kycRecords, setKycRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState(null);

  const fetchKycRecords = async () => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      setError("Please log in as an admin.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8001/api/kyc/admin/list/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.error ||
          `Request failed: ${response.status}`
        );
      }

      setKycRecords(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycRecords();
  }, []);

  const handleReview = async (id, decision) => {
    const token = sessionStorage.getItem("access");

    if (!token) {
      setError("Please log in as an admin.");
      return;
    }

    let rejectionReason = "";

    if (decision === "rejected") {
      const reason = window.prompt(
        "Enter the reason for rejecting this KYC:"
      );

      if (reason === null) return;

      rejectionReason = reason.trim();

      if (!rejectionReason) {
        setError("Rejection reason is required.");
        return;
      }
    }

    try {
      setReviewingId(id);
      setError("");

      const response = await fetch(
        `http://127.0.0.1:8001/api/kyc/admin/${id}/review/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: decision,
            rejection_reason: rejectionReason,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.detail ||
          `Review failed: ${response.status}`
        );
      }

      await fetchKycRecords();

    } catch (err) {
      setError(err.message);
    } finally {
      setReviewingId(null);
    }
  };

  const openTickets = supportTickets.filter(
    (ticket) => ticket.status === "open"
  ).length;

  const pendingKyc = kycRecords.filter(
    (kyc) => kyc.status === "pending"
  ).length;

  const dashboardStats = [
    { title: "Total Orders", value: totalOrders },
    { title: "Pending Orders", value: pendingOrders },
    { title: "Open Support Tickets", value: openTickets },
    { title: "Pending KYC", value: pendingKyc },
  ];

  return (
    <main className="min-h-screen min-w-0 bg-slate-50 px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        Admin Dashboard
      </h1>

      <p className="mt-2 text-slate-500">
        Welcome to AIDEAS Admin Panel
      </p>

      {/* Quick navigation: scroll to any management section */}
      <nav aria-label="Admin dashboard sections" className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-2">
        {[
          ["orders", "Orders"],
          ["investments", "Investments"],
          ["roi", "Daily ROI"],
          ["wallet", "Wallet"],
          ["withdrawals", "Withdrawals"],
          ["support", "Support Tickets"],
          ["kyc", "KYC"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-full border border-indigo-100 bg-white px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {label}
          </a>
        ))}
      </nav>

      {ordersLoading && <p>Loading orders...</p>}

      {ordersError && (
        <p className="text-red-600">{ordersError}</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {stat.title}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-indigo-600">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>



      <section id="orders" className="mt-8 min-w-0 scroll-mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">
          Order Management
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          View orders placed by registered users.
        </p>

        {ordersLoading ? (
          <p className="mt-4">Loading orders...</p>
        ) : ordersError ? (
          <p className="mt-4 text-red-600">{ordersError}</p>
        ) : adminOrders.length === 0 ? (
          <p className="mt-4">No orders found.</p>
        ) : (
          <div className="mt-6 w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">User ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Approval</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Document</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {adminOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="p-3">#{order.id}</td>

                    <td className="p-3">{order.user}</td>

                    <td className="p-3">
                      ₹{(order.amount_paise / 100).toFixed(2)}
                    </td>

                    <td className="p-3 capitalize">
                      {order.payment_status}
                    </td>

                    <td className="p-3 capitalize">
                      {order.approval_status}
                    </td>

                    <td className="p-3">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="p-3">
                      {order.approval_status !== "pending" ? (
                        <span className="text-slate-500">
                          {order.approval_status === "approved"
                            ? "Approved"
                            : "Rejected"}
                        </span>
                      ) : order.payment_status === "paid" ? (
                        <span className="text-blue-600">
                          Ready for admin review
                        </span>
                      ) : (
                        <span className="text-orange-600">
                          Awaiting Payment
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      <section id="investments" className="mt-8 min-w-0 scroll-mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">
          Investment Management
        </h2>

        {investmentsLoading ? (
          <p>Loading investments...</p>
        ) : investmentsError ? (
          <p className="text-red-600">{investmentsError}</p>
        ) : investments.length === 0 ? (
          <p>No investments found.</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Principal</th>
                  <th className="p-3">ROI %</th>
                  <th className="p-3">Duration</th>
                </tr>
              </thead>

              <tbody>
                {investments.map((investment) => (
                  <tr key={investment.id} className="border-t">
                    <td className="p-3">{investment.id}</td>
                    <td className="p-3">{investment.username}</td>
                    <td className="p-3">{investment.order_id}</td>
                    <td className="p-3">
                      ₹{(investment.principal_paise / 100).toFixed(2)}
                    </td>
                    <td className="p-3">{investment.roi_percent}%</td>
                    <td className="p-3">
                      {investment.roi_duration_working_days} days
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>



      <section id="roi" className="mt-8 min-w-0 scroll-mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">
          Daily ROI History
        </h2>

        {roiLoading ? (
          <p>Loading ROI records...</p>
        ) : roiError ? (
          <p className="text-red-600">{roiError}</p>
        ) : dailyRoiRecords.length === 0 ? (
          <p>No Daily ROI records found.</p>
        ) : (
          <div className="mt-5 w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">ROI ID</th>
                  <th className="p-3">Investment ID</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">ROI Date</th>
                  <th className="p-3">Amount</th>
                </tr>
              </thead>

              <tbody>
                {dailyRoiRecords.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="p-3">{record.id}</td>
                    <td className="p-3">{record.investment_id}</td>
                    <td className="p-3">{record.username}</td>
                    <td className="p-3">{record.roi_date}</td>
                    <td className="p-3">
                      ₹{(record.amount_paise / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>




      {/* Existing order statistics */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total Orders", totalOrders],
          ["Pending Orders", pendingOrders],
          ["Approved Orders", approvedOrders],
          ["Rejected Orders", rejectedOrders],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold">
              {value}
            </p>
          </div>
        ))}
      </div>


      <section id="wallet" className="mt-8 min-w-0 scroll-mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">

        <h2 className="text-xl font-bold">
          Wallet Management
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          View wallet transactions of registered users.
        </p>

        {walletLoading ? (
          <p className="mt-4">Loading wallet transactions...</p>
        ) : walletError ? (
          <p className="mt-4 text-red-600">
            {walletError}
          </p>
        ) : walletTransactions.length === 0 ? (
          <p className="mt-4">
            No wallet transactions found.
          </p>
        ) : (
          <div className="mt-5 w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">

              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Transaction Type</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {walletTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {transaction.id}
                    </td>

                    <td className="p-3">
                      {transaction.username}
                    </td>

                    <td className="p-3 capitalize">
                      {transaction.transaction_type.replaceAll("_", " ")}
                    </td>

                    <td
                      className={`p-3 font-semibold ${transaction.amount_paise >= 0
                        ? "text-green-600"
                        : "text-red-600"
                        }`}
                    >
                      {transaction.amount_paise >= 0 ? "+" : "-"}
                      ₹{(
                        Math.abs(transaction.amount_paise) / 100
                      ).toFixed(2)}
                    </td>

                    <td className="p-3">
                      {transaction.reference}
                    </td>

                    <td className="p-3">
                      {new Date(
                        transaction.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </section>


      <section id="withdrawals" className="mt-8 min-w-0 scroll-mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">
          Withdrawal Management
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Monitor withdrawal requests and payout statuses.
        </p>

        {withdrawalsLoading ? (
          <p className="mt-4">Loading withdrawals...</p>
        ) : withdrawalsError ? (
          <p className="mt-4 text-red-600">
            {withdrawalsError}
          </p>
        ) : withdrawals.length === 0 ? (
          <p className="mt-4">
            No withdrawals found.
          </p>
        ) : (
          <div className="mt-5 w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Payout Reference</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>

              <tbody>
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="border-b">
                    <td className="p-3">{withdrawal.id}</td>

                    <td className="p-3">{withdrawal.username}</td>

                    <td className="p-3">
                      ₹{(withdrawal.amount_paise / 100).toFixed(2)}
                    </td>

                    <td className="p-3 capitalize">
                      {withdrawal.status}
                    </td>

                    <td className="p-3">
                      {withdrawal.payout_reference || "-"}
                    </td>

                    <td className="p-3">
                      {new Date(
                        withdrawal.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>



      {/* Admin Support Ticket Management */}
      <section id="support" className="mt-8 min-w-0 scroll-mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Support Ticket Management</h2>
            <p className="mt-2 text-sm text-slate-500">
              Review support requests and update their progress.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchSupportTickets}
            disabled={supportLoading || updatingTicketId !== null}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {supportError && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{supportError}</p>
        )}
        {supportSuccess && (
          <p role="status" className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{supportSuccess}</p>
        )}

        {supportLoading ? (
          <p className="mt-5 text-slate-500">Loading support tickets...</p>
        ) : supportTickets.length === 0 ? (
          <p className="mt-5 text-slate-500">No support tickets found.</p>
        ) : (
          <>
            <div className="mt-5 grid gap-4 md:hidden">
              {supportTickets.map((ticket) => (
                <article key={ticket.id} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-indigo-700">Ticket #{ticket.id}</p>
                      <h3 className="mt-1 break-words font-semibold text-slate-900">{ticket.subject}</h3>
                    </div>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium capitalize text-indigo-700">
                      {(ticket.status || "-").replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-xs text-slate-500">
                    By {ticket.username || "-"} · {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "-"}
                  </p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{ticket.message}</p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <select
                      aria-label={`Status for ticket ${ticket.id}`}
                      value={ticketStatusDrafts[ticket.id] ?? ticket.status}
                      onChange={(event) => setTicketStatusDrafts((previous) => ({
                        ...previous,
                        [ticket.id]: event.target.value,
                      }))}
                      disabled={updatingTicketId !== null}
                      className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleSupportStatusUpdate(ticket)}
                      disabled={updatingTicketId !== null || (ticketStatusDrafts[ticket.id] ?? ticket.status) === ticket.status}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updatingTicketId === ticket.id ? "Saving..." : "Save Status"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-5 hidden w-full overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="p-3">Ticket ID</th>
                    <th className="p-3">Username</th>
                    <th className="p-3">Subject / Message</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b align-top">
                      <td className="p-3 font-medium">#{ticket.id}</td>
                      <td className="p-3">{ticket.username || "-"}</td>
                      <td className="max-w-sm p-3">
                        <p className="font-semibold text-slate-900">{ticket.subject}</p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-slate-600">{ticket.message}</p>
                      </td>
                      <td className="p-3">
                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 capitalize">{(ticket.status || "-").replaceAll("_", " ")}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            aria-label={`Status for ticket ${ticket.id}`}
                            value={ticketStatusDrafts[ticket.id] ?? ticket.status}
                            onChange={(event) => setTicketStatusDrafts((previous) => ({
                              ...previous,
                              [ticket.id]: event.target.value,
                            }))}
                            disabled={updatingTicketId !== null}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => handleSupportStatusUpdate(ticket)}
                            disabled={updatingTicketId !== null || (ticketStatusDrafts[ticket.id] ?? ticket.status) === ticket.status}
                            className="rounded-lg bg-indigo-600 px-3 py-2 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {updatingTicketId === ticket.id ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* KYC Management */}
      <section id="kyc" className="mt-8 min-w-0 scroll-mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
        <h2 className="text-xl font-bold">
          KYC Management
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Review submitted KYC requests.
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-6">Loading KYC records...</p>
        ) : kycRecords.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No KYC records found.
          </p>
        ) : (
          <div className="mt-6 w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3">KYC ID</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {kycRecords.map((kyc) => (
                  <tr
                    key={kyc.id}
                    className="border-b"
                  >
                    <td className="p-3">
                      {kyc.id}
                    </td>

                    <td className="p-3">
                      {kyc.username}
                    </td>

                    <td className="p-3 capitalize">
                      {kyc.status}
                    </td>

                    <td className="p-3">
                      {new Date(
                        kyc.submitted_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-3">

                      <button
                        onClick={() => handleViewDocument(kyc.id)}
                        disabled={viewingId === kyc.id}
                        className="rounded-lg bg-blue-600 px-3 py-2 text-white disabled:opacity-50"
                      >
                        {viewingId === kyc.id ? "Opening..." : "View Document"}
                      </button>

                    </td>

                    <td className="p-3">
                      {kyc.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleReview(
                                kyc.id,
                                "approved"
                              )
                            }
                            disabled={
                              reviewingId !== null
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-white disabled:opacity-50"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              handleReview(
                                kyc.id,
                                "rejected"
                              )
                            }
                            disabled={
                              reviewingId !== null
                            }
                            className="rounded-lg bg-red-600 px-3 py-2 text-white disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500">
                          Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default AdminDashboard;
