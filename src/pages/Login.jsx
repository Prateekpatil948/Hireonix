import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // 👈 for show/hide

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            // 1️⃣ Login request
            const res = await axiosClient.post("auth/login/", {
                username: form.username,
                password: form.password,
            });

            const accessToken = res.data.access;

            // 2️⃣ Store token using your existing auth logic
            login(accessToken);

            // 3️⃣ Fetch user details to get role
            try {
                const meRes = await axiosClient.get("auth/me/", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                const role = meRes.data.role;

                if (role === "recruiter") {
                    navigate("/recruiter/dashboard", { replace: true });
                } else if (role === "candidate") {
                    navigate("/jobs", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            } catch (meErr) {
                console.error("FETCH /auth/me ERROR:", meErr.response?.data || meErr.message);
                navigate("/", { replace: true });
            }
        } catch (err) {
            console.error("LOGIN ERROR:", err.response?.data || err.message);
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h2 className="auth-title">Welcome back 👋</h2>
                <p className="auth-subtitle">
                    Sign in to continue posting jobs and managing applications.
                </p>

                {error && <p className="error-text">{error}</p>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">
                            Username
                        </label>
                        <input
                            id="username"
                            className="input"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            placeholder="Enter your username"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>

                        {/* Password + toggle */}
                        <div className="password-wrapper">
                            <input
                                id="password"
                                className="input password-input"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                            />

                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <span className="password-toggle-icon">
                                    {showPassword ? "🙈" : "👁️"}
                                </span>
                                {/* <span className="password-toggle-text">
                                    {showPassword ? "Hide" : "Show"}
                                </span> */}
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-primary auth-submit-btn" type="submit">
                        Login
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="auth-link">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
