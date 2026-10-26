
import { useContext } from "react";
import { Link } from "react-router-dom";
import CartContext from "../Context/CartContext";


const Cart = () => {
    const { cart, removeCart, increaseQuantity, decreaseQuantity } = useContext(CartContext);

    const totalPrice = cart.reduce(
        (total, product) =>
            total + Number(product.price) * (product.quantity || 1),
        0
    );
    const totalItems = cart.reduce(
        (total, product) => total + (product.quantity || 1),
        0
    );

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-8">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            My Cart
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Review your selected products.
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="rounded-xl border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-white"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {cart.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                        <h2 className="text-xl font-semibold text-slate-800">
                            Your cart is empty
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Explore our products and add your favourites.
                        </p>

                        <Link
                            to="/products"
                            className="mt-6 inline-block rounded-xl bg-slate-900 px-6 py-3 font-medium text-white hover:bg-slate-700"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">

                        <div className="space-y-4 lg:col-span-2">
                            {cart.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
                                >
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="h-28 w-full rounded-xl object-cover sm:w-32"
                                    />

                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            {product.name}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {product.category}
                                        </p>

                                        <p className="mt-3 font-bold text-slate-900">
                                            ₹{Number(product.price).toLocaleString("en-IN")}
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <button
                                                onClick={() => decreaseQuantity(product.id)}
                                                disabled={(product.quantity || 1) <= 1}
                                                className="rounded-lg border border-slate-300 px-3 py-1 font-bold disabled:opacity-40"
                                            >
                                                −
                                            </button>

                                            <span className="font-semibold">
                                                {product.quantity || 1}
                                            </span>

                                            <button
                                                onClick={() => increaseQuantity(product.id)}
                                                className="rounded-lg border border-slate-300 px-3 py-1 font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => removeCart(product.id)}
                                        className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6">
                            <h2 className="text-xl font-bold text-slate-900">
                                Order Summary
                            </h2>

                            <div className="mt-5 flex justify-between text-slate-600">
                                <span>Items</span>
                                <span>{totalItems}</span>

                            </div>

                            <div className="mt-4 flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>
                                    ₹{Number(totalPrice).toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="my-5 border-t border-slate-200" />

                            <div className="flex justify-between text-lg font-bold text-slate-900">
                                <span>Total</span>
                                <span>
                                    ₹{Number(totalPrice).toLocaleString("en-IN")}
                                </span>
                            </div>

                            <Link
                                to="/checkout"
                                className="mt-6 flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
                            >
                                Proceed to Checkout
                            </Link>



                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
