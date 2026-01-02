import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { 
  FiBriefcase, FiGlobe, FiMapPin, FiInfo, FiUsers, 
  FiCalendar, FiEdit, FiSave, FiRefreshCw, FiCheck, FiX 
} from "react-icons/fi";

const RecruiterCompany = () => {
    const { user, isAuthenticated } = useAuth();
    const [form, setForm] = useState({
        name: "",
        website: "",
        industry: "",
        location: "",
        about: "",
        company_size: "",
        founded_year: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await axiosClient.get("recruiter/company/");
                const data = res.data || {};

                setForm({
                    name: data.name || "",
                    website: data.website || "",
                    industry: data.industry || "",
                    location: data.location || "",
                    about: data.about || "",
                    company_size: data.company_size || "",
                    founded_year: data.founded_year || "",
                });
            } catch (err) {
                console.error(err);
                setError("Failed to load company details.");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user?.role === "recruiter") {
            fetchCompany();
        } else {
            setLoading(false);
            setError("You are not authorized to view this page.");
        }
    }, [isAuthenticated, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            const payload = {
                ...form,
                founded_year: form.founded_year ? Number(form.founded_year) : null,
            };

            await axiosClient.put("recruiter/company/", payload);
            setSuccess("Company details updated successfully ✨");
            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to update company details. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const initials = useMemo(() => {
        if (form.name?.trim()) {
            return form.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return "C";
    }, [form.name]);

    const companySizeOptions = [
        { value: "", label: "Select size" },
        { value: "1-10", label: "1-10 employees" },
        { value: "11-50", label: "11-50 employees" },
        { value: "51-200", label: "51-200 employees" },
        { value: "201-500", label: "201-500 employees" },
        { value: "501-1000", label: "501-1000 employees" },
        { value: "1000+", label: "1000+ employees" },
    ];

    // Success Popup Component
    const SuccessPopup = () => (
        <div style={successPopupOverlayStyle}>
            <div style={successPopupStyle}>
                <div style={successPopupHeaderStyle}>
                    <div style={successPopupIconStyle}>
                        <FiCheck size={24} />
                    </div>
                    <div style={successPopupContentStyle}>
                        <h4 style={successPopupTitleStyle}>
                            Company Updated Successfully! ✅
                        </h4>
                        <p style={successPopupMessageStyle}>
                            Your company details have been updated. Candidates will see your latest info.
                        </p>
                    </div>
                    <button 
                        style={successPopupCloseStyle}
                        onClick={() => setShowSuccessPopup(false)}
                    >
                        <FiX size={18} />
                    </button>
                </div>
                <div style={successPopupActionsStyle}>
                    <span style={successPopupHintStyle}>
                        Changes are now live
                    </span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={loadingContainerStyle}>
                <div style={loadingSpinnerStyle}></div>
                <p style={loadingTextStyle}>
                    Loading company details...
                </p>
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "recruiter") {
        return (
            <div style={errorStateStyle}>
                <div style={errorIconStyle}>⚠️</div>
                <h4 style={errorTitleStyle}>Access Denied</h4>
                <p style={errorMessageStyle}>
                    You must be logged in as a recruiter to view this page.
                </p>
                <button 
                    style={errorActionButtonStyle}
                    onClick={() => window.location.href = '/login'}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div style={pageContainerStyle}>
            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes successPopup {
                    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                    10% { opacity: 1; transform: translateY(0) scale(1); }
                    90% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(20px) scale(0.95); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {showSuccessPopup && <SuccessPopup />}

            <div style={contentContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>
                            <span style={{ color: '#4f46e5' }}>Company</span>
                            <span style={{ color: '#7c3aed' }}> Profile</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Manage your company information
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>Visible to candidates</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style={infoCardStyle}>
                        <div style={infoIconStyle}>
                            <FiBriefcase size={20} />
                        </div>
                        <div>
                            <div style={infoTitleStyle}>Company Preview</div>
                            <div style={infoTextStyle}>
                                This is how candidates see your company
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error/Message Alerts */}
                {error && (
                    <div style={errorAlertStyle}>
                        <div style={errorIconStyle}>
                            <FiX size={18} />
                        </div>
                        <div style={errorContentStyle}>
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                )}

                {success && !showSuccessPopup && (
                    <div style={successAlertStyle}>
                        <div style={successAlertIconStyle}>
                            <FiCheck size={18} />
                        </div>
                        <div style={successAlertContentStyle}>
                            {success}
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div style={gridContainerStyle}>
                    {/* Left Column - Company Preview */}
                    <div style={columnStyle}>
                        <div style={previewCardStyle}>
                            <div style={previewHeaderStyle}>
                                <h3 style={previewTitleStyle}>
                                    <FiBriefcase size={20} style={{ marginRight: 10, color: '#4f46e5' }} />
                                    Company Preview
                                </h3>
                                <div style={previewSubtitleStyle}>
                                    Candidate's view
                                </div>
                            </div>

                            <div style={avatarContainerStyle}>
                                <div style={avatarStyle}>
                                    {initials}
                                </div>
                                <div style={avatarInfoStyle}>
                                    <div style={avatarNameStyle}>
                                        {form.name || "Your Company Name"}
                                    </div>
                                    <div style={avatarRoleStyle}>
                                        {form.industry || "Industry"}
                                    </div>
                                </div>
                            </div>

                            <div style={previewDetailsStyle}>
                                <div style={previewDetailItemStyle}>
                                    <div style={previewDetailIconStyle}>
                                        <FiGlobe size={14} />
                                    </div>
                                    <div>
                                        <div style={previewDetailLabelStyle}>
                                            Website
                                        </div>
                                        <div style={previewDetailValueStyle}>
                                            {form.website ? (
                                                <a 
                                                    href={form.website} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    style={websiteLinkStyle}
                                                >
                                                    Visit Website
                                                </a>
                                            ) : "Not provided"}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={previewDetailItemStyle}>
                                    <div style={previewDetailIconStyle}>
                                        <FiMapPin size={14} />
                                    </div>
                                    <div>
                                        <div style={previewDetailLabelStyle}>
                                            Location
                                        </div>
                                        <div style={previewDetailValueStyle}>
                                            {form.location || "Not provided"}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={previewDetailItemStyle}>
                                    <div style={previewDetailIconStyle}>
                                        <FiUsers size={14} />
                                    </div>
                                    <div>
                                        <div style={previewDetailLabelStyle}>
                                            Company Size
                                        </div>
                                        <div style={previewDetailValueStyle}>
                                            {form.company_size ? form.company_size + " employees" : "Not provided"}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={previewDetailItemStyle}>
                                    <div style={previewDetailIconStyle}>
                                        <FiCalendar size={14} />
                                    </div>
                                    <div>
                                        <div style={previewDetailLabelStyle}>
                                            Founded Year
                                        </div>
                                        <div style={previewDetailValueStyle}>
                                            {form.founded_year || "Not provided"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {form.about && (
                                <div style={previewBioSectionStyle}>
                                    <h4 style={previewBioTitleStyle}>About Company</h4>
                                    <p style={previewBioTextStyle}>
                                        {form.about}
                                    </p>
                                </div>
                            )}

                            <div style={previewHintStyle}>
                                <div style={previewHintIconStyle}>💡</div>
                                <div style={previewHintTextStyle}>
                                    A complete company profile builds trust with candidates
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Form */}
                    <div style={columnStyle}>
                        <div style={formCardStyle}>
                            <div style={formHeaderStyle}>
                                <h3 style={formTitleStyle}>
                                    <FiEdit size={20} style={{ marginRight: 10, color: '#10b981' }} />
                                    Edit Company Details
                                </h3>
                                <div style={formSubtitleStyle}>
                                    Update your company information
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={formGridStyle}>
                                    {/* Company Name */}
                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                            Company Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Tech Innovations Pvt. Ltd."
                                            style={formInputStyle}
                                            required
                                        />
                                        <div style={formHelperStyle}>
                                            Your official company name
                                        </div>
                                    </div>

                                    {/* Website */}
                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            <FiGlobe size={14} style={{ marginRight: 6 }} />
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={form.website}
                                            onChange={handleChange}
                                            placeholder="https://www.example.com"
                                            style={formInputStyle}
                                        />
                                    </div>

                                    {/* Industry */}
                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                            Industry *
                                        </label>
                                        <input
                                            type="text"
                                            name="industry"
                                            value={form.industry}
                                            onChange={handleChange}
                                            placeholder="e.g. Information Technology, E-commerce"
                                            style={formInputStyle}
                                            required
                                        />
                                    </div>

                                    {/* Location */}
                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            <FiMapPin size={14} style={{ marginRight: 6 }} />
                                            Location *
                                        </label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={form.location}
                                            onChange={handleChange}
                                            placeholder="e.g. Bengaluru, Karnataka"
                                            style={formInputStyle}
                                            required
                                        />
                                    </div>

                                    {/* Company Size */}
                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            <FiUsers size={14} style={{ marginRight: 6 }} />
                                            Company Size
                                        </label>
                                        <select
                                            name="company_size"
                                            value={form.company_size || ""}
                                            onChange={handleChange}
                                            style={formSelectStyle}
                                        >
                                            {companySizeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Founded Year */}
                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            <FiCalendar size={14} style={{ marginRight: 6 }} />
                                            Founded Year
                                        </label>
                                        <input
                                            type="number"
                                            name="founded_year"
                                            value={form.founded_year}
                                            onChange={handleChange}
                                            placeholder="e.g. 2018"
                                            style={formInputStyle}
                                            min="1900"
                                            max={new Date().getFullYear()}
                                        />
                                    </div>

                                    {/* About Company */}
                                    <div style={{ gridColumn: "1 / -1" }}>
                                        <div style={formGroupStyle}>
                                            <label style={formLabelStyle}>
                                                <FiInfo size={14} style={{ marginRight: 6 }} />
                                                About Company
                                            </label>
                                            <textarea
                                                name="about"
                                                value={form.about}
                                                onChange={handleChange}
                                                rows={4}
                                                placeholder="Short description about your company, what you do, and the kind of roles you usually hire for."
                                                style={formTextareaStyle}
                                            />
                                            <div style={bioHelperStyle}>
                                                <div style={bioTipStyle}>
                                                    💡 <strong>Example:</strong> "We are a product-based startup building AI tools, currently hiring for full-stack, data and DevOps roles."
                                                </div>
                                                <div style={bioLengthStyle}>
                                                    {form.about.length}/500 characters
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div style={formActionsStyle}>
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        style={resetButtonStyle}
                                        disabled={saving}
                                    >
                                        <FiRefreshCw size={16} style={{ marginRight: 6 }} />
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        style={submitButtonStyle}
                                    >
                                        {saving ? (
                                            <>
                                                <div style={spinnerStyle}></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FiSave size={18} style={{ marginRight: 8 }} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------- STYLES (Same as RecruiterProfile) ---------- */

const pageContainerStyle = {
    position: "fixed",
    top: 60,
    left: 260,
    right: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #fdf2f8 100%)",
    overflow: "hidden",
    backgroundImage: `
        radial-gradient(at 10% 20%, rgba(120, 119, 198, 0.1) 0px, transparent 50%),
        radial-gradient(at 90% 10%, rgba(255, 200, 221, 0.1) 0px, transparent 50%),
        radial-gradient(at 30% 80%, rgba(186, 230, 253, 0.1) 0px, transparent 50%)
    `,
};

const contentContainerStyle = {
    height: "100%",
    padding: "28px 36px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    background: "rgba(255, 255, 255, 0.85)",
    backdropFilter: "blur(10px)",
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    animation: "fadeIn 0.5s ease",
    flexWrap: "wrap",
    gap: 16,
};

const titleStyle = {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 6,
    letterSpacing: "-0.02em",
    display: "flex",
    gap: 4,
};

const subtitleContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
};

const subtitleStyle = {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
    fontWeight: 500,
};

const trendingChipStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    color: "#0369a1",
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid rgba(14, 165, 233, 0.3)",
};

const trendingDotStyle = {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#0ea5e9",
    animation: "pulse 2s infinite",
};

const infoCardStyle = {
    background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(99, 102, 241, 0.2)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    maxWidth: 300,
    animation: "slideIn 0.5s ease",
};

const infoIconStyle = {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(79, 70, 229, 0.1)",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
};

const infoTitleStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#4f46e5",
    marginBottom: 2,
};

const infoTextStyle = {
    fontSize: 11,
    color: "#6b7280",
    lineHeight: 1.4,
};

const errorAlertStyle = {
    padding: "14px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    border: "1px solid #fecaca",
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
    animation: "fadeIn 0.3s ease",
};

const errorIconStyle = {
    marginRight: 12,
    color: "#ef4444",
};

const errorContentStyle = {
    flex: 1,
};

const successAlertStyle = {
    padding: "14px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    border: "1px solid #86efac",
    color: "#065f46",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
    animation: "fadeIn 0.3s ease",
};

const successAlertIconStyle = {
    marginRight: 12,
    color: "#10b981",
};

const successAlertContentStyle = {
    flex: 1,
};

const gridContainerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    flex: 1,
    minHeight: 0,
    animation: "fadeIn 0.6s ease",
};

const columnStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
};

const previewCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 24,
    flex: 1,
    display: "flex",
    flexDirection: "column",
};

const previewHeaderStyle = {
    marginBottom: 24,
    textAlign: "center",
};

const previewTitleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const previewSubtitleStyle = {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
};

const avatarContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
};

const avatarStyle = {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    fontWeight: 700,
    boxShadow: "0 12px 32px rgba(79, 70, 229, 0.4)",
};

const avatarInfoStyle = {
    textAlign: "center",
};

const avatarNameStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
};

const avatarRoleStyle = {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
};

const previewDetailsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 24,
};

const previewDetailItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 12,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
};

