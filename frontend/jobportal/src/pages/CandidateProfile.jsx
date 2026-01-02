import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";
import { FiSave, FiRefreshCw, FiUpload, FiDownload, FiUser, FiMail, FiPhone, FiBriefcase, FiFileText, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const CandidateProfile = () => {
    const [form, setForm] = useState({
        full_name: "",
        phone_number: "",
        email: "",
        bio: "",
        skills: "",
        experience: "",
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [existingResumeUrl, setExistingResumeUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [fileName, setFileName] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setError("");
                const res = await axiosClient.get("candidate/profile/");
                const data = res.data;

                setForm({
                    full_name: data.full_name || "",
                    phone_number: data.phone_number || "",
                    email: data.email || "",
                    bio: data.bio || "",
                    skills: data.skills || "",
                    experience:
                        data.experience !== null && data.experience !== undefined
                            ? String(data.experience)
                            : "",
                });

                if (data.resume) {
                    setExistingResumeUrl(data.resume);
                    // Extract filename from URL
                    const urlParts = data.resume.split('/');
                    setFileName(urlParts[urlParts.length - 1] || "resume.pdf");
                }
            } catch (err) {
                console.error("Error loading profile:", err.response?.data || err);
                setError("Could not load your profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setResumeFile(file);
            setFileName(file.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);

        try {
            const fd = new FormData();

            fd.append("full_name", form.full_name);
            fd.append("phone_number", form.phone_number);
            fd.append("email", form.email);
            fd.append("bio", form.bio);
            fd.append("skills", form.skills);

            if (form.experience !== "") {
                fd.append("experience", Number(form.experience));
            }

            if (resumeFile) {
                fd.append("resume", resumeFile);
            }

            const res = await axiosClient.put("candidate/profile/", fd);
            setMessage("Profile updated successfully ✨");

            if (res.data.resume) {
                setExistingResumeUrl(res.data.resume);
                const urlParts = res.data.resume.split('/');
                setFileName(urlParts[urlParts.length - 1] || "resume.pdf");
            }
            
            // Clear the file input
            setResumeFile(null);
            
        } catch (err) {
            console.error("Error saving profile:", err.response?.data || err);
            if (err.response?.data) {
                const data = err.response.data;
                const firstKey = Object.keys(data)[0];
                const firstMsg = Array.isArray(data[firstKey])
                    ? data[firstKey][0]
                    : data[firstKey];
                setError(String(firstMsg));
            } else {
                setError("Could not save profile. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const initials = useMemo(() => {
        if (form.full_name?.trim()) {
            return form.full_name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return "CP";
    }, [form.full_name]);

    const renderToast = (type, text) => (
        <div style={type === 'error' ? errorToastStyle : successToastStyle}>
            {type === 'error' ? (
                <FiAlertCircle size={16} style={{ marginRight: 8 }} />
            ) : (
                <FiCheckCircle size={16} style={{ marginRight: 8 }} />
            )}
            <span>{text}</span>
        </div>
    );

    if (loading) {
        return (
            <div style={pageContainerStyle}>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
                <div style={contentContainerStyle}>
                    <div style={loadingContainerStyle}>
                        <div style={loadingSpinnerStyle}></div>
                        <p style={loadingTextStyle}>
                            <span style={{ color: '#4f46e5' }}>Loading</span> your profile...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageContainerStyle}>
            {/* CSS for animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>

            <div style={contentContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>
                            <span style={{ color: '#4f46e5' }}>Candidate</span>
                            <span style={{ color: '#7c3aed' }}> Profile</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Update your profile to attract <span style={highlightTextStyle}>better opportunities</span>
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>✨ Complete profile = More interviews</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style={profileBadgeStyle}>
                        <FiUser size={14} style={{ marginRight: 6 }} />
                        <span>Profile {form.full_name ? '· ' + form.full_name.split(' ')[0] : ''}</span>
                    </div>
                </div>

                {/* Toast messages */}
                {(error || message) && (
                    <div style={{ marginBottom: 16, animation: "fadeIn 0.4s ease" }}>
                        {error && renderToast('error', error)}
                        {message && renderToast('success', message)}
                    </div>
                )}

                {/* Main grid: left summary + right form */}
                <div style={mainGridStyle}>
                    {/* LEFT PANEL - Profile Summary */}
                    <div style={leftPanelStyle}>
                        <div style={avatarSectionStyle}>
                            {/* Avatar */}
                            <div style={avatarStyle}>
                                {initials}
                            </div>
                            
                            <div style={avatarInfoStyle}>
                                <div style={avatarNameStyle}>
                                    {form.full_name || "Your Name"}
                                </div>
                                <div style={avatarExperienceStyle}>
                                    {form.experience
                                        ? `${form.experience} years experience`
                                        : "Fresher / Entry Level"}
                                </div>
                            </div>
                        </div>

                        {/* Contact Info Card */}
                        <div style={contactCardStyle}>
                            <div style={contactCardHeaderStyle}>
                                <span style={contactCardTitleStyle}>Contact Info</span>
                            </div>
                            
                            <div style={contactItemStyle}>
                                <FiMail size={14} style={{ color: '#6b7280', marginRight: 8 }} />
                                <div>
                                    <div style={contactLabelStyle}>Email</div>
                                    <div style={contactValueStyle}>
                                        {form.email || "Not provided"}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={contactItemStyle}>
                                <FiPhone size={14} style={{ color: '#6b7280', marginRight: 8 }} />
                                <div>
                                    <div style={contactLabelStyle}>Phone</div>
                                    <div style={contactValueStyle}>
                                        {form.phone_number || "Not provided"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resume Card */}
                        <div style={resumeCardStyle}>
                            <div style={resumeCardHeaderStyle}>
                                <FiFileText size={16} style={{ marginRight: 8, color: '#4f46e5' }} />
                                <span style={resumeCardTitleStyle}>Resume</span>
                            </div>
                            
                            {existingResumeUrl ? (
                                <div style={resumeInfoStyle}>
                                    <div style={resumeFileNameStyle}>
                                        {fileName}
                                    </div>
                                    <a
                                        href={`http://127.0.0.1:8000${existingResumeUrl}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={resumeDownloadButtonStyle}
                                    >
                                        <FiDownload size={14} style={{ marginRight: 6 }} />
                                        Download
                                    </a>
                                </div>
                            ) : (
                                <div style={noResumeStyle}>
                                    <span style={{ color: '#9ca3af' }}>No resume uploaded</span>
                                </div>
                            )}
                            
                            <div style={resumeHintStyle}>
                                Upload your latest resume in PDF format. Recruiters will review this.
                            </div>
                        </div>

                        {/* Tips Card */}
                        <div style={tipsCardStyle}>
                            <h4 style={tipsTitleStyle}>📝 Profile Tips</h4>
                            <ul style={tipsListStyle}>
                                <li>Keep your bio concise and impactful</li>
                                <li>List relevant skills with proper formatting</li>
                                <li>Always upload an updated resume</li>
                                <li>Provide accurate contact information</li>
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT PANEL – FORM */}
                    <div style={rightPanelStyle}>
                        <form onSubmit={handleSubmit} style={formStyle}>
                            {/* Basic Info Section */}
                            <div style={formSectionStyle}>
                                <h3 style={sectionTitleStyle}>
                                    <FiUser size={18} style={{ marginRight: 10, color: '#4f46e5' }} />
                                    Basic Information
                                </h3>
                                
                                <div style={formGridStyle}>
                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            Full Name <span style={requiredStyle}>*</span>
                                        </label>
                                        <input
                                            style={formInputStyle}
                                            name="full_name"
                                            value={form.full_name}
                                            onChange={handleChange}
                                            placeholder="e.g., John Doe"
                                            required
                                        />
                                        <div style={formHintStyle}>
                                            Your full name as it should appear to recruiters
                                        </div>
                                    </div>

                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            Phone Number
                                        </label>
                                        <input
                                            style={formInputStyle}
                                            type="tel"
                                            name="phone_number"
                                            value={form.phone_number}
                                            onChange={handleChange}
                                            placeholder="e.g., +91 98765 43210"
                                        />
                                        <div style={formHintStyle}>
                                            For interview calls and updates
                                        </div>
                                    </div>

                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            Email Address <span style={requiredStyle}>*</span>
                                        </label>
                                        <input
                                            style={formInputStyle}
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="e.g., john.doe@example.com"
                                            required
                                        />
                                        <div style={formHintStyle}>
                                            Primary contact email for recruiters
                                        </div>
                                    </div>

                                    <div style={formGroupStyle}>
                                        <label style={formLabelStyle}>
                                            Experience (years)
                                        </label>
                                        <input
                                            style={formInputStyle}
                                            type="number"
                                            min="0"
                                            name="experience"
                                            value={form.experience}
                                            onChange={handleChange}
                                            placeholder="e.g., 0, 1, 2..."
                                        />
                                        <div style={formHintStyle}>
                                            Years of professional experience
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bio Section */}
                            <div style={formSectionStyle}>
                                <h3 style={sectionTitleStyle}>
                                    <FiBriefcase size={18} style={{ marginRight: 10, color: '#4f46e5' }} />
                                    Professional Summary
                                </h3>
                                
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>
                                        Bio <span style={requiredStyle}>*</span>
                                    </label>
                                    <textarea
                                        style={formTextareaStyle}
                                        rows={4}
                                        name="bio"
                                        value={form.bio}
                                        onChange={handleChange}
                                        placeholder="Write a compelling summary about yourself, your career goals, and expertise..."
                                        required
                                    />
                                    <div style={formHintStyle}>
                                        Example: "Final-year Computer Science student with expertise in MERN stack and Django. Passionate about building scalable web applications and solving real-world problems."
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div style={formSectionStyle}>
                                <h3 style={sectionTitleStyle}>
                                    <FiBriefcase size={18} style={{ marginRight: 10, color: '#4f46e5' }} />
                                    Skills & Expertise
                                </h3>
                                
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>
                                        Skills <span style={requiredStyle}>*</span>
                                    </label>
                                    <textarea
                                        style={formTextareaStyle}
                                        rows={4}
                                        name="skills"
                                        value={form.skills}
                                        onChange={handleChange}
                                        placeholder="List your technical and soft skills, separated by commas or line breaks..."
                                        required
                                    />
                                    <div style={formHintStyle}>
                                        Example: React, Python, Django, REST APIs, MySQL, Git, Team Leadership, Problem Solving
                                    </div>
                                </div>
                            </div>

                            {/* Resume Upload Section */}
                            <div style={formSectionStyle}>
                                <h3 style={sectionTitleStyle}>
                                    <FiUpload size={18} style={{ marginRight: 10, color: '#4f46e5' }} />
                                    Resume Upload
                                </h3>
                                
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>
                                        Upload Resume (PDF)
                                    </label>
                                    <div style={fileUploadAreaStyle}>
                                        <input
                                            style={fileInputStyle}
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            id="resume-upload"
                                        />
                                        <label htmlFor="resume-upload" style={fileUploadButtonStyle}>
                                            <FiUpload size={16} style={{ marginRight: 8 }} />
                                            Choose File
                                        </label>
                                        <span style={fileNameStyle}>
                                            {fileName || "No file chosen"}
                                        </span>
                                    </div>
                                    <div style={formHintStyle}>
                                        Upload your latest resume. PDF format only. Max size: 5MB.
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={formActionsStyle}>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    style={resetButtonStyle}
                                >
                                    <FiRefreshCw size={16} style={{ marginRight: 8 }} />
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={submitButtonStyle}
                                >
                                    {saving ? (
                                        <>
                                            <div style={{ 
                                                width: 16, 
                                                height: 16, 
                                                border: '2px solid rgba(255,255,255,0.3)', 
                                                borderTop: '2px solid white', 
                                                borderRadius: '50%', 
                                                animation: 'spin 0.8s linear infinite',
                                                marginRight: 8 
                                            }} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <FiSave size={16} style={{ marginRight: 8 }} />
                                            Save Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------- ENHANCED STYLES (Matching JobsList) ---------- */

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
    animation: "slideIn 0.5s ease",
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

const highlightTextStyle = {
    color: "#4f46e5",
    fontWeight: 700,
    background: "linear-gradient(135deg, #4f46e5, #a855f7)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
};

const trendingChipStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    color: "#065f46",
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid rgba(16, 185, 129, 0.3)",
};

const trendingDotStyle = {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#10b981",
    animation: "pulse 2s infinite",
};

const profileBadgeStyle = {
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    color: "#4f46e5",
    border: "1px solid #c7d2fe",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
};

// Toast Styles
const errorToastStyle = {
    padding: "12px 16px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
    animation: "fadeIn 0.3s ease",
};

const successToastStyle = {
    padding: "12px 16px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #ecfdf3, #d1fae5)",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontSize: 13,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    marginBottom: 8,
    animation: "fadeIn 0.3s ease",
};

// Loading State
const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    flex: 1,
};

const loadingSpinnerStyle = {
    width: 48,
    height: 48,
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

// Main Grid
const mainGridStyle = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 300px) minmax(0, 1fr)",
    gap: 24,
    flex: 1,
    minHeight: 0,
};

// Left Panel Styles
const leftPanelStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
};

const avatarSectionStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: 24,
    borderRadius: 16,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
};

const avatarStyle = {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: 28,
    fontWeight: 700,
    margin: "0 auto 16px",
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.3)",
};

const avatarInfoStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 4,
};

const avatarNameStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
};

const avatarExperienceStyle = {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
};

// Contact Card
const contactCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
};

const contactCardHeaderStyle = {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
};

const contactCardTitleStyle = {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
};

const contactItemStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
};

const contactLabelStyle = {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 500,
    marginBottom: 2,
};

const contactValueStyle = {
    fontSize: 14,
    color: "#374151",
    fontWeight: 500,
};

// Resume Card
const resumeCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
};

const resumeCardHeaderStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
};

const resumeCardTitleStyle = {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
};

const resumeInfoStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
};

const resumeFileNameStyle = {
    fontSize: 13,
    color: "#374151",
    fontWeight: 500,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 180,
};

const resumeDownloadButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "6px 12px",
    borderRadius: 8,
    background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    color: "#4f46e5",
    fontSize: 12,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#e0e7ff",
        transform: "translateY(-1px)",
    },
};

const noResumeStyle = {
    padding: "12px",
    textAlign: "center",
    background: "#f9fafb",
    borderRadius: 8,
    border: "1px dashed #d1d5db",
    marginBottom: 12,
};

const resumeHintStyle = {
    fontSize: 12,
    color: "#9ca3af",
    lineHeight: 1.5,
};

// Tips Card
const tipsCardStyle = {
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid rgba(251, 191, 36, 0.4)",
};

const tipsTitleStyle = {
    fontSize: 14,
    fontWeight: 700,
    color: "#92400e",
    marginBottom: 12,
};

const tipsListStyle = {
    margin: 0,
    paddingLeft: 20,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 1.6,
    "& li": {
        marginBottom: 6,
    },
};

// Right Panel Styles
const rightPanelStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 16,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 24,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
    overflowY: "auto",
};

const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 24,
};

const formSectionStyle = {
    paddingBottom: 20,
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
    ":last-of-type": {
        borderBottom: "none",
    },
};

const sectionTitleStyle = {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
};

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20,
};

const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
};

const formLabelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 8,
};

const requiredStyle = {
    color: "#ef4444",
};

const formInputStyle = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    fontSize: 14,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.9)",
    outline: "none",
    ":focus": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.15)",
        background: "#fff",
    },
};

const formTextareaStyle = {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    fontSize: 14,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.9)",
    outline: "none",
    resize: "vertical",
    minHeight: 100,
    ":focus": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.15)",
        background: "#fff",
    },
};

const formHintStyle = {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 6,
    lineHeight: 1.4,
};

// File Upload
const fileUploadAreaStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
};

const fileInputStyle = {
    display: "none",
};

const fileUploadButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 16px",
    borderRadius: 8,
    background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    color: "#4f46e5",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#e0e7ff",
        transform: "translateY(-1px)",
    },
};

const fileNameStyle = {
    fontSize: 13,
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: 200,
};

// Form Actions
const formActionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
    paddingTop: 20,
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
};

const resetButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        borderColor: "#d1d5db",
        transform: "translateY(-1px)",
    },
};

const submitButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.6)",
    },
    ":disabled": {
        opacity: 0.7,
        cursor: "not-allowed",
        transform: "none",
        boxShadow: "none",
    },
};

// Responsive styles
const mediaQueries = `
    @media (max-width: 1024px) {
        ${JSON.stringify(mainGridStyle)} {
            grid-template-columns: 1fr;
        }
        
        ${JSON.stringify(formGridStyle)} {
            grid-template-columns: 1fr;
        }
        
        ${JSON.stringify(contentContainerStyle)} {
            padding: 20px;
        }
        
        ${JSON.stringify(headerStyle)} {
            flex-direction: column;
            gap: 12px;
        }
        
        ${JSON.stringify(profileBadgeStyle)} {
            align-self: flex-start;
        }
    }
    
    @media (max-width: 768px) {
        ${JSON.stringify(pageContainerStyle)} {
            left: 0;
            top: 0;
        }
    }
`;

// Add media queries to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = mediaQueries;
document.head.appendChild(styleSheet);

export default CandidateProfile;