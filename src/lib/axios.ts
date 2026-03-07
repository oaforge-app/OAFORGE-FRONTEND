import axios from "axios";
import qs from "qs";

export const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  },
});

let isRefreshing = false;
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

axiosServices.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // ← Skip interceptor entirely for flagged requests (e.g. AuthGate /auth/me check)
    // These handle their own 401 and should never trigger a redirect
    if (original?._skipInterceptor) {
      return Promise.reject(error);
    }

    const is401 = error.response?.status === 401;
    const isRefreshEndpoint = original?.url?.includes("/auth/refresh-token");
    const isAuthEndpoint =
      original?.url?.includes("/auth/login") ||
      original?.url?.includes("/auth/register") ||
      original?.url?.includes("/auth/logout");

    if (is401 && !original._retry && !isRefreshEndpoint && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosServices(original))
          .catch((e) => Promise.reject(e));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        await axiosServices.get("/auth/refresh-token");
        processQueue(null);
        return axiosServices(original);
      } catch (refreshError) {
        processQueue(refreshError);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);