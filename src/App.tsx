import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { AdminLayout } from "@/components/shared/AdminLayout";
import { Login } from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import { Dashboard } from "@/pages/dashboard/Dashboard";
import { Products } from "@/pages/products/Products";
import { Orders } from "@/pages/orders/Orders";
import { Users } from "@/pages/users/Users";
import { Coupons } from "@/pages/coupons/Coupons";
import { Notifications } from "@/pages/Notifications";
import NotFound from "./pages/NotFound";
import Index from "./pages/products/index";
import Kycpage from "./pages/Kyc/KycIndex";
import Freelanceindex from "./pages/FreelanceHub/Freelanceindex";
import ContactUs from "./pages/contactus/contactus";
import Jobindex from "./pages/JobApplied/Jobindex";
import PaymentEnrollIndex from "./pages/PaymentEnroll/PaymentEnrollIndex";
import React from "react";

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
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="products" element={<Index />} />
                <Route path="Kyc" element={<Kycpage />} />
                <Route path="Freelance_Hub" element={<Freelanceindex />} />
                <Route path="ContactUs" element={<ContactUs />} />
                <Route path="Job_Applied" element={<Jobindex />} />
                <Route path="orders" element={<Orders />} />
                <Route path="users" element={<Users />} />
                <Route path="coupons" element={<Coupons />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="Payment_enroll" element={<PaymentEnrollIndex />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
