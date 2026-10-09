
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Heart,
  Package,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import productsData from "../data/products.json";

const categories = [
  "All Products",
  "Skincare",
  "Hair Care",
  "Body Care",
  "Personal Care",
];

const Products = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Products");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState([]);
  const [wishList, setWishList] = useState([]);

  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All Products" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "name-az") return a.name.localeCompare(b.name);
    if (sort === "name-za") return b.name.localeCompare(a.name);
    return 0;
  });

  const addToCart = (product) => {
    setCart((prevCart) => {
      const alreadyAdded = prevCart.some(
        (item) => item.id === product.id
      );

      if (alreadyAdded) return prevCart;

      return [...prevCart, product];
    });
  };

  const deleteCart = (pid) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== pid)
    );
  };

  const addToWishList = (product) => {
    setWishList((prevWish) => {
      const alreadyAdded = prevWish.some(
        (item) => item.id === product.id
      );

      if (alreadyAdded) return prevWish;

      return [...prevWish, product];
    });
  };

  const removeWishList = (pid) => {
    setWishList((prevWish) =>
      prevWish.filter((item) => item.id !== pid)
    );
  };

  const formatPrice = (price) =>
    `₹${price.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
              <Sparkles size={16} />
              Product Catalog
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Explore Products
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Discover products available on the AIdeas platform.
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Demo catalog · Sample prices and stock
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <ShoppingCart size={19} className="text-indigo-600" />
              <div>
                <p className="text-xs text-slate-500">Cart items</p>
                <p className="font-bold">{cart.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Heart size={19} className="text-rose-500" />
              <div>
                <p className="text-xs text-slate-500">Wishlist</p>
                <p className="font-bold">{wishList.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and sorting */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="relative md:w-60">
              <ArrowUpDown
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-az">Name: A-Z</option>
                <option value="name-za">Name: Z-A</option>
              </select>
            </div>
          </div>

          {/* Category filters */}
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <SlidersHorizontal size={16} />
              Categories
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    category === item
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Product results */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {category}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {sortedProducts.length} products found
            </p>
          </div>

          <Package size={22} className="text-slate-400" />
        </div>

        {sortedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <Search
              size={36}
              className="mx-auto mb-4 text-slate-300"
            />
            <h3 className="text-lg font-semibold text-slate-800">
              No products found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try another search term or category.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All Products");
              }}
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedProducts.map((product) => {
              const inCart = cart.some(
                (item) => item.id === product.id
              );

              const inWishlist = wishList.some(
                (item) => item.id === product.id
              );

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
                >
                  {/* Product image */}
                  <div className="relative overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
                      {product.category}
                    </span>

                    <button
                      onClick={() =>
                        inWishlist
                          ? removeWishList(product.id)
                          : addToWishList(product)
                      }
                      aria-label={
                        inWishlist
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      title={
                        inWishlist
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${
                        inWishlist
                          ? "bg-rose-500 text-white"
                          : "bg-white/95 text-slate-600 hover:bg-rose-50 hover:text-rose-500"
                      }`}
                    >
                      <Heart
                        size={19}
                        fill={inWishlist ? "currentColor" : "none"}
                      />
                    </button>
                  </div>

                  {/* Product details */}
                  <div className="p-4">
                    <h3 className="min-h-12 text-base font-bold leading-6 text-slate-900">
                      {product.name}
                    </h3>

                    <p className="mt-1 min-h-10 text-sm leading-5 text-slate-500">
                      {product.description}
                    </p>

                    <div className="mt-4 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate-400">
                          Product price
                        </p>
                        <p className="mt-1 text-xl font-bold text-slate-900">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          product.stock > 0
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>

                    {/* Cart actions */}
                    <div className="mt-5 space-y-2">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={inCart || product.stock <= 0}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          inCart || product.stock <= 0
                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                            : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]"
                        }`}
                      >
                        {inCart ? (
                          <>
                            <Check size={17} />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={17} />
                            Add to Cart
                          </>
                        )}
                      </button>

                      {inCart && (
                        <button
                          onClick={() => deleteCart(product.id)}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        >
                          Remove from Cart
                        </button>
                      )}

                      <button
                        onClick={() =>
                          inWishlist
                            ? removeWishList(product.id)
                            : addToWishList(product)
                        }
                        className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                          inWishlist
                            ? "border-rose-200 bg-rose-50 text-rose-600"
                            : "border-slate-200 text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                        }`}
                      >
                        <span className="inline-flex items-center justify-center gap-2">
                          <Heart
                            size={16}
                            fill={inWishlist ? "currentColor" : "none"}
                          />
                          {inWishlist
                            ? "Remove from Wishlist"
                            : "Add to Wishlist"}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <p className="mt-8 text-center text-xs leading-5 text-slate-400">
          Product information and prices are demonstration data.
          Cart and wishlist changes are currently stored in page state.
        </p>
      </main>
    </div>
  );
};

export default Products;
