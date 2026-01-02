import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiBriefcase, FiArrowRight, FiAlertCircle } from "react-icons/fi";

const Register = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "candidate",
        company_name: "",
    });

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Prepare data to send
        const dataToSend = {
            username: form.username,
            email: form.email,
            password: form.password,
            role: form.role,
        };

        // Only add company_name if role is recruiter
        if (form.role === "recruiter") {
            dataToSend.company_name = form.company_name;
        }

        try {
            await axiosClient.post("auth/register/", dataToSend);
            navigate("/login", { 
                replace: true,
                state: { message: "Registration successful! Please login." }
            });
        } catch (err) {
            console.error("REGISTER ERROR:", err.response?.data || err.message);
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
        } finally {
            setLoading(false);
        }
    };

    const isRecruiter = form.role === "recruiter";

    return (
        <div style={pageContainerStyle}>
            {/* CSS for animations and responsive styles */}
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
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Responsive styles */
                @media (max-width: 1024px) {
                    .content-container {
                        flex-direction: column !important;
                        padding: 20px !important;
                        gap: 40px !important;
                    }
                    
                    .left-panel {
                        margin-right: 0 !important;
                        max-width: 100% !important;
                    }
                    
                    .right-panel {
                        max-width: 100% !important;
                    }
                    
                    .brand-container {
                        padding: 30px !important;
                    }
                    
                    .register-card {
                        padding: 30px !important;
                    }
                    
                    .form-grid {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                }
                
                @media (max-width: 768px) {
                    .brand-title {
                        font-size: 26px !important;
                    }
                    
                    .register-title {
                        font-size: 24px !important;
                    }
                    
                    .feature-item {
                        padding: 12px !important;
                    }
                    
                    .role-selector {
                        grid-template-columns: 1fr !important;
                    }
                    
                    .feature-icon {
                        width: 40px !important;
                        height: 40px !important;
                    }
                    
                    .register-card {
                        padding: 24px !important;
                    }
                    
                    .brand-container {
                        padding: 24px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .page-container {
                        background-size: 200% 200% !important;
                    }
                    
                    .content-container {
                        padding: 16px !important;
                    }
                    
                    .brand-container {
                        padding: 20px !important;
                    }
                    
                    .register-card {
                        padding: 20px !important;
                    }
                    
                    .submit-button {
                        padding: 14px 20px !important;
                    }
                    
                    .alternative-options {
                        flex-direction: column !important;
                        align-items: stretch !important;
                    }
                }
            `}</style>

            <div style={contentContainerStyle} className="content-container">
                {/* Left Side - Brand/Info */}
                <div style={leftPanelStyle} className="left-panel">
                    <div style={brandContainerStyle} className="brand-container">
                        <div style={logoStyle}>
                            <FiUser size={40} />
                        </div>
                        <h1 style={brandTitleStyle} className="brand-title">
                            Join <span style={brandHighlightStyle}>CareerFlow</span>
                        </h1>
                        <p style={brandSubtitleStyle}>
                            Create your account to unlock personalized job matching, 
                            application tracking, and career growth opportunities.
                        </p>
                        
                        <div style={featuresListStyle}>
                            <div style={featureItemStyle} className="feature-item">
                                <div style={featureIconStyle("#eef2ff", "#4f46e5")} className="feature-icon">
                                    <FiBriefcase size={20} />
                                </div>
                                <div>
                                    <div style={featureTitleStyle}>For Candidates</div>
                                    <div style={featureDescriptionStyle}>Find your dream job</div>
                                </div>
                            </div>
                            <div style={featureItemStyle} className="feature-item">
                                <div style={featureIconStyle("#fef3c7", "#d97706")} className="feature-icon">
                                    <FiUser size={20} />
                                </div>
                                <div>
                                    <div style={featureTitleStyle}>For Recruiters</div>
                                    <div style={featureDescriptionStyle}>Hire top talent</div>
                                </div>
                            </div>
                            <div style={featureItemStyle} className="feature-item">
                                <div style={featureIconStyle("#d1fae5", "#059669")} className="feature-icon">
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

                {/* Right Side - Register Form */}
                <div style={rightPanelStyle} className="right-panel">
                    <div style={registerCardStyle} className="register-card">
                        {/* Header */}
                        <div style={registerHeaderStyle}>
                            <h2 style={registerTitleStyle} className="register-title">
                                <FiUser size={24} style={{ marginRight: 12, color: '#8b5cf6' }} />
                                Create Account 🚀
                            </h2>
                            <p style={registerSubtitleStyle}>
                                Choose your role and start your journey
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={errorContainerStyle}>
                                <FiAlertCircle size={18} style={{ marginRight: 10, color: '#dc2626' }} />
                                <span style={errorTextStyle}>{error}</span>
                            </div>
                        )}

                        {/* Register Form */}
                        <form onSubmit={handleSubmit} style={registerFormStyle}>
                            <div style={formGridStyle} className="form-grid">
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
                                        placeholder="Choose a username"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>
                                        <FiMail size={16} style={{ marginRight: 8, color: '#6b7280' }} />
                                        Email
                                    </label>
                                    <input
                                        style={formInputStyle}
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
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
                                        placeholder="Create a strong password"
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

                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiBriefcase size={16} style={{ marginRight: 8, color: '#6b7280' }} />
                                    I want to join as a
                                </label>
                                <div style={roleSelectorStyle} className="role-selector">
                                    <button
                                        type="button"
                                        style={roleButtonStyle(form.role === "candidate")}
                                        onClick={() => setForm({...form, role: "candidate"})}
                                        disabled={loading}
                                    >
                                        <div style={roleIconStyle("#eef2ff", "#4f46e5")}>
                                            <FiUser size={20} />
                                        </div>
                                        <div style={roleContentStyle}>
                                            <div style={roleTitleStyle}>Candidate</div>
                                            <div style={roleDescriptionStyle}>Looking for jobs</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        style={roleButtonStyle(form.role === "recruiter")}
                                        onClick={() => setForm({...form, role: "recruiter"})}
                                        disabled={loading}
                                    >
                                        <div style={roleIconStyle("#fef3c7", "#d97706")}>
                                            <FiBriefcase size={20} />
                                        </div>
                                        <div style={roleContentStyle}>
                                            <div style={roleTitleStyle}>Recruiter</div>
                                            <div style={roleDescriptionStyle}>Hiring talent</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {isRecruiter && (
                                <div style={recruiterSectionStyle}>
                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            <FiBriefcase size={16} style={{ marginRight: 8, color: '#6b7280' }} />
                                            Company Name *
                                        </label>
                                        <input
                                            style={formInputStyle}
                                            name="company_name"
                                            value={form.company_name}
                                            onChange={handleChange}
                                            placeholder="Enter your company name"
                                            required
                                            disabled={loading}
                                        />
                                        <div style={helperTextStyle}>
                                            Required for recruiter accounts
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={submitButtonStyle}
                                className="submit-button"
                            >
                                {loading ? (
                                    <>
                                        <div style={spinnerStyle}></div>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        <FiArrowRight size={18} style={{ marginRight: 10 }} />
                                        Create Account
                                    </>
                                )}
                            </button>

                            <div style={alternativeOptionsStyle} className="alternative-options">
                                <Link to="/login" style={loginLinkStyle}>
                                    <FiArrowRight size={16} style={{ marginRight: 8, transform: 'rotate(180deg)' }} />
                                    Already have an account? Sign in
                                </Link>
                                <div style={termsTextStyle}>
                                    By creating an account, you agree to our 
                                    <Link to="/terms" style={termsLinkStyle}> Terms</Link> and 
                                    <Link to="/privacy" style={termsLinkStyle}> Privacy Policy</Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------- STYLES ---------- */

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
    background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
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
    background: "linear-gradient(135deg, #8b5cf6, #d946ef)",
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
    maxWidth: 500,
    animation: "slideIn 0.8s ease 0.2s backwards",
};

const registerCardStyle = {
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    borderRadius: 24,
    padding: 40,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 25px 50px rgba(15, 23, 42, 0.15)",
    animation: "fadeIn 0.6s ease",
    width: "100%",
    boxSizing: "border-box",
};

const registerHeaderStyle = {
    marginBottom: 32,
    textAlign: "center",
};

const registerTitleStyle = {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const registerSubtitleStyle = {
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

const registerFormStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    width: "100%",
};

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    width: "100%",
};

const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    width: "100%",
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
    width: "100%",
    boxSizing: "border-box",
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
    width: "100%",
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
    boxSizing: "border-box",
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

const roleSelectorStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 8,
    width: "100%",
};

const roleButtonStyle = (isActive) => ({
    padding: "18px 16px",
    borderRadius: 16,
    border: `2px solid ${isActive ? '#8b5cf6' : 'rgba(209, 213, 219, 0.8)'}`,
    background: isActive ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.9)',
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    ":hover": {
        borderColor: isActive ? '#8b5cf6' : '#a5b4fc',
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.15)",
    },
    ":disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
        transform: "none",
    },
});

const roleIconStyle = (bgColor, color) => ({
    width: 44,
    height: 44,
    borderRadius: 12,
    background: bgColor,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
});

const roleContentStyle = {
    flex: 1,
};

const roleTitleStyle = {
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 2,
};

const roleDescriptionStyle = {
    fontSize: 13,
    color: "#6b7280",
};

const recruiterSectionStyle = {
    padding: 20,
    borderRadius: 16,
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.08))",
    border: "1px solid rgba(139, 92, 246, 0.2)",
    animation: "fadeIn 0.5s ease",
    width: "100%",
    boxSizing: "border-box",
};

const helperTextStyle = {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    fontStyle: "italic",
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
    marginTop: 8,
    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
    width: "100%",
    boxSizing: "border-box",
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

const alternativeOptionsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    marginTop: 8,
    width: "100%",
};

const loginLinkStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 20px",
    borderRadius: 12,
    border: "1px solid rgba(139, 92, 246, 0.3)",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#7c3aed",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.3s ease",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
    ":hover": {
        background: "rgba(139, 92, 246, 0.1)",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.2)",
    },
};

const termsTextStyle = {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.6,
};

const termsLinkStyle = {
    color: "#7c3aed",
    textDecoration: "none",
    fontWeight: 500,
    margin: "0 4px",
    ":hover": {
        textDecoration: "underline",
    },
};

export default Register;