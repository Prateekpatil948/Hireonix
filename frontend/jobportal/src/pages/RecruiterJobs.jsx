import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { 
  FiBriefcase, FiMapPin, FiDollarSign, FiFileText, 
  FiUsers, FiAward, FiLink, FiCheck, FiX 
} from "react-icons/fi";

const RecruiterJobs = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        job_type: "Full-time",
        salary_min: "",
        salary_max: "",
        qualification: "",
        batch: "",
        skills: "",
        external_link: "",
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);

        try {
            const payload = {
                title: form.title,
                description: form.description,
                location: form.location,
                job_type: form.job_type,
                salary_min: form.salary_min ? Number(form.salary_min) : null,
                salary_max: form.salary_max ? Number(form.salary_max) : null,
                qualification: form.qualification || "",
                batch: form.batch || "",
                skills: form.skills || "",
                external_link: form.external_link || "",
            };

            await axiosClient.post("jobs/", payload);

            setMessage("Job posted successfully ✨");
            
            // Reset form
            setForm({
                title: "",
                description: "",
                location: "",
                job_type: "Full-time",
                salary_min: "",
                salary_max: "",
                qualification: "",
                batch: "",
                skills: "",
                external_link: "",
            });

            // Show success popup
            setShowSuccessPopup(true);
            setTimeout(() => setShowSuccessPopup(false), 3000);
            
        } catch (err) {
            console.error("Error posting job:", err.response?.data || err);

            if (err.response?.data) {
                const data = err.response.data;
                const msg =
                    data.detail ||
                    (Array.isArray(data.non_field_errors)
                        ? data.non_field_errors[0]
                        : data.non_field_errors) ||
                    JSON.stringify(data);

                setError(String(msg));
            } else {
                setError("Could not create job. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleClear = () => {
        setForm({
            title: "",
            description: "",
            location: "",
            job_type: "Full-time",
            salary_min: "",
            salary_max: "",
            qualification: "",
            batch: "",
            skills: "",
            external_link: "",
        });
        setError("");
        setMessage("");
    };

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
                            Job Posted Successfully! 🎉
                        </h4>
                        <p style={successPopupMessageStyle}>
                            Your job listing is now live and visible to candidates.
                            You can manage it from your dashboard.
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
                        Candidates can now apply to this position
                    </span>
                </div>
            </div>
        </div>
    );

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
            `}</style>

            {showSuccessPopup && <SuccessPopup />}

            <div style={contentContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>
                            <span style={{ color: '#4f46e5' }}>Post</span>
                            <span style={{ color: '#7c3aed' }}> New Job</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Create a compelling job listing to attract top talent
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>Fill all required fields marked with *</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style={infoCardStyle}>
                        <div style={infoIconStyle}>
                            <FiBriefcase size={20} />
                        </div>
                        <div>
                            <div style={infoTitleStyle}>Tips for Success</div>
                            <div style={infoTextStyle}>
                                Be specific about requirements and include salary ranges
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form Card */}
                <div style={formCardStyle}>
                    {/* Form Header */}
                    <div style={formHeaderStyle}>
                        <h3 style={formTitleStyle}>
                            <FiBriefcase size={20} style={{ marginRight: 10, color: '#4f46e5' }} />
                            Job Details
                        </h3>
                        <div style={formSubtitleStyle}>
                            Complete all fields to create an attractive job listing
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

                    {message && !showSuccessPopup && (
                        <div style={successAlertStyle}>
                            <div style={successAlertIconStyle}>
                                <FiCheck size={18} />
                            </div>
                            <div style={successAlertContentStyle}>
                                {message}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div style={formGridStyle}>
                            {/* Row 1: Title & Location */}
                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                    Job Title *
                                </label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Senior React Developer"
                                    style={formInputStyle}
                                />
                                <div style={formHelperStyle}>
                                    Be specific and include seniority level
                                </div>
                            </div>

                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiMapPin size={14} style={{ marginRight: 6 }} />
                                    Location *
                                </label>
                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Bengaluru, Remote, Hybrid"
                                    style={formInputStyle}
                                />
                            </div>

                            {/* Row 2: Job Type & Batch */}
                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                    Job Type *
                                </label>
                                <div style={jobTypeGridStyle}>
                                    {["Full-time", "Part-time", "Internship", "Contract"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            style={jobTypeButtonStyle(form.job_type === type)}
                                            onClick={() => setForm({...form, job_type: type})}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiUsers size={14} style={{ marginRight: 6 }} />
                                    Target Batch
                                </label>
                                <input
                                    name="batch"
                                    value={form.batch}
                                    onChange={handleChange}
                                    placeholder="e.g. 2023, 2024, Any"
                                    style={formInputStyle}
                                />
                            </div>

                            {/* Row 3: Qualification & Skills */}
                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiAward size={14} style={{ marginRight: 6 }} />
                                    Qualification
                                </label>
                                <input
                                    name="qualification"
                                    value={form.qualification}
                                    onChange={handleChange}
                                    placeholder="e.g. B.E/B.Tech, MCA, Any degree"
                                    style={formInputStyle}
                                />
                            </div>

                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                    Required Skills
                                </label>
                                <input
                                    name="skills"
                                    value={form.skills}
                                    onChange={handleChange}
                                    placeholder="React, Python, AWS, Docker (comma separated)"
                                    style={formInputStyle}
                                />
                                <div style={formHelperStyle}>
                                    List key skills candidates should have
                                </div>
                            </div>

                            {/* Row 4: Salary Range */}
                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiDollarSign size={14} style={{ marginRight: 6 }} />
                                    Salary Range (₹ LPA)
                                </label>
                                <div style={salaryRangeStyle}>
                                    <div style={salaryInputGroupStyle}>
                                        <input
                                            type="number"
                                            name="salary_min"
                                            placeholder="Min"
                                            value={form.salary_min}
                                            onChange={handleChange}
                                            style={salaryInputStyle}
                                        />
                                        <span style={salarySeparatorStyle}>to</span>
                                        <input
                                            type="number"
                                            name="salary_max"
                                            placeholder="Max"
                                            value={form.salary_max}
                                            onChange={handleChange}
                                            style={salaryInputStyle}
                                        />
                                    </div>
                                    <div style={salaryHintStyle}>
                                        Optional - Helps attract relevant candidates
                                    </div>
                                </div>
                            </div>

                            {/* Row 5: External Link */}
                            <div style={formGroupStyle}>
                                <label style={formLabelStyle}>
                                    <FiLink size={14} style={{ marginRight: 6 }} />
                                    External Apply Link
                                </label>
                                <input
                                    name="external_link"
                                    value={form.external_link}
                                    onChange={handleChange}
                                    placeholder="https://company.com/careers/job-id"
                                    style={formInputStyle}
                                />
                                <div style={formHelperStyle}>
                                    Leave empty for direct portal applications
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ gridColumn: "1 / -1" }}>
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>
                                        <FiFileText size={14} style={{ marginRight: 6 }} />
                                        Job Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={5}
                                        value={form.description}
                                        onChange={handleChange}
                                        required
                                        placeholder="Describe the role, responsibilities, requirements, and benefits..."
                                        style={formTextareaStyle}
                                    />
                                    <div style={descriptionHelperStyle}>
                                        <div style={descriptionTipStyle}>
                                            💡 <strong>Tip:</strong> Include day-to-day responsibilities, 
                                            required experience, and company culture
                                        </div>
                                        <div style={descriptionLengthStyle}>
                                            {form.description.length}/2000 characters
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div style={formActionsStyle}>
                            <button
                                type="button"
                                onClick={handleClear}
                                style={clearButtonStyle}
                                disabled={saving}
                            >
                                <FiX size={16} style={{ marginRight: 6 }} />
                                Clear Form
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                style={submitButtonStyle}
                            >
                                {saving ? (
                                    <>
                                        <div style={spinnerStyle}></div>
                                        Posting Job...
                                    </>
                                ) : (
                                    <>
                                        <FiCheck size={18} style={{ marginRight: 8 }} />
                                        Post Job Now
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

              
            </div>
        </div>
    );
};

/* ---------- ENHANCED STYLES ---------- */

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

const formCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 28,
    boxShadow: "0 12px 40px rgba(15, 23, 42, 0.08)",
    marginBottom: 24,
    animation: "fadeIn 0.6s ease",
};

const formHeaderStyle = {
    marginBottom: 24,
    textAlign: "center",
};

const formTitleStyle = {
    fontSize: 22,
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

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20,
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
    padding: "14px 16px",
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
    "::placeholder": {
        color: "#9ca3af",
    },
};

const formHelperStyle = {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
};

const jobTypeGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 8,
};

const jobTypeButtonStyle = (isActive) => ({
    padding: "12px 16px",
    borderRadius: 10,
    border: `1px solid ${isActive ? '#8b5cf6' : 'rgba(209, 213, 219, 0.8)'}`,
    background: isActive ? 'rgba(139, 92, 246, 0.1)' : '#fff',
    color: isActive ? '#7c3aed' : '#374151',
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    ":hover": {
        borderColor: "#8b5cf6",
        background: "rgba(139, 92, 246, 0.05)",
    },
});

const salaryRangeStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const salaryInputGroupStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
};

const salaryInputStyle = {
    ...formInputStyle,
    flex: 1,
    textAlign: "center",
    padding: "12px 16px",
};

const salarySeparatorStyle = {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
};

const salaryHintStyle = {
    fontSize: 11,
    color: "#9ca3af",
    fontStyle: "italic",
};

const formTextareaStyle = {
    ...formInputStyle,
    resize: "vertical",
    minHeight: 120,
    fontFamily: "inherit",
    lineHeight: 1.5,
};

const descriptionHelperStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
};

const descriptionTipStyle = {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
};

const descriptionLengthStyle = {
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

const clearButtonStyle = {
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

const tipsCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 16,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 24,
    animation: "fadeIn 0.6s ease 0.2s backwards",
};

const tipsHeaderStyle = {
    marginBottom: 20,
    textAlign: "center",
};

const tipsTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
};

const tipsListStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
};

const tipItemStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    background: "rgba(255, 255, 255, 0.9)",
    border: "1px solid rgba(226, 232, 240, 0.7)",
    transition: "all 0.3s ease",
    ":hover": {
        transform: "translateY(-4px)",
        borderColor: "#8b5cf6",
        boxShadow: "0 12px 24px rgba(139, 92, 246, 0.15)",
    },
};

const tipIconStyle = (bgColor, color) => ({
    width: 32,
    height: 32,
    borderRadius: 8,
    background: bgColor,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    flexShrink: 0,
});

const tipTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    marginBottom: 2,
};

const tipDescriptionStyle = {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.4,
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

export default RecruiterJobs;