
import { createContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {

    // Cart state
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Orders state
    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem("orders");
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    // Save cart in localStorage
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // Save orders in localStorage
    useEffect(() => {
        localStorage.setItem("orders", JSON.stringify(orders));
    }, [orders]);

   //add to cart
   const addToCart = (product) => {
    setCart((prevCart)=>{
        const alreadyAdded = prevCart.some((item)=>item.id === product.id);

        if (alreadyAdded){
            return prevCart.map((item)=>{
                if(item.id === product.id){
                    if ((item.quantity || 1) >= item.stock){
                        return item;
                    }
                    return {
                        ...item , quantity: (item.quantity || 1) + 1
                    }
                }
                return item;
            })
        }
        if (product.stock <= 0){
            return prevCart;
        }
        return [...prevCart, {...product , quantity: 1}];
    })
   }

    // Remove product from cart
    const removeCart = (productId) => {
        setCart((prevCart) =>
            prevCart.filter((item) => item.id !== productId)
        );
    };

    // Place order using Django backend
    //
    const placeOrder = async () => {
    if (cart.length === 0) {
        throw new Error("Your cart is empty");
    }

    const token = sessionStorage.getItem("access");

    if (!token) {
        throw new Error("Please login before placing an order");
    }

    const items = cart.map((item) => ({
        product_id: Number(item.id),
        quantity: item.quantity || 1
    }));

    const response = await fetch(
        "http://127.0.0.1:8001/api/orders/create/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ items })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            data.message ||
            data.detail ||
            "Failed to place order"
        );
    }

    if (!data.order_id) {
        throw new Error("Backend did not return an order ID");
    }

    const newOrder = {
        orderId: data.order_id,
        items: [...cart],
        totalPrice: data.total_amount_paise / 100,
        date: new Date().toISOString(),
        status: "Pending"
    };

    setOrders((prevOrders) => [...prevOrders, newOrder]);

    // Do not clear cart before payment verification.

    return data;
};



    // Cancel order (frontend only)
    const cancelOrder = (orderId) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.orderId === orderId
                    ? { ...order, status: "Cancelled" }
                    : order
            )
        );
    };

    // Admin approval (frontend only)
    const updateOrderStatus = (orderId, newStatus) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) => {
                if (
                    order.orderId === orderId &&
                    order.status === "Pending" &&
                    ["Approved", "Rejected"].includes(newStatus)
                ) {
                    return {
                        ...order,
                        status: newStatus
                    };
                }

                return order;
            })
        );
    };

    // Increase product quantity
    const increaseQuantity = (productId) => {
        setCart((prevCart) =>
            prevCart.map((item) =>{
                if(item.id === productId){
                    if(item.quantity >= item.stock){
                        return item
                    }
                    return {
                        ...item,
                        quantity: item.quantity + 1
                    }
                }
                return item;
            }

            )
        );
    };

    // Decrease product quantity
    const decreaseQuantity = (productId) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId
                    ? {
                        ...item,
                        quantity: Math.max(
                            1,
                            (item.quantity || 1) - 1
                        )
                    }
                    : item
            )
        );
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeCart,
                orders,
                placeOrder,
                cancelOrder,
                updateOrderStatus,
                increaseQuantity,
                decreaseQuantity
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export default CartContext;
