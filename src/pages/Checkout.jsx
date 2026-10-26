import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "../Context/CartContext";
import { apiFetch } from "../api/apiFetch";

function Checkout() {
    const { cart, placeOrder } = useContext(CartContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const totalPrice = cart.reduce(
        (total, product) =>
            total + Number(product.price) * (product.quantity || 1),
        0
    );

    const postAPI = async (url, body) => {
        const response = await apiFetch(`/api${url}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                data.detail ||
                "Something went wrong"
            );
        }

        return data;
    };

    const handlePlaceOrder = async () => {
        if (cart.length === 0 || loading) return;

        if (!window.Razorpay) {
            alert("Razorpay is not loaded. Please refresh.");
            return;
        }

        setLoading(true);

        try {
            // 1. Create Django order
            const newOrder = await placeOrder();

            const djangoOrderId =
                newOrder.order_id ?? newOrder.id;

            if (!djangoOrderId) {
                throw new Error(
                    "Order created but order ID was not returned"
                );
            }

            // 2. Create Razorpay order
            const razorpayOrder = await postAPI(
                "/orders/razorpay/create/",
                { order_id: djangoOrderId }
            );

            console.log("Razorpay order details:", {
                order_id: razorpayOrder.razorpay_order_id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key_prefix: razorpayOrder.key?.slice(0, 9),
            });

            // 3. Open Razorpay checkout
            const options = {
                key: razorpayOrder.key,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: "AIDEAS MLM",
                description: "Product Purchase",
                order_id: razorpayOrder.razorpay_order_id,

                handler: async function (response) {
                    try {
                        // 4. Verify payment in Django
                        await postAPI(
                            "/orders/razorpay/verify/",
                            {
                                order_id: djangoOrderId,
                                razorpay_order_id:
                                    response.razorpay_order_id,
                                razorpay_payment_id:
                                    response.razorpay_payment_id,
                                razorpay_signature:
                                    response.razorpay_signature,
                            }
                        );

                        alert(
                            "Payment successful! Waiting for admin approval."
                        );

                        navigate("/orders");

                    } catch (error) {
                        console.error(
                            "Payment verification error:",
                            error
                        );

                        alert(
                            "Payment was submitted, but verification could not be completed. Check your orders before retrying."
                        );

                        navigate("/orders");

                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: function () {
                        setLoading(false);
                        alert(
                            "Payment cancelled. Your order is still pending."
                        );
                        navigate("/orders");
                    },
                },

                theme: {
                    color: "#2563eb",
                },
            };

            const razorpay = new window.Razorpay(options);

            razorpay.on("payment.failed", function (response) {
                console.error(
                    "Razorpay payment failed:",
                    response.error
                );

                alert(
                    "Payment failed. Please check your order before trying again."
                );
            });

            razorpay.open();

        } catch (error) {
            console.error("Checkout error:", error);

            alert(
                error.message ||
                "Unable to start payment"
            );

            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
            <div className="mx-auto max-w-4xl">

                <h1 className="text-3xl font-bold text-slate-900">
                    Checkout
                </h1>

                <p className="mt-2 text-slate-500">
                    Review your order before placing it.
                </p>

                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">

                    <h2 className="text-xl font-bold text-slate-900">
                        Order Summary
                    </h2>

                    {cart.length === 0 ? (
                        <p className="mt-5 text-slate-500">
                            Your cart is empty.
                        </p>
                    ) : (
                        cart.map((product) => (
                            <div
                                key={product.id}
                                className="mt-4 flex justify-between gap-4 border-b border-slate-100 pb-4"
                            >
                                <span className="text-slate-600">
                                    {product.name} × {product.quantity || 1}
                                </span>

                                <span className="font-semibold text-slate-900">
                                    ₹{(
                                        Number(product.price) *
                                        (product.quantity || 1)
                                    ).toLocaleString("en-IN")}
                                </span>
                            </div>
                        ))
                    )}

                    <div className="mt-5 flex justify-between text-lg font-bold">
                        <span>Total</span>

                        <span>
                            ₹{totalPrice.toLocaleString("en-IN")}
                        </span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">

                        <Link
                            to="/cart"
                            className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Back to Cart
                        </Link>

                        <button
                            type="button"
                            onClick={handlePlaceOrder}
                            disabled={cart.length === 0 || loading}
                            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Processing..."
                                : "Pay with Razorpay"}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
