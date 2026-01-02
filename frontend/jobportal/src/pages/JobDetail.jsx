import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import { FiMapPin, FiBriefcase, FiBookOpen, FiCalendar, FiArrowLeft, FiExternalLink, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const JobDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    const initialJob = location.state?.job || null;

    const [job, setJob] = useState(initialJob);
    const [loading, setLoading] = useState(!initialJob);
    const [error, setError] = useState("");
    const [applied, setApplied] = useState(false);
    const [applyMessage, setApplyMessage] = useState("");
    const [checkingApplied, setCheckingApplied] = useState(true);

    // Popup for success
    const [showPopup, setShowPopup] = useState(false);

    // Loader while applying
    const [applying, setApplying] = useState(false);

    // Check if user has already applied to this job
    useEffect(() => {
        const checkIfApplied = async () => {
            if (!isAuthenticated || user?.role !== "candidate" || !job) {
                setCheckingApplied(false);
                return;
            }

            try {
                const response = await axiosClient.get("applications/");
                const userApplications = response.data || [];
                
                // Check if any application exists for this job
                const hasApplied = userApplications.some(
                    application => application.job?.id === job.id
                );
                
                setApplied(hasApplied);
            } catch (error) {
                console.error("Error checking application status:", error);
            } finally {
                setCheckingApplied(false);
            }
        };

        if (job) {
            checkIfApplied();
        } else {
            setCheckingApplied(false);
        }
    }, [job, isAuthenticated, user]);

    useEffect(() => {
        if (job) return; // If job data came from state, no API fetch

        const fetchJob = async () => {
            setLoading(true);
            try {
                const res = await axiosClient.get(`jobs/${id}/`);
                setJob(res.data);
            } catch (err) {
                setError("Could not load job details.");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id, job]);

    const handleApply = async () => {
        setApplyMessage("");
        setApplying(true);

        if (!isAuthenticated || user.role !== "candidate") {
            setApplyMessage("You must log in as a candidate to apply.");
            setApplying(false);
            return;
        }

        // 🔹 Profile completeness check with improved message
        if (user && user.profile_complete === false) {
            setApplyMessage(
                "Before applying, make sure your profile is complete and up to date."
            );
            setApplying(false);
            return;
        }

        if (!job) {
            setApplyMessage("Job information not available.");
            setApplying(false);
            return;
        }

        try {
            const res = await axiosClient.post("applications/", {
                job_id: job.id,
                cover_letter: "",
            });

            if (res.data?.id) {
                setApplied(true);
                const msg =
                    "Application submitted successfully! Go to My Applications page to take the test.";
                setApplyMessage(msg);

                // Show success popup (auto hide)
                setShowPopup(true);
                setTimeout(() => setShowPopup(false), 3000);
            } else {
                setApplyMessage(
                    "Application submitted, but something went wrong. Please check My Applications page."
                );
            }
        } catch (err) {
            console.error("Apply error:", err.response?.data || err);

            const backendDetail =
                err.response?.data?.detail ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : "");

            setApplyMessage(
                backendDetail ||
                "Something went wrong while applying. Please try again."
            );
        } finally {
            setApplying(false);
        }
    };

    if (loading) return (
        <div style={pageContainerStyle}>
            <div style={contentContainerStyle}>
                <div style={loadingContainerStyle}>
                    <div style={loadingSpinnerStyle}></div>
                    <p style={loadingTextStyle}>Loading job details...</p>
                </div>
            </div>
        </div>
    );

    if (error || !job) return (
        <div style={pageContainerStyle}>
            <div style={contentContainerStyle}>
                <div style={errorContainerStyle}>
                    <FiAlertCircle size={48} style={{ color: "#ef4444", marginBottom: 16 }} />
                    <h4 style={errorTitleStyle}>Error Loading Job</h4>
                    <p style={errorTextStyle}>{error || "Job not found"}</p>
                    <Link to="/jobs" style={errorRetryButtonStyle}>
                        Back to Jobs
                    </Link>
                </div>
            </div>
        </div>
    );

    const {
        title,
        company_name,
        location: jobLocation,
        job_type,
        description,
        salary_min,
        salary_max,
        is_active,
        qualification,
        batch,
        skills,
        external_link,
    } = job;

    // Salary text with Indian Rupee symbol
    let salaryText = "Not specified";
    if (salary_min && salary_max) salaryText = `₹${salary_min} - ₹${salary_max}`;
    else if (salary_min) salaryText = `₹${salary_min}+`;
    else if (salary_max) salaryText = `Up to ₹${salary_max}`;

    // Format salary for display with commas
    const formatSalary = (amount) => {
        if (!amount) return '';
        return `₹${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    };

    // Get formatted salary text with commas
    if (salary_min && salary_max) {
        salaryText = `${formatSalary(salary_min)} - ${formatSalary(salary_max)}`;
    } else if (salary_min) {
        salaryText = `${formatSalary(salary_min)}+`;
    } else if (salary_max) {
        salaryText = `Up to ${formatSalary(salary_max)}`;
    }

    // Skills list from comma-separated string
    const skillsList = skills
        ? skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    return (
        <div style={pageContainerStyle}>
            {/* CSS for animations */}
            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(10px); }
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>

            {/* Success Popup */}
            {showPopup && (
                <div style={popupOverlayStyle}>
                    <div style={popupStyle}>
                        <div style={popupIconStyle}>
                            <FiCheckCircle size={24} />
                        </div>
                        <div style={popupContentStyle}>
                            <h4 style={popupTitleStyle}>Application Submitted</h4>
                            <p style={popupTextStyle}>
                                Your application has been submitted successfully.
                                <br />
                                Go to <Link to="/candidate/applications" style={popupLinkStyle}>My Applications</Link> to take the test.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div style={contentContainerStyle}>
                {/* Header with Back Button */}
                <div style={headerStyle}>
                    <Link to="/jobs" style={backButtonStyle}>
                        <FiArrowLeft size={18} />
                        <span>Back to Jobs</span>
                    </Link>
                    
                    <div style={statusBadgeStyle(is_active)}>
                        <div style={statusDotStyle(is_active)}></div>
                        <span>{is_active ? "Active" : "Closed"}</span>
                    </div>
                </div>

                {/* Main Job Card */}
                <div style={mainCardStyle}>
                    {/* Job Header */}
                    <div style={jobHeaderStyle}>
                        <div>
                            <h1 style={jobTitleStyle}>{title}</h1>
                            {company_name && (
                                <div style={companyStyle}>
                                    <div style={companyIconStyle}>🏢</div>
                                    <span style={companyNameStyle}>{company_name}</span>
                                </div>
                            )}
                        </div>
                        
                        <div style={salaryBadgeStyle}>
                            <span style={rupeeSymbolStyle}>₹</span>
                            <span>{salaryText.replace(/₹/g, '')}</span>
                        </div>
                    </div>

                    {/* Quick Info Chips */}
                    <div style={chipsContainerStyle}>
                        {jobLocation && (
                            <div style={chipStyle}>
                                <FiMapPin size={12} style={{ color: '#ef4444' }} />
                                <span>{jobLocation}</span>
                            </div>
                        )}

                        {job_type && (
                            <div style={chipStyle}>
                                <FiBriefcase size={12} style={{ color: '#10b981' }} />
                                <span>{job_type}</span>
                            </div>
                        )}

                        {qualification && (
                            <div style={chipStyle}>
                                <FiBookOpen size={12} style={{ color: '#8b5cf6' }} />
                                <span>{qualification}</span>
                            </div>
                        )}

                        {batch && (
                            <div style={chipStyle}>
                                <FiCalendar size={12} style={{ color: '#f59e0b' }} />
                                <span>Batch: {batch}</span>
                            </div>
                        )}

                        {applied && (
                            <div style={appliedChipStyle}>
                                <FiCheckCircle size={12} />
                                <span>Applied</span>
                            </div>
                        )}
                    </div>

                    {/* Overview Grid */}
                    <div style={overviewGridStyle}>
                        <OverviewItem
                            icon={<FiMapPin size={16} style={{ color: '#8b5cf6' }} />}
                            label="Location"
                            value={jobLocation || "Not specified"}
                            color="#8b5cf6"
                        />
                        <OverviewItem
                            icon={<FiBriefcase size={16} style={{ color: '#10b981' }} />}
                            label="Job Type"
                            value={job_type || "Not specified"}
                            color="#10b981"
                        />
                        <OverviewItem
                            icon={<FiBookOpen size={16} style={{ color: '#f59e0b' }} />}
                            label="Qualification"
                            value={qualification || "Not specified"}
                            color="#f59e0b"
                        />
                        <OverviewItem
                            icon={<FiCalendar size={16} style={{ color: '#ef4444' }} />}
                            label="Batch"
                            value={batch || "Not specified"}
                            color="#ef4444"
                        />
                        <OverviewItem
                            icon={<span style={rupeeIconStyle}>₹</span>}
                            label="Salary Range"
                            value={salaryText}
                            color="#06b6d4"
                        />
                    </div>

                    {/* Skills Section */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>
                            <span style={{ color: '#8b5cf6' }}>🔧</span> Required Skills
                        </h3>
                        {skillsList.length === 0 ? (
                            <p style={emptyTextStyle}>Not specified.</p>
                        ) : (
                            <div style={skillsContainerStyle}>
                                {skillsList.map((skill, idx) => (
                                    <span key={idx} style={skillChipStyle}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description Section */}
                    <div style={sectionStyle}>
                        <h3 style={sectionTitleStyle}>
                            <span style={{ color: '#8b5cf6' }}>📝</span> Job Description
                        </h3>
                        <div style={descriptionStyle}>
                            {description || "No description provided."}
                        </div>
                    </div>

                    {/* Profile Warning */}
                    {isAuthenticated && user?.role === "candidate" && user?.profile_complete === false && (
                        <div style={warningBoxStyle}>
                            <FiAlertCircle size={18} style={{ color: '#f59e0b' }} />
                            <div>
                                <p style={warningTitleStyle}>Profile Incomplete</p>
                                <p style={warningTextStyle}>
                                    Complete your profile before applying to increase your chances.
                                    <Link to="/candidate/profile" style={warningLinkStyle}> Update Profile</Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Apply Message */}
                    {applyMessage && (
                        <div style={messageBoxStyle(applyMessage.includes("successfully"))}>
                            {applyMessage.includes("successfully") ? (
                                <FiCheckCircle size={16} style={{ color: '#10b981' }} />
                            ) : (
                                <FiAlertCircle size={16} style={{ color: '#ef4444' }} />
                            )}
                            <span>{applyMessage}</span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div style={actionContainerStyle}>
                        <div style={actionLeftStyle}>
                            {external_link && (
                                <a
                                    href={external_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={externalButtonStyle}
                                >
                                    <FiExternalLink size={14} />
                                    <span>Apply on Company Site</span>
                                </a>
                            )}
                        </div>

                        <div style={actionRightStyle}>
                            {checkingApplied ? (
                                <button style={loadingButtonStyle} disabled>
                                    <div style={smallSpinnerStyle}></div>
                                    <span>Checking...</span>
                                </button>
                            ) : applied ? (
                                <button style={appliedButtonStyle} disabled>
                                    <FiCheckCircle size={16} />
                                    <span>Applied</span>
                                </button>
                            ) : (
                                <button
                                    style={applyButtonStyle(!is_active, applying)}
                                    onClick={handleApply}
                                    disabled={!is_active || applying}
                                >
                                    {applying ? (
                                        <>
                                            <div style={spinnerStyle}></div>
                                            <span>Applying...</span>
                                        </>
                                    ) : (
                                        <>
                                            {!is_active ? "Job Closed" : "Apply Now"}
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OverviewItem = ({ icon, label, value, color }) => (
    <div style={overviewItemStyle}>
        <div style={overviewIconStyle}>{icon}</div>
        <div style={overviewContentStyle}>
            <div style={overviewLabelStyle}>{label}</div>
            <div style={{ ...overviewValueStyle, color: color || '#111827' }}>
                {value}
            </div>
        </div>
    </div>
);

/* ---------- STYLES ---------- */

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
    alignItems: "center",
    marginBottom: 24,
    animation: "slideIn 0.5s ease",
};

const backButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.7)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
    ":hover": {
        borderColor: "#8b5cf6",
        color: "#8b5cf6",
        transform: "translateX(-2px)",
    },
};

const statusBadgeStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 20,
    background: isActive 
        ? "linear-gradient(135deg, #dcfce7, #bbf7d0)" 
        : "linear-gradient(135deg, #fee2e2, #fecaca)",
    color: isActive ? "#166534" : "#b91c1c",
    fontSize: 12,
    fontWeight: 600,
    border: `1px solid ${isActive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
});

const statusDotStyle = (isActive) => ({
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: isActive ? "#22c55e" : "#ef4444",
    animation: "pulse 2s infinite",
});

const mainCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    borderRadius: 16,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 12px 40px rgba(139, 92, 246, 0.1)",
    padding: 32,
    animation: "slideIn 0.6s ease",
};

const jobHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
    paddingBottom: 20,
};

