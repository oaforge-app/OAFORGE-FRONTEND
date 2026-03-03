import axios from "axios";
import qs from "qs";

export const axiosServices = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // sends httpOnly cookies automatically
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
  },
});


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
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
