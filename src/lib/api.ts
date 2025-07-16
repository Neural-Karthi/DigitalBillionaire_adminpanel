// API configuration for admin panel
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://digitalbillionbackendcode-245452534397.europe-west1.run.app";

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
};

// Common API endpoints for admin
export const API_ENDPOINTS = {
  // Auth
  ADMIN_LOGIN: "/api/Admin/login",
  ADMIN_REGISTER: "/api/admin/register",

  // Dashboard
  DASHBOARD_STATS: "/api/Admin/dashboardstatics",

  // Products
  PRODUCTS: "/api/products",
  ADMIN_PRODUCTS: "/api/admin/products",
  PRODUCT_DETAIL: (id: string) => `/api/admin/products/${id}`,

  // Orders
  ORDERS: "/api/orders",
  ORDER_STATUS: (id: string) => `/api/orders/${id}/status`,

  // Users
  USERS: "/api/user/users",

  // Coupons
  ADMIN_COUPONS: "/api/admin/coupons",
  COUPON_DETAIL: (id: string) => `/api/admin/coupons/${id}`,

  // Upload
  UPLOAD: "/api/upload",

  // Notifications
  NOTIFICATIONS: "/api/notifications",
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function for API requests
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = buildApiUrl(endpoint);
  const headers = getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
};