const jobTitleStyle = {
    fontSize: 28,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 8,
    lineHeight: 1.2,
    background: "linear-gradient(90deg, #111827, #374151)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
};

const companyStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
};

const companyIconStyle = {
    fontSize: 16,
};

const companyNameStyle = {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: 500,
};

const salaryBadgeStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 16px",
    borderRadius: 10,
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontSize: 14,
    fontWeight: 700,
    border: "1px solid rgba(139, 92, 246, 0.2)",
};

const rupeeSymbolStyle = {
    fontSize: 16,
    fontWeight: 700,
    color: "#7c3aed",
};

const rupeeIconStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#06b6d4",
};

const chipsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
};

const chipStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    background: "rgba(249, 250, 251, 0.8)",
    border: "1px solid rgba(209, 213, 219, 0.6)",
    color: "#374151",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.2s ease",
    ":hover": {
        transform: "translateY(-1px)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
    },
};

const appliedChipStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 8,
    background: "linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(21, 128, 61, 0.15))",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "#166534",
    fontSize: 13,
    fontWeight: 600,
    animation: "pulse 2s infinite",
};

const overviewGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
    marginBottom: 32,
};

const overviewItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "16px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.2s ease",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
        borderColor: "rgba(139, 92, 246, 0.3)",
    },
};

