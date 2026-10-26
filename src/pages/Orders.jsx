
import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";
function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");



useEffect(() => {
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const token = sessionStorage.getItem("access");

            if (!token) {
                throw new Error("Please login first");
            }

            const response = await apiFetch("/api/orders/my/", {
                method: "GET",
            });

            console.log("Status:", response.status);
            console.log("URL:", response.url);

            const contentType = response.headers.get("content-type");

            if (!contentType?.includes("application/json")) {
                const body = await response.text();
                console.error("Unexpected API response:", body);
                throw new Error(
                    `API returned ${response.status} instead of JSON`
                );
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Failed to fetch orders"
                );
            }

            setOrders(
                Array.isArray(data) ? data : data.results ?? []
            );

        } catch (error) {
            console.error("Orders API error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    fetchOrders();
}, []);

    if (loading) {
        return (
            <main className="p-4 md:p-8">
                <p className="text-slate-500">Loading orders...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-4 md:p-8">
                <p className="text-red-600">{error}</p>
            </main>
        );
    }

    if (orders.length === 0) {
        return (
            <main className="p-4 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900">
                    My Orders
                </h2>

                <p className="mt-4 text-slate-500">
                    You haven't placed any orders yet.
                </p>
            </main>
        );
    }

    return (
        <main className="p-4 md:p-8">
            <h2 className="text-2xl font-bold text-slate-900">
                My Orders
            </h2>

            <p className="mt-2 text-sm text-slate-500">
                Track your orders and payment status.
            </p>

            {orders.map((order) => (
                <div
                    key={order.id}
                    className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                    <h3 className="font-bold text-slate-900">
                        Order ID: {order.id}
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                        Date:{" "}
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                    </p>
                    {/* purchased Products */}
                    <div className="mt-4 border-t pt-4">
                        <h3 className="font-semibold mb-2">
                            Purchased Products
                        </h3>

                        {order.items?.length > 0 ? (
                            order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between py-2"
                                >
                                    <span>
                                        {item.product_name} × {item.quantity}
                                    </span>

                                    <span>
                                        ₹{(
                                            (item.price_paise * item.quantity) / 100
                                        ).toLocaleString("en-IN")}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500">
                                No item details available for this order.
                            </p>
                        )}
                    </div>


                    <p className="mt-4 font-semibold text-slate-900">
                        Total: ₹
                        {(order.amount_paise / 100).toLocaleString("en-IN")}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-4">
                        <div>
                            <p className="text-sm text-slate-500">
                                Payment Status
                            </p>

                            <span
                                className={`font-semibold ${order.payment_status === "paid"
                                    ? "text-green-600"
                                    : order.payment_status === "failed"
                                        ? "text-red-600"
                                        : "text-amber-600"
                                    }`}
                            >
                                {order.payment_status}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-slate-500">
                                Approval Status
                            </p>

                            <span
                                className={`font-semibold ${order.approval_status === "approved"
                                    ? "text-green-600"
                                    : order.approval_status === "rejected"
                                        ? "text-red-600"
                                        : "text-amber-600"
                                    }`}
                            >
                                {order.approval_status}
                            </span>
                        </div>
                    </div>
                </div>
            ))}

        </main>
    );
}

export default Orders;
