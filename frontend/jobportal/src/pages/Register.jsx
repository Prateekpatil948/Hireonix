import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "candidate",
        company_name: "",
        company_website: "",
        company_description: "",
    });

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false); // 👈 show/hide state

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await axiosClient.post("auth/register/", form);
            navigate("/login");
        } catch (err) {
            console.error(
                "REGISTER ERROR:",
                err.response ? err.response.data : err.message
            );
            if (err.response?.data) {
                const data = err.response.data;
                const firstKey = Object.keys(data)[0];
                const firstMsg = Array.isArray(data[firstKey])
                    ? data[firstKey][0]
                    : data[firstKey];
                setError(String(firstMsg));
            } else {
                setError("Registration failed. Please try again.");
            }
        }
    };

    const isRecruiter = form.role === "recruiter";

    return (
        <div className="auth-page">
            <div className="card auth-card">
                <h2 className="auth-title">Create an account</h2>
                <p className="auth-subtitle">
                    Choose your role and start using the job portal.
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
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            className="input"
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>

                        {/* 👇 same style as Login password field */}
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

                    <div className="form-group">
                        <label className="form-label" htmlFor="role">
                            Role
                        </label>
                        <select
                            id="role"
                            className="select"
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                        >
                            <option value="candidate">Candidate</option>
                            <option value="recruiter">Recruiter</option>
                        </select>
                    </div>

                    {isRecruiter && (
                        <>
                            <div className="form-group">
                                <label className="form-label" htmlFor="company_name">
                                    Company Name
                                </label>
                                <input
                                    id="company_name"
                                    className="input"
                                    name="company_name"
                                    value={form.company_name}
                                    onChange={handleChange}
                                    required={isRecruiter}
                                />
                            </div>

                            {/* You can later re-enable these if needed:
                            <div className="form-group">
                                <label className="form-label">Company Website</label>
                                <input
                                    className="input"
                                    name="company_website"
                                    value={form.company_website}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Company Description</label>
                                <textarea
                                    className="input"
                                    name="company_description"
                                    value={form.company_description}
                                    onChange={handleChange}
                                />
                            </div>
                            */}
                        </>
                    )}

                    <button className="btn btn-primary auth-submit-btn mt-3" type="submit">
                        Register
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
