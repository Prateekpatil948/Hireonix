// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(
        () => localStorage.getItem("accessToken") || null
    );
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);

    const isAuthenticated = !!accessToken;

    const login = (token) => {
        setAccessToken(token);
        localStorage.setItem("accessToken", token);
    };

    const logout = () => {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
    };

    useEffect(() => {
        if (!accessToken) {
            setUser(null);
            return;
        }

        const fetchMe = async () => {
            try {
                setLoadingUser(true);
                // ➜ GET http://127.0.0.1:8000/api/auth/me/
                const res = await axiosClient.get("auth/me/");
                setUser(res.data);
            } catch (err) {
                console.error("Error fetching /auth/me:", err);
                setUser(null);

                if (err.response && err.response.status === 401) {
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
            value={{ accessToken, user, isAuthenticated, loadingUser, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
