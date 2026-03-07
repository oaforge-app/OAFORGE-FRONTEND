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
// ✅ ADD: queue for requests that arrive while refresh is in-flight
let failedQueue: { resolve: (v: any) => void; reject: (e: any) => void }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(null)));
  failedQueue = [];
};

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

    if (is401 && !original._retry && !isRefreshEndpoint && !isAuthEndpoint) {
      // ✅ CHANGE: queue instead of reject when refresh already in-flight
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
        // ✅ ADD: redirect on refresh failure (revoked/expired token)
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
