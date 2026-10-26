
import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  CalendarDays,
  Package,
  IndianRupee,
  ClipboardList,
} from "lucide-react";

const API = "http://127.0.0.1:8001/api/orders";

const getStatusStyle = (status) => {
  switch (status) {
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "approved":
      return "bg-green-50 text-green-700 border-green-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

const formatPrice = (paise) =>
  (Number(paise) / 100).toLocaleString("en-IN");

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch orders from Django
  const fetchOrders = useCallback(async () => {
    try {
      setError("");

      const token = sessionStorage.getItem("access");

      if (!token) {
        throw new Error("Please log in as admin");
      }

      const response = await fetch(`${API}/admin/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch orders"
        );
      }

      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Approve or reject an order
  const updateOrder = async (id, action) => {
    const confirmed = window.confirm(
      `Are you sure you want to ${action} order #${id}?`
    );

    if (!confirmed) return;

    setProcessingId(id);

    try {
      const token = sessionStorage.getItem("access");

      if (!token) {
        throw new Error("Please log in as admin");
      }

      const response = await fetch(
        `${API}/${id}/${action}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.detail || "Action failed"
        );
      }

      alert(data.message);
      await fetchOrders();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Dynamic statistics
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.approval_status === "pending"
  ).length;

  const approvedOrders = orders.filter(
    (order) => order.approval_status === "approved"
  ).length;

  const rejectedOrders = orders.filter(
    (order) => order.approval_status === "rejected"
  ).length;

  // Dynamic search and filter
  const filteredOrders = orders
    .filter((order) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        String(order.id).includes(searchText) ||
        order.items?.some((item) =>
          (item.product_name || "")
            .toLowerCase()
            .includes(searchText)
        );

      const matchesStatus =
        filterStatus === "All" ||
        order.approval_status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at) - new Date(a.created_at)
    );

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock3,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Approved Orders",
      value: approvedOrders,
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Rejected Orders",
      value: rejectedOrders,
      icon: XCircle,
      color: "bg-red-50 text-red-600",
    },
  ];

  if (loading) {
    return (
      <p className="p-8 text-slate-500">
        Loading orders...
      </p>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            fetchOrders();
          }}
          className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Order Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Review, approve, and manage customer orders.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
              >
                <Icon size={20} />
              </div>

              <p className="text-xs font-medium text-slate-500 sm:text-sm">
                {stat.title}
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search order ID or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 sm:w-48"
        >
          <option value="All">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ClipboardList
              size={20}
              className="text-indigo-600"
            />
            All Orders
          </h2>

          <span className="text-sm text-slate-500">
            {filteredOrders.length} orders
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <Package
              size={42}
              className="mx-auto mb-4 text-slate-300"
            />
            <p className="font-semibold text-slate-800">
              No orders found
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >

              {/* Order Header */}
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <p className="text-xs text-slate-500">
                    Order ID
                  </p>

                  <h3 className="font-bold text-slate-900">
                    #{order.id}
                  </h3>

                  <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <CalendarDays size={14} />
                    {order.created_at
                      ? new Date(order.created_at)
                          .toLocaleDateString("en-IN")
                      : "Date unavailable"}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                    order.approval_status
                  )}`}
                >
                  {order.approval_status}
                </span>
              </div>

              {/* Products */}
              <div className="space-y-3 p-4 sm:p-5">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Package
                    size={17}
                    className="text-indigo-600"
                  />
                  Products
                </h4>

                {order.items?.length > 0 ? (
                  order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1 rounded-xl bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {item.product_name}
                        </p>

                        <p className="text-xs text-slate-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-slate-900">
                        ₹{formatPrice(
                          item.price_paise * item.quantity
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No item details available.
                  </p>
                )}

                {/* Total */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="flex items-center gap-1 text-sm font-medium text-slate-600">
                    <IndianRupee size={16} />
                    Order Total
                  </p>

                  <p className="text-lg font-bold text-indigo-700">
                    ₹{formatPrice(order.amount_paise)}
                  </p>
                </div>

                <p className="text-sm text-slate-600">
                  Payment Status:{" "}
                  <span className="font-semibold">
                    {order.payment_status}
                  </span>
                </p>
              </div>

              {/* Admin Actions */}
              {order.approval_status === "pending" && (
                <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 p-4 sm:flex-row sm:justify-end sm:p-5">

                  <button
                    disabled={processingId !== null}
                    onClick={() =>
                      updateOrder(order.id, "reject")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <XCircle size={17} />
                    Reject Order
                  </button>

                  <button
                    disabled={
                      processingId !== null ||
                      order.payment_status !== "paid"
                    }
                    onClick={() =>
                      updateOrder(order.id, "approve")
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <CheckCircle2 size={17} />
                    Approve Order
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminOrders;