const previewDetailIconStyle = {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
};

const previewDetailLabelStyle = {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 2,
};

const previewDetailValueStyle = {
    fontSize: 14,
    color: "#111827",
    fontWeight: 500,
};

const websiteLinkStyle = {
    color: "#0a66c2",
    textDecoration: "none",
    fontWeight: 600,
    transition: "all 0.2s ease",
    ":hover": {
        color: "#004182",
        textDecoration: "underline",
    },
};

const previewBioSectionStyle = {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    background: "#f0f9ff",
    border: "1px solid #e0f2fe",
};

const previewBioTitleStyle = {
    fontSize: 15,
    fontWeight: 700,
    color: "#0369a1",
    margin: "0 0 8px 0",
};

const previewBioTextStyle = {
    fontSize: 13,
    color: "#0c4a6e",
    lineHeight: 1.5,
    margin: 0,
};

const previewHintStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
    marginTop: "auto",
};

const previewHintIconStyle = {
    fontSize: 20,
    flexShrink: 0,
};

const previewHintTextStyle = {
    fontSize: 12,
    color: "#92400e",
    fontWeight: 500,
    lineHeight: 1.4,
};

const formCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 24,
    marginBottom: 24,
};

const formHeaderStyle = {
    marginBottom: 24,
    textAlign: "center",
};

const formTitleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const formSubtitleStyle = {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
};

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 24,
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
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    fontSize: 14,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.95)",
    outline: "none",
    ":focus": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.15)",
        background: "#fff",
    },
    "::placeholder": {
        color: "#9ca3af",
    },
};

const formSelectStyle = {
    ...formInputStyle,
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 16px center",
    backgroundSize: "20px",
    paddingRight: "40px",
};

const formHelperStyle = {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
};

const formTextareaStyle = {
    ...formInputStyle,
    resize: "vertical",
    minHeight: 100,
    fontFamily: "inherit",
    lineHeight: 1.5,
};

const bioHelperStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
};

const bioTipStyle = {
    fontSize: 11,
    color: "#6b7280",
    flex: 1,
};

const bioLengthStyle = {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: 500,
};

const formActionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
    paddingTop: 20,
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
};

const resetButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    borderRadius: 12,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f9fafb",
        borderColor: "#ef4444",
        color: "#ef4444",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.1)",
    },
    ":disabled": {
        opacity: 0.5,
        cursor: "not-allowed",
        transform: "none",
    },
};

const submitButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "14px 32px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
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
    width: 18,
    height: 18,
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginRight: 10,
};

/* Loading State */
const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    height: "100%",
};

const loadingSpinnerStyle = {
    width: 40,
    height: 40,
    border: "3px solid rgba(139, 92, 246, 0.1)",
    borderTop: "3px solid #8b5cf6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 16,
};

