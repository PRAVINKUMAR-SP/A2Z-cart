import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MobileBottomNav from '../components/layout/MobileBottomNav';

// Pages
import LandingPage from '../pages/public/LandingPage';
import ShopPage from '../pages/public/ShopPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import SellerOnboardingPage from '../pages/public/SellerOnboardingPage';

import CartPage from '../pages/buyer/CartPage';
import CheckoutPage from '../pages/buyer/CheckoutPage';
import OrdersPage from '../pages/buyer/OrdersPage';
import BuyerDashboard from '../pages/buyer/BuyerDashboard';

import SellerDashboard from '../pages/seller/SellerDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

import { useAuthStore } from '../store/authStore';

export default function AppRoutes() {
  const { user, isAuthenticated } = useAuthStore();
  const isUserLoggedIn = Boolean(isAuthenticated && user);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAFC]">
      <Navbar />

      <main className={`flex-1 ${isUserLoggedIn ? 'pb-16 md:pb-0' : 'pb-0'}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller-onboarding" element={<SellerOnboardingPage />} />

          {/* Buyer Portals */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/buyer/orders" element={<OrdersPage />} />
          <Route path="/buyer/dashboard" element={<BuyerDashboard />} />

          {/* Seller Portal */}
          <Route path="/seller/dashboard" element={<SellerDashboard />} />

          {/* Admin Control Center */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      {isUserLoggedIn && <MobileBottomNav />}
    </div>
  );
}
