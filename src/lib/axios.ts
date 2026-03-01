// src/lib/axios.ts
//
// ROOT CAUSE OF THE LOOP:
// The old interceptor did: window.location.href = '/login' on 401.
// This causes a full page reload → ProtectedRoute mounts → calls useUser()
// → hits /auth/me → gets 401 → interceptor fires again → redirect → reload → repeat.
//
// FIX: Never do window.location inside the axios interceptor.
// Just reject the error and let the calling code / ProtectedRoute handle it.
// ProtectedRoute will see user=null and navigate() to /login cleanly (no reload).

import axios from "axios";
import qs from "qs";

export const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // sends httpOnly cookies automatically
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  },
});

// Track whether a refresh is already in flight to avoid parallel refresh calls
let isRefreshing = false;

axiosServices.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = original?.url?.includes("/auth/refresh-token");
    const isAuthEndpoint =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/register") ||
      original?.url?.includes("/auth/logout");

    // Attempt a silent token refresh ONCE per original request
    if (is401 && !original._retry && !isRefreshEndpoint && !isAuthEndpoint) {
      if (isRefreshing) {
        // Another refresh already in flight — just reject so we don't double-refresh
        return Promise.reject(error);
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await axiosServices.get("/auth/refresh-token");
        isRefreshing = false;
        // Retry the original request with the refreshed cookie
        return axiosServices(original);
      } catch {
        isRefreshing = false;
        // Refresh failed — reject the error.
        // DO NOT do window.location.href here.
        // ProtectedRoute will handle the redirect via React Router navigate().
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);