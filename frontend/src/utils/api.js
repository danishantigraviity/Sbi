import axios from "axios";
import { store } from "../store";
import { logout } from "../slices/authSlice";

// Set Base URL from environment variables
// - In development/proxy, we use '' (since components already prefix with '/api')
// - In production/cross-domain, we use the full VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || "";
axios.defaults.baseURL = API_URL;

// Add a request interceptor to inject the auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Global Axios response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      // Clear the session — this will trigger the router to redirect to /login
      store.dispatch(logout());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    return Promise.reject(error);
  },
);

export default axios;
