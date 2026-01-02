// src/api/axiosClient.js
import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://127.0.0.1:8000/api/",
});

// Attach token to every request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ⬇️ NEW: auto-logout when backend returns 401 (session/token expired)
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const url = error.config?.url || "";

        // Ignore 401 from login itself – let the login page show the error message
        if (status === 401 && !url.includes("auth/login")) {
            console.log("Session expired – logging out and redirecting to login.");
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
