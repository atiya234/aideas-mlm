
import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductContext from "../Context/ProductContext";
import { ArrowLeft, Save, Package, Image as ImageIcon } from "lucide-react";

const AdminEditProduct = () => {
  const { products , setProducts } = useContext(ProductContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    description: "",
  });

  const product = products.find((item) => String(item.id) === id);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name ?? "",
        category: product.category ?? "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        image: product.image ?? "",
        description: product.description ?? "",
      });
    }
  }, [product]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleUpdateProduct = async() => {

  const productData = {
    ...formData,
    price_paise: Math.round(Number(formData.price)*100),
    stock: Number(formData.stock),
    roi_percent: product.roi_percent,
    roi_duration_working_days:product.roi_duration_working_days,

  };
  delete productData.price;
  const token = sessionStorage.getItem("access")
  const response = await fetch(
  `http://127.0.0.1:8001/api/products/${id}/`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  }
);
if(!response.ok){

 const errorData = await response.json();
 console.log("Update Failed:", errorData);
 return
}
const updatedData = await response.json();
console.log("Updated product:", updatedData);
  const updatedProducts = products.map((product) => {
    if (String(product.id) === id) {
      return {
        ...product,
        ...updatedData,
        price: Number(updatedData.price_paise) / 100
      };
    }

    return product;
  });

  setProducts(updatedProducts);
  navigate("/admin/products");
};

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
            <Package size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Edit Product
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update product information and inventory.
            </p>
          </div>
        </div>

        {product ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Form Heading */}
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <h2 className="text-lg font-bold text-slate-900">
                Product Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Edit the fields below.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              {/* Image Preview */}
              <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt={formData.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon size={28} className="text-slate-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="break-words font-semibold text-slate-900">
                    {formData.name || "Product Preview"}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formData.category || "No category selected"}
                  </p>
                  <p className="mt-2 text-lg font-bold text-indigo-600">
                    ₹{Number(formData.price || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">Select Category</option>
                    <option value="Skincare">Skincare</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Body Care">Body Care</option>
                    <option value="Personal Care">Personal Care</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>

                {/* Image */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/product.jpg"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
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
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-end gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/admin/products")}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={()=>handleUpdateProduct(product.id)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <h2 className="text-lg font-bold text-red-600">
              Product Not Found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              The selected product does not exist.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminEditProduct;
