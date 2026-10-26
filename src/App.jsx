
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { CartProvider } from "./Context/CartContext";
import { KYCProvider } from "./Context/KYCContext";
import { ProductProvider } from "./Context/ProductContext";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Referrals from "./pages/Referrals";
import Wallet from "./pages/Wallet";
import Investments from "./pages/Investments";
import KYC from "./pages/KYC";
import Withdrawals from "./pages/Withdrawals";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Notifications from "./pages/Notifications";

import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./layout/AdminLayout";

import AdminOrders from "./pages/AdminOrders";
import AdminProducts from "./pages/AdminProducts"
import AdminEditProduct from "./pages/AdminEditProduct";
import AdminReferralLevels from "./pages/AdminReferralLevels";
import AdminHolidays from "./pages/AdminHolidays";
import AdminNetwork from "./pages/AdminNetwork";
import AdminSupport from "./pages/AdminSupport";
import AdminAudit from "./pages/AdminAudit";


function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <CartProvider>
          <KYCProvider>
            <Routes>
              {/* Default Route */}
              <Route
                path="/"
                element={<Navigate to="/login" replace />}
              />

              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/referrals" element={<Referrals />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/investments" element={<Investments />} />
                  <Route path="/kyc" element={<KYC />} />
                  <Route path="/withdrawals" element={<Withdrawals />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/notifications" element={<Notifications />} />
                </Route>
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />

                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/edit/:id" element={<AdminEditProduct />} />
                <Route path="referral-levels" element={<AdminReferralLevels />} />
                <Route path="holidays" element={<AdminHolidays />} />
                <Route path="network" element={<AdminNetwork />} />
                <Route path="support" element={<AdminSupport />} />
                <Route path="audit" element={<AdminAudit />} />
              </Route>

              {/* Unknown Routes */}
              <Route
                path="*"
                element={<Navigate to="/login" replace />}
              />
            </Routes>
          </KYCProvider>
        </CartProvider>
      </ProductProvider>
    </BrowserRouter>
  );
}

export default App;