const loadingTextStyle = {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
};

/* Error State */
const errorStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    borderRadius: 20,
    border: "1px solid rgba(254, 202, 202, 0.8)",
    textAlign: "center",
    animation: "fadeIn 0.4s ease",
    maxWidth: 500,
    margin: "40px auto",
};

const errorTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#dc2626",
    marginBottom: 8,
};

const errorMessageStyle = {
    fontSize: 13,
    color: "#b91c1c",
    maxWidth: 300,
    lineHeight: 1.6,
    opacity: 0.8,
    marginBottom: 16,
};

const errorActionButtonStyle = {
    padding: "10px 24px",
    borderRadius: 10,
    border: "1px solid rgba(220, 38, 38, 0.3)",
    background: "linear-gradient(135deg, #ffffff, #fef2f2)",
    color: "#dc2626",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#fee2e2",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
    },
};

/* Success Popup Styles */
const successPopupOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
    animation: "successPopup 3s ease forwards",
};

const successPopupStyle = {
    width: "100%",
    maxWidth: 420,
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 25px 50px rgba(15, 23, 42, 0.3)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    animation: "successPopup 3s ease forwards",
};

const successPopupHeaderStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
};

const successPopupIconStyle = {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
};

const successPopupContentStyle = {
    flex: 1,
};

const successPopupTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px 0",
};

const successPopupMessageStyle = {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.5,
    margin: 0,
};

const successPopupCloseStyle = {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    background: "linear-gradient(135deg, #f9fafb, #f3f4f6)",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        color: "#ef4444",
        transform: "rotate(90deg)",
    },
};

const successPopupActionsStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
};

const successPopupHintStyle = {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
};

export default RecruiterCompany;