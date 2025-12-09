import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

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

    // Popup for success
    const [showPopup, setShowPopup] = useState(false);

    // Loader while applying
    const [applying, setApplying] = useState(false);

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
        // Adjust `user.profile_complete` to your actual flag if different.
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

    if (loading) return <p>Loading job details...</p>;

    if (error || !job)
        return <p style={{ color: "red" }}>{error || "Job not found"}</p>;

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

    // Salary text
    let salaryText = "Not specified";
    if (salary_min && salary_max) salaryText = `${salary_min} - ${salary_max}`;
    else if (salary_min) salaryText = `${salary_min}+`;
    else if (salary_max) salaryText = `Up to ${salary_max}`;

    // Skills list from comma-separated string
    const skillsList = skills
        ? skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    // Popup component
    const Popup = () => (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,42,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 380,
                    background:
                        "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(248,250,252,0.98))",
                    borderRadius: 20,
                    boxShadow: "0 24px 80px rgba(15,23,42,0.45)",
                    border: "1px solid rgba(148,163,184,0.35)",
                    padding: "18px 20px",
                    animation: "fadeInOut 3s ease",
                    backdropFilter: "blur(16px)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                    }}
                >
                    <div
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 999,
                            background:
                                "radial-gradient(circle at 30% 20%, #22c55e, #16a34a)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 18,
                        }}
                    >
                        ✓
                    </div>
                    <div>
                        <h4
                            style={{
                                margin: 0,
                                marginBottom: 4,
                                fontSize: 15,
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            Application submitted
                        </h4>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#4b5563",
                                lineHeight: 1.5,
                            }}
                        >
                            Your application has been submitted successfully.
                            <br />
                            Now go to <strong>My Applications</strong> page to
                            take the test.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="jobs-page">
            {/* animation keyframes */}
            <style>
                {`
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
            `}
            </style>

            {showPopup && <Popup />}

            <div className="jobs-container">
                <div className="card" style={{ padding: 16 }}>
                    {/* Title + company */}
                    <h2 className="jobs-title" style={{ marginBottom: 6 }}>
                        {title}
                    </h2>

                    {company_name && (
                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                color: "#4b5563",
                                fontWeight: 500,
                            }}
                        >
                            {company_name}
                        </p>
                    )}

                    {/* Meta row */}
                    <div
                        style={{
                            marginTop: 10,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 8,
                            fontSize: 13,
                            alignItems: "center",
                        }}
                    >
                        {jobLocation && (
                            <span
                                style={{
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    background: "#eef2ff",
                                    color: "#4338ca",
                                }}
                            >
                                📍 {jobLocation}
                            </span>
                        )}

                        {job_type && (
                            <span
                                style={{
                                    padding: "4px 8px",
                                    borderRadius: 999,
                                    background: "#ecfeff",
                                    color: "#0891b2",
                                }}
                            >
                                {job_type}
                            </span>
                        )}

                        <span
                            style={{
                                padding: "4px 8px",
                                borderRadius: 999,
                                background: is_active ? "#ecfdf3" : "#fee2e2",
                                color: is_active ? "#166534" : "#b91c1c",
                                fontSize: 12,
                                fontWeight: 500,
                            }}
                        >
                            {is_active ? "Open" : "Closed"}
                        </span>
                    </div>

                    {/* Overview grid */}
                    <div
                        style={{
                            marginTop: 16,
                            display: "grid",
                            gap: 10,
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(180px, 1fr))",
                        }}
                    >
                        <OverviewItem
                            label="Location"
                            value={jobLocation || "Not specified"}
                        />
                        <OverviewItem
                            label="Job Type"
                            value={job_type || "Not specified"}
                        />
                        <OverviewItem
                            label="Qualification"
                            value={qualification || "Not specified"}
                        />
                        <OverviewItem
                            label="Batch"
                            value={batch || "Not specified"}
                        />
                        <OverviewItem
                            label="Salary Range"
                            value={salaryText}
                        />
                    </div>

                    {/* Skills */}
                    <div style={{ marginTop: 18 }}>
                        <h3
                            style={{
                                fontSize: 15,
                                marginBottom: 6,
                                fontWeight: 600,
                            }}
                        >
                            Required Skills
                        </h3>
                        {skillsList.length === 0 ? (
                            <p style={{ fontSize: 14, color: "#6b7280" }}>
                                Not specified.
                            </p>
                        ) : (
                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 6,
                                }}
                            >
                                {skillsList.map((skill, idx) => (
                                    <span
                                        key={idx}
                                        style={{
                                            fontSize: 12,
                                            padding: "4px 8px",
                                            borderRadius: 999,
                                            background: "#f3f4f6",
                                            color: "#374151",
                                        }}
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div style={{ marginTop: 18 }}>
                        <h3
                            style={{
                                fontSize: 15,
                                marginBottom: 6,
                                fontWeight: 600,
                            }}
                        >
                            Job Description
                        </h3>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#374151",
                                lineHeight: 1.6,
                                whiteSpace: "pre-line",
                            }}
                        >
                            {description || "No description provided."}
                        </p>
                    </div>



                    {/* Actions */}
                    <div
                        style={{
                            marginTop: 20,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        {/* Left Side Message */}
                        <div
                            style={{
                                fontSize: 13,
                                background: "#f0f9ff",
                                border: "1px solid #bae6fd",
                                color: "#0369a1",
                                padding: "6px 12px",
                                borderRadius: 8,
                                whiteSpace: "nowrap",
                            }}
                        >
                            ℹ️ Before applying, make sure your profile is complete and up to date.
                        </div>

                        {/* Right Side Buttons */}
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {external_link && (
                                <a
                                    href={external_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-outline"
                                >
                                    Apply on Company Site
                                </a>
                            )}

                            {/* Apply button with loader */}
                            <button
                                className="btn btn-primary"
                                onClick={handleApply}
                                disabled={applied || !is_active || applying}
                                style={{
                                    opacity: !is_active ? 0.5 : 1,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                {applying ? (
                                    <>
                                        <span
                                            style={{
                                                width: "14px",
                                                height: "14px",
                                                borderRadius: "50%",
                                                border: "2px solid white",
                                                borderTopColor: "transparent",
                                                animation: "spin 0.7s linear infinite",
                                                display: "inline-block",
                                            }}
                                        />
                                        Applying...
                                    </>
                                ) : (
                                    <>
                                        {!is_active
                                            ? "Job Closed"
                                            : applied
                                                ? "Applied"
                                                : "Apply"}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const OverviewItem = ({ label, value }) => (
    <div
        style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            background: "#f9fafb",
        }}
    >
        <div
            style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "#6b7280",
                marginBottom: 4,
            }}
        >
            {label}
        </div>
        <div
            style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#111827",
            }}
        >
            {value}
        </div>
    </div>
);

export default JobDetails;
