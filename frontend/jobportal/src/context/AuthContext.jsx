// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import {
  fetchJobNotifications,
  fetchApplicationStatusNotifications,
} from "../api/alerts";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("accessToken") || null
  );
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // 🔔 GLOBAL unread notification count
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const isAuthenticated = !!accessToken;

  /* ================= LOAD UNREAD COUNT ================= */

  const loadUnreadNotifications = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetchJobNotifications(),
        fetchApplicationStatusNotifications(),
      ]);

      const unreadJobs = (jobsRes.data || []).filter(
        (n) => !n.is_read
      ).length;
      const unreadApps = (appsRes.data || []).filter(
        (n) => !n.is_read
      ).length;

      setUnreadNotifications(unreadJobs + unreadApps);
    } catch (err) {
      console.error("Failed to load unread notifications:", err);
    }
  };

  /* ================= AUTH ================= */

  const login = (token) => {
    setAccessToken(token);
    localStorage.setItem("accessToken", token);
    // ⬅️ unread count will load via effect below
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    setUnreadNotifications(0);
    localStorage.removeItem("accessToken");
  };

  /* ================= FETCH USER ================= */

  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      return;
    }

    const fetchMe = async () => {
      try {
        setLoadingUser(true);
        const res = await axiosClient.get("auth/me/");
        setUser(res.data);

        // 🔔 LOAD UNREAD NOTIFICATIONS AFTER LOGIN / REFRESH
        loadUnreadNotifications();
      } catch (err) {
        console.error("Error fetching /auth/me:", err);
        if (err.response?.status === 401) {
          logout();
          window.location.href = "/login";
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchMe();
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isAuthenticated,
        loadingUser,
        login,
        logout,

        // 🔔 notifications
        unreadNotifications,
        setUnreadNotifications,
        loadUnreadNotifications, // optional for future use
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
