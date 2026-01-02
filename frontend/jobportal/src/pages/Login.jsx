import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff, FiLogIn, FiUser, FiLock, FiArrowRight, FiAlertCircle } from "react-icons/fi";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

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
            setError("Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageContainerStyle}>
            {/* CSS for animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translateX(-20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>

            <div style={contentContainerStyle}>
                {/* Left Side - Brand/Info */}
                <div style={leftPanelStyle}>
                    <div style={brandContainerStyle}>
                        <div style={logoStyle}>
                            <FiLogIn size={40} />
                        </div>
                        <h1 style={brandTitleStyle}>
                            Welcome to <span style={brandHighlightStyle}>CareerFlow</span>
                        </h1>
                        <p style={brandSubtitleStyle}>
                            Sign in to access your personalized dashboard, job recommendations, 
                            and application tracking.
                        </p>
                        
                        <div style={featuresListStyle}>
                            <div style={featureItemStyle}>
                                <div style={featureIconStyle("#eef2ff", "#4f46e5")}>
                                    <FiArrowRight size={20} />
                                </div>
                                <div>
                                    <div style={featureTitleStyle}>Personalized Job Matches</div>
                                    <div style={featureDescriptionStyle}>AI-powered recommendations</div>
                                </div>
                            </div>
                            <div style={featureItemStyle}>
                                <div style={featureIconStyle("#fef3c7", "#d97706")}>
                                    <FiUser size={20} />
                                </div>
                                <div>
                                    <div style={featureTitleStyle}>Track Applications</div>
                                    <div style={featureDescriptionStyle}>Real-time status updates</div>
                                </div>
                            </div>
                            <div style={featureItemStyle}>
                                <div style={featureIconStyle("#d1fae5", "#059669")}>
                                    <FiLock size={20} />
                                </div>
                                <div>
                                    <div style={featureTitleStyle}>Secure & Private</div>
                                    <div style={featureDescriptionStyle}>Your data is protected</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div style={rightPanelStyle}>
                    <div style={loginCardStyle}>
                        {/* Header */}
                        <div style={loginHeaderStyle}>
                            <h2 style={loginTitleStyle}>
                                <FiLogIn size={24} style={{ marginRight: 12, color: '#4f46e5' }} />
                                Welcome Back 👋
                            </h2>
                            <p style={loginSubtitleStyle}>
                                Sign in to continue to your account
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={errorContainerStyle}>
                                <FiAlertCircle size={18} style={{ marginRight: 10, color: '#dc2626' }} />
                                <span style={errorTextStyle}>{error}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} style={loginFormStyle}>
                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiUser size={16} style={{ marginRight: 8, color: '#6b7280' }} />
                                    Username
                                </label>
                                <input
                                    style={formInputStyle}
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiLock size={16} style={{ marginRight: 8, color: '#6b7280' }} />
                                    Password
                                </label>
                                <div style={passwordWrapperStyle}>
                                    <input
                                        style={passwordInputStyle}
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        style={passwordToggleButtonStyle}
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        disabled={loading}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <FiEyeOff size={18} color="#6b7280" />
                                        ) : (
                                            <FiEye size={18} color="#6b7280" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={submitButtonStyle}
                            >
                                {loading ? (
                                    <>
                                        <div style={spinnerStyle}></div>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        <FiLogIn size={18} style={{ marginRight: 10 }} />
                                        Sign In
                                    </>
                                )}
                            </button>

                            {/* <div style={dividerStyle}>
                                <span style={dividerTextStyle}>or continue with</span>
                            </div> */}

                            <div style={alternativeOptionsStyle}>
                                <Link to="/register" style={registerLinkStyle}>
                                    <FiUser size={16} style={{ marginRight: 8 }} />
                                    Create new account
                                </Link>
                                <Link to="/forgot-password" style={forgotPasswordLinkStyle}>
                                    Forgot password?
                                </Link>
                            </div>
                        </form>

                      
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------- ENHANCED STYLES ---------- */

const pageContainerStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #fdf2f8 100%)",
    overflow: "hidden",
    backgroundImage: `
        radial-gradient(at 10% 20%, rgba(120, 119, 198, 0.1) 0px, transparent 50%),
        radial-gradient(at 90% 10%, rgba(255, 200, 221, 0.1) 0px, transparent 50%),
        radial-gradient(at 30% 80%, rgba(186, 230, 253, 0.1) 0px, transparent 50%)
    `,
    animation: "gradientShift 15s ease infinite",
    backgroundSize: "400% 400%",
};

const contentContainerStyle = {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    animation: "fadeIn 0.6s ease",
};

const leftPanelStyle = {
    flex: 1,
    maxWidth: 500,
    marginRight: 60,
    animation: "slideIn 0.8s ease",
};

const brandContainerStyle = {
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 40,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 25px 50px rgba(15, 23, 42, 0.12)",
};

const logoStyle = {
    width: 80,
    height: 80,
    borderRadius: 20,
    background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    marginBottom: 24,
    animation: "float 3s ease-in-out infinite",
};

const brandTitleStyle = {
    fontSize: 32,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 12,
    lineHeight: 1.2,
};

const brandHighlightStyle = {
    background: "linear-gradient(135deg, #4f46e5, #a855f7)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
};

const brandSubtitleStyle = {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 1.6,
    marginBottom: 32,
};

const featuresListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
};

const featureItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 16,
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(226, 232, 240, 0.7)",
    transition: "all 0.3s ease",
    ":hover": {
        transform: "translateY(-4px)",
        borderColor: "#8b5cf6",
        boxShadow: "0 12px 24px rgba(139, 92, 246, 0.15)",
    },
};

const featureIconStyle = (bgColor, color) => ({
    width: 48,
    height: 48,
    borderRadius: 12,
    background: bgColor,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
});

const featureTitleStyle = {
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 2,
};

const featureDescriptionStyle = {
    fontSize: 13,
    color: "#6b7280",
};

const rightPanelStyle = {
    flex: 1,
    maxWidth: 460,
    animation: "slideIn 0.8s ease 0.2s backwards",
};

const loginCardStyle = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 40,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 25px 50px rgba(15, 23, 42, 0.15)",
    animation: "fadeIn 0.6s ease",
};

const loginHeaderStyle = {
    marginBottom: 32,
    textAlign: "center",
};

const loginTitleStyle = {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const loginSubtitleStyle = {
    fontSize: 14,
    color: "#6b7280",
    margin: 0,
};

const errorContainerStyle = {
    padding: "14px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    border: "1px solid #fecaca",
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    marginBottom: 24,
    animation: "fadeIn 0.3s ease",
};

const errorTextStyle = {
    color: "#b91c1c",
};

const loginFormStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
};

const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const formLabelStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    display: "flex",
    alignItems: "center",
};

const formInputStyle = {
    padding: "14px 18px",
    borderRadius: 12,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    fontSize: 15,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.95)",
    outline: "none",
    ":focus": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.15)",
        background: "#fff",
    },
    ":disabled": {
        background: "#f9fafb",
        color: "#9ca3af",
        cursor: "not-allowed",
    },
    "::placeholder": {
        color: "#9ca3af",
    },
};

const passwordWrapperStyle = {
    position: "relative",
};

const passwordInputStyle = {
    width: "100%",
    padding: "14px 50px 14px 18px",
    borderRadius: 12,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    fontSize: 15,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.95)",
    outline: "none",
    ":focus": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.15)",
        background: "#fff",
    },
    ":disabled": {
        background: "#f9fafb",
        color: "#9ca3af",
        cursor: "not-allowed",
    },
    "::placeholder": {
        color: "#9ca3af",
    },
};

const passwordToggleButtonStyle = {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderRadius: 8,
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(209, 213, 219, 0.2)",
    },
    ":disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
    },
};

const submitButtonStyle = {
    padding: "16px 24px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 12px 32px rgba(139, 92, 246, 0.6)",
    },
    ":disabled": {
        opacity: 0.7,
        cursor: "not-allowed",
        transform: "none",
        boxShadow: "none",
    },
};

const spinnerStyle = {
    width: 20,
    height: 20,
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginRight: 12,
};

const dividerStyle = {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
    "::before, ::after": {
        content: '""',
        flex: 1,
        height: 1,
        background: "rgba(226, 232, 240, 0.8)",
    },
};

const dividerTextStyle = {
    padding: "0 16px",
    fontSize: 13,
    color: "#9ca3af",
    fontWeight: 500,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
};

const alternativeOptionsStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
};

const registerLinkStyle = {
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    borderRadius: 10,
    border: "1px solid rgba(139, 92, 246, 0.3)",
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.3s ease",
    ":hover": {
        background: "rgba(139, 92, 246, 0.2)",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.2)",
    },
};

const forgotPasswordLinkStyle = {
    color: "#6b7280",
    fontSize: 13,
    textDecoration: "none",
    transition: "all 0.2s ease",
    ":hover": {
        color: "#4f46e5",
        textDecoration: "underline",
    },
};

const demoHintStyle = {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
    background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
    border: "1px solid rgba(186, 230, 253, 0.8)",
    animation: "fadeIn 0.6s ease",
};

const demoHintHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
};

const demoAccountsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const demoAccountStyle = {
    fontSize: 13,
    lineHeight: 1.5,
    padding: 8,
    borderRadius: 8,
    background: "rgba(255, 255, 255, 0.7)",
    border: "1px solid rgba(226, 232, 240, 0.5)",
};

// Add spin animation
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @media (max-width: 1024px) {
        ${JSON.stringify(contentContainerStyle)} {
            flex-direction: column;
            padding: 20px;
            gap: 40px;
        }
        
        ${JSON.stringify(leftPanelStyle)} {
            margin-right: 0;
            max-width: 100%;
        }
        
        ${JSON.stringify(rightPanelStyle)} {
            max-width: 100%;
        }
        
        ${JSON.stringify(brandContainerStyle)} {
            padding: 30px;
        }
        
        ${JSON.stringify(loginCardStyle)} {
            padding: 30px;
        }
    }
    
    @media (max-width: 768px) {
        ${JSON.stringify(brandTitleStyle)} {
            font-size: 26px;
        }
        
        ${JSON.stringify(loginTitleStyle)} {
            font-size: 24px;
        }
        
        ${JSON.stringify(featureItemStyle)} {
            padding: 12px;
        }
        
        ${JSON.stringify(featureIconStyle("#eef2ff", "#4f46e5"))} {
            width: 40px;
            height: 40px;
        }
    }
    
    @media (max-width: 480px) {
        ${JSON.stringify(pageContainerStyle)} {
            background-size: 200% 200%;
        }
        
        ${JSON.stringify(contentContainerStyle)} {
            padding: 16px;
        }
        
        ${JSON.stringify(brandContainerStyle)} {
            padding: 24px;
        }
        
        ${JSON.stringify(loginCardStyle)} {
            padding: 24px;
        }
        
        ${JSON.stringify(submitButtonStyle)} {
            padding: 14px 20px;
        }
        
        ${JSON.stringify(alternativeOptionsStyle)} {
            flex-direction: column;
            align-items: stretch;
        }
    }
`;
document.head.appendChild(styleSheet);

export default Login; 