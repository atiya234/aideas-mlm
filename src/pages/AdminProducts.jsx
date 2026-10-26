
import React, { useContext } from "react";
import ProductContext from "../Context/ProductContext";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

import {
    Package,
    Plus,
    Search,
    Boxes,
    IndianRupee,
    Image as ImageIcon,
} from "lucide-react";


const AdminProducts = () => {
    const { products, setProducts } = useContext(ProductContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        roi_percent: '0.50',
        roi_duration_working_days: 200,
        category: 'Skincare',
        description: '',
        image: '',
        stock: 0,
    })

    const totalStock = products.reduce(
        (total, product) => total + Number(product.stock || 0),
        0
    );





    const outOfStock = products.filter(
        (product) => Number(product.stock) <= 0
    ).length;
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev, [name]: value
        }))
    }
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (
            !formData.name.trim() ||

            !formData.price.trim() ||
            formData.stock === "" ||
            Number(formData.price) <= 0 ||
            !Number.isInteger(Number(formData.stock)) ||
            Number(formData.stock) < 0

        ) {
            alert("Please enter a valid product details");
            return;


        };
        const productData = {
            ...formData, price_paise: Math.round(Number(formData.price) * 100),
            stock: Number(formData.stock),
        };
        delete productData.price
        try {
            const token = sessionStorage.getItem("access");

            const response = await fetch("http://127.0.0.1:8001/api/products/", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, }, body: JSON.stringify(productData) })
            const data = await response.json();
            if (!response.ok) {
                console.log(data);
                return
            }
            console.log("Django created:", data);
            setProducts((prevProducts)=>[...prevProducts, {
                data, price:data.price_paise / 100,
            }])
            setFormData({
                name: "",
                price: "",
                roi_percent: "0.50",
                roi_duration_working_days: 200,
                category: "Skincare",
                description: "",
                image: "",
                stock: 0,
            })
        } catch (error) {
            console.log("Error adding Product:", error)
        }

        // const newProduct = {
        //     ...formData,
        //     id: crypto.randomUUID(),
        //     price: Number(formData.price),//convert into numbers
        //     stock: Number(formData.stock),
        // };
        // setProducts((prevProducts) => [...prevProducts, newProduct])


    }

    //Delete Products
    const handleDeleteProduct = async(pid) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete Product"
        )
        if(!confirmDelete)return;
        const token = sessionStorage.getItem("access")
        console.log("Token exists:", !!token);
        const response = await fetch(`http://127.0.0.1:8001/api/products/delete/${pid}/`, {method: "DELETE", headers: {"Content-Type": "application/json" ,  Authorization: `Bearer ${token}`, }})
        if(!response.ok){
            console.log(response)
            return;
        }
        const filteredProduct = products.filter((product)=>product.id !== pid)
        setProducts(filteredProduct)

    }

    return (
        <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl space-y-7">

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                            <Package size={17} />
                            Product Management
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Admin Products
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            Manage your platform's product catalog and inventory.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 self-start rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700">
                        <Boxes size={17} />
                        Product Catalog
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Total Products
                            </p>
                            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                                <Package size={20} />
                            </div>
                        </div>

                        <h2 className="mt-3 text-3xl font-bold text-slate-900">
                            {products.length}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                            Products in catalog
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Total Stock
                            </p>
                            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                                <Boxes size={20} />
                            </div>
                        </div>

                        <h2 className="mt-3 text-3xl font-bold text-slate-900">
                            {totalStock}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                            Units available
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">
                                Out of Stock
                            </p>
                            <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                                <Package size={20} />
                            </div>
                        </div>

                        <h2 className="mt-3 text-3xl font-bold text-slate-900">
                            {outOfStock}
                        </h2>
                        <p className="mt-1 text-xs text-slate-400">
                            Products needing restock
                        </p>
                    </div>
                </div>

                {/* Add Product Form - Static UI */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                                <Plus size={21} />
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Add New Product
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Enter product information below.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            {/* Product Name */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Product Name
                                </label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    type="text"
                                    placeholder="e.g. Vitamin C Face Serum"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Category
                                </label>
                                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    onChange={handleChange}
                                    value={formData.category}
                                    name="category"
                                >
                                    <option>Skincare</option>
                                    <option>Hair Care</option>
                                    <option>Body Care</option>
                                    <option>Personal Care</option>
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Product Price
                                </label>
                                <div className="relative">
                                    <IndianRupee
                                        size={17}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="number"
                                        name="price"
                                        onChange={handleChange}
                                        value={formData.price}
                                        min="0"
                                        placeholder="Enter price"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Stock Quantity
                                </label>
                                <input
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    type="number"
                                    min="0"
                                    placeholder="Enter available quantity"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>

                            {/* Image URL */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Product Image URL
                                </label>
                                <div className="relative">
                                    <ImageIcon
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        name="image"
                                        value={formData.image}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="https://example.com/product-image.jpg"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Product Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Write a short description of the product..."
                                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>

                        </div>

                        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                            <button
                                onClick={handleAddProduct}
                                type="button"
                                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                            >
                                <Plus size={18} />
                                Add Product
                            </button>
                        </div>
                    </div>
                </section>

                {/* Existing Products */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:px-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Existing Products
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                View products currently available on the platform.
                            </p>
                        </div>

                        <span className="self-start rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            {products.length} Products
                        </span>
                    </div>

                    <div className="p-5 sm:p-6">
                        {products.length === 0 ? (
                            <div className="py-12 text-center">
                                <Package
                                    size={38}
                                    className="mx-auto mb-3 text-slate-300"
                                />
                                <h3 className="font-semibold text-slate-700">
                                    No products available
                                </h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    Products will appear here once added.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-md"
                                    >
                                        <div className="flex gap-4 p-4">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-slate-400">
                                                        <ImageIcon size={24} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <span className="text-xs font-medium text-indigo-600">
                                                    {product.category}
                                                </span>

                                                <h3 className="mt-1 line-clamp-2 font-semibold text-slate-900">
                                                    {product.name}
                                                </h3>

                                                <p className="mt-2 text-lg font-bold text-slate-900">
                                                    ₹{Number(product.price).toLocaleString("en-IN")}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-3">
                                            <span className="text-xs text-slate-500">
                                                Available Stock
                                            </span>

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${Number(product.stock) > 0
                                                    ? "bg-emerald-50 text-emerald-700"
                                                    : "bg-rose-50 text-rose-700"
                                                    }`}
                                            >
                                                {Number(product.stock) > 0
                                                    ? `${product.stock} Units`
                                                    : "Out of Stock"}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}

                                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default AdminProducts;