const overviewIconStyle = {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#7c3aed",
};

const overviewContentStyle = {
    flex: 1,
};

const overviewLabelStyle = {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#9ca3af",
    marginBottom: 4,
    fontWeight: 600,
};

const overviewValueStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
};

const sectionStyle = {
    marginBottom: 32,
};

const sectionTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
};

const emptyTextStyle = {
    fontSize: 14,
    color: "#9ca3af",
    fontStyle: "italic",
};

const skillsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
};

const skillChipStyle = {
    fontSize: 13,
    padding: "8px 16px",
    borderRadius: 8,
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontWeight: 500,
    border: "1px solid rgba(139, 92, 246, 0.2)",
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(139, 92, 246, 0.2)",
        transform: "translateY(-1px)",
    },
};

const descriptionStyle = {
    fontSize: 15,
    color: "#374151",
    lineHeight: 1.7,
    whiteSpace: "pre-line",
    background: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    border: "1px solid rgba(226, 232, 240, 0.8)",
};

const warningBoxStyle = {
    display: "flex",
    gap: 12,
    padding: "16px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
    border: "1px solid rgba(245, 158, 11, 0.3)",
    marginBottom: 20,
};

const warningTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#92400e",
    margin: 0,
    marginBottom: 4,
};

const warningTextStyle = {
    fontSize: 13,
    color: "#92400e",
    margin: 0,
    opacity: 0.8,
};

const warningLinkStyle = {
    color: "#d97706",
    fontWeight: 600,
    textDecoration: "none",
    ":hover": {
        textDecoration: "underline",
    },
};

const messageBoxStyle = (isSuccess) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 10,
    background: isSuccess 
        ? "linear-gradient(135deg, #ecfdf3, #d1fae5)" 
        : "linear-gradient(135deg, #fef2f2, #fee2e2)",
    border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
    color: isSuccess ? "#166534" : "#b91c1c",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 20,
});

const actionContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 24,
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
    marginTop: 8,
};

const actionLeftStyle = {
    flex: 1,
};

const actionRightStyle = {
    display: "flex",
    gap: 12,
};

const externalButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 20px",
    borderRadius: 10,
    border: "1px solid rgba(139, 92, 246, 0.3)",
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(139, 92, 246, 0.2)",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
    },
};

const loadingButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 28px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #9ca3af, #6b7280)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "default",
    opacity: 0.8,
};

const smallSpinnerStyle = {
    width: 16,
    height: 16,
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
};

const appliedButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 28px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "default",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
};

const applyButtonStyle = (disabled, applying) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 28px",
    borderRadius: 10,
    border: "none",
    background: disabled ? "linear-gradient(135deg, #9ca3af, #6b7280)" 
              : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
    transition: "all 0.3s ease",
    opacity: disabled ? 0.7 : 1,
    boxShadow: disabled ? "none" : "0 6px 20px rgba(139, 92, 246, 0.4)",
    ":hover": {
        transform: disabled ? "none" : "translateY(-2px)",
        boxShadow: disabled ? "none" : "0 10px 28px rgba(139, 92, 246, 0.5)",
    },
});

const spinnerStyle = {
    width: 16,
    height: 16,
    border: "2px solid rgba(255, 255, 255, 0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
};

const popupOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(4px)",
    animation: "fadeInOut 3s ease",
};

const popupStyle = {
    width: "100%",
    maxWidth: 420,
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98))",
    borderRadius: 16,
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.45)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    padding: 24,
    backdropFilter: "blur(16px)",
    display: "flex",
    gap: 16,
    alignItems: "center",
};

const popupIconStyle = {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 20%, #22c55e, #16a34a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: 24,
};

const popupContentStyle = {
    flex: 1,
};

const popupTitleStyle = {
    margin: 0,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
};

const popupTextStyle = {
    margin: 0,
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 1.6,
};

const popupLinkStyle = {
    color: "#7c3aed",
    fontWeight: 600,
    textDecoration: "none",
    ":hover": {
        textDecoration: "underline",
    },
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

// Error State
const errorContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #ffffff, #faf5ff)",
    borderRadius: 16,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 12px 40px rgba(139, 92, 246, 0.1)",
    textAlign: "center",
    animation: "fadeIn 0.4s ease",
};

const errorTitleStyle = {
    color: "#dc2626",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
};

const errorTextStyle = {
    color: "#b91c1c",
    fontSize: 14,
    marginBottom: 24,
    maxWidth: 400,
    lineHeight: 1.5,
};

const errorRetryButtonStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid rgba(139, 92, 246, 0.3)",
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(139, 92, 246, 0.2)",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
    },
};

export default JobDetails;