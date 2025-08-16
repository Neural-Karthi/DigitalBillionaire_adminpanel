import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import { AdminLayout } from "@/components/shared/AdminLayout";
import { Login } from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import { Dashboard } from "@/pages/dashboard/Dashboard";

import { Users } from "@/pages/users/Users"

import { Coupons } from "@/pages/coupons/Coupons";
import { Notifications } from "@/pages/Notifications";
import NotFound from "./pages/NotFound";
import Index from "./pages/products/index";
import Kycpage from "./pages/Kyc/KycIndex";
import Freelanceindex from "./pages/FreelanceHub/Freelanceindex";
import ContactUs from "./pages/contactus/contactus";
import Jobindex from "./pages/JobApplied/Jobindex";
import PaymentEnrollIndex from "./pages/PaymentEnroll/PaymentEnrollIndex";
import {Webinarindex} from './pages/webinar/Webinarindex';
import {MarketingIndex} from './pages/MarketingCenter/MarketingIndex'
import Fundaccount from "./pages/FundAccount/Fundaccount";
import React from "react";
import { Rollout_index } from "./pages/Rollout_payment/Rollout_index";

const queryClient = new QueryClient();

// ✅ LocalStorage Role Guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("admin_token");
  const user = localStorage.getItem("admin_user");

  if (!token || !user) return <Navigate to="/login" replace />;

  try {
    const parsed = JSON.parse(user);
    if (parsed?.role !== "admin") return <Navigate to="/login" replace />;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
       
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route  path="/*"  element={ <ProtectedRoute> <AdminLayout /> </ProtectedRoute> }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Index />} />
                <Route path="Kyc" element={<Kycpage />} />
                <Route path="Freelance_Hub" element={<Freelanceindex />} />
                <Route path="ContactUs" element={<ContactUs />} />
                <Route path="Job_Applied" element={<Jobindex />} />
                <Route path="users" element={<Users />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="Payment_enroll" element={<PaymentEnrollIndex />} />
                <Route path="webinar" element={<Webinarindex />} />
                <Route path="marketing-center" element={<MarketingIndex />} />
                <Route path="Fund_account" element={<Fundaccount />} />
                <Route path="Rollout_Payout" element={<Rollout_index />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
