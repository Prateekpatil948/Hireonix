// src/pages/CandidateDashboard.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import PaginationControls from "../components/PaginationControls";

export default function CandidateDashboard() {
    const { user, isAuthenticated, loadingUser } = useAuth();

    const [appliedJobs, setAppliedJobs] = useState([]);
    const [appliedLoading, setAppliedLoading] = useState(false);

    const [interviews, setInterviews] = useState([]);
    const [interviewsLoading, setInterviewsLoading] = useState(false);
    const [interviewsError, setInterviewsError] = useState("");

    // pagination states
    const [appliedPage, setAppliedPage] = useState(1);
    const PAGE_SIZE = 4;

    // ===== Fetch applied jobs =====
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchApplications = async () => {
            try {
                setAppliedLoading(true);
                const res = await axiosClient.get("applications/");
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.results || [];
                setAppliedJobs(data);
                setAppliedPage(1);
            } catch (err) {
                console.error("Error fetching applications:", err);
            } finally {
                setAppliedLoading(false);
            }
        };

        fetchApplications();
    }, [isAuthenticated]);

    // ===== Fetch interviews =====
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchInterviews = async () => {
            try {
                setInterviewsLoading(true);
                setInterviewsError("");
                const res = await axiosClient.get("interviews/");
                const items = Array.isArray(res.data)
                    ? res.data
                    : res.data.results || [];
                const sorted = [...items].sort((a, b) => {
                    const da = a.scheduled_at ? new Date(a.scheduled_at) : 0;
                    const db = b.scheduled_at ? new Date(b.scheduled_at) : 0;
                    return da - db;
                });
                setInterviews(sorted);
            } catch (err) {
                console.error("Error fetching interviews:", err);
                setInterviewsError(
                    "Could not load interviews. Please try again."
                );
            } finally {
                setInterviewsLoading(false);
            }
        };

        fetchInterviews();
    }, [isAuthenticated]);

    if (!isAuthenticated && !loadingUser) {
        return (
            <div
                style={{
                    minHeight: "calc(100vh - 64px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #f9fafb 100%)",
                    padding: 16,
                }}
            >
                <div
                    style={{
                        background: "rgba(255,255,255,0.96)",
                        padding: "14px 18px",
                        borderRadius: 18,
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 16px 40px rgba(15,23,42,0.18)",
                        fontSize: 14,
                        color: "#4b5563",
                    }}
                >
                    Please log in to view your dashboard.
                </div>
            </div>
        );
    }

    const now = new Date();

    const upcomingInterviews = interviews.filter((iv) => {
        if (!iv.scheduled_at) return false;
        const d = new Date(iv.scheduled_at);
        return d >= now;
    });

    const pastInterviews = interviews.filter((iv) => {
        if (!iv.scheduled_at) return false;
        const d = new Date(iv.scheduled_at);
        return d < now;
    });

    const formatDateTime = (isoString) => {
        if (!isoString) return "No time";
        const d = new Date(isoString);
        return d.toLocaleString();
    };

    const getJobTitleFromInterview = (iv) =>
        iv.job?.title ||
        iv.application?.job?.title ||
        iv.job_title ||
        "Job";

    const getCompanyFromInterview = (iv) =>
        iv.job?.company_name ||
        iv.application?.job?.company_name ||
        iv.company_name ||
        "";

    const renderLocation = (location) => {
        if (!location) return null;
        const isUrl = /^https?:\/\//i.test(location);
        if (isUrl) {
            return (
                <a
                    href={location}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: "underline" }}
                >
                    Join link
                </a>
            );
        }
        return location;
    };

    const renderInterviewList = (items, emptyText) => {
        if (items.length === 0) {
            return (
                <p
                    style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        margin: 0,
                    }}
                >
                    {emptyText}
                </p>
            );
        }

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    marginTop: 6,
                }}
            >
                {items.map((iv) => (
                    <div
                        key={iv.id}
                        style={{
                            borderRadius: 10,
                            border: "1px solid #e5e7eb",
                            padding: "8px 10px",
                            background: "#ffffff",
                            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: 8,
                                alignItems: "flex-start",
                            }}
                        >
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 14,
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 6,
                                    }}
                                >
                                    <span
                                        style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                            maxWidth: 220,
                                        }}
                                    >
                                        {getJobTitleFromInterview(iv)}
                                    </span>
                                    {getCompanyFromInterview(iv) && (
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: "#6b7280",
                                                padding: "1px 6px",
                                                borderRadius: 999,
                                                background: "#f3f4f6",
                                            }}
                                        >
                                            {getCompanyFromInterview(iv)}
                                        </span>
                                    )}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#6b7280",
                                        marginTop: 2,
                                    }}
                                >
                                    {formatDateTime(iv.scheduled_at)}
                                </div>
                            </div>

                            <div
                                style={{
                                    fontSize: 11,
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    background: "#eef2ff",
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {(iv.mode || "online")} •{" "}
                                {iv.status || "scheduled"}
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: 6,
                                fontSize: 12,
                                color: "#4b5563",
                            }}
                        >
                            {iv.mode && (
                                <div style={{ marginBottom: 2 }}>
                                    <strong>Mode:</strong> {iv.mode}
                                </div>
                            )}
                            {iv.location && (
                                <div style={{ marginBottom: 2 }}>
                                    <strong>
                                        {iv.mode === "online"
                                            ? "Meeting link:"
                                            : "Location:"}
                                    </strong>{" "}
                                    {renderLocation(iv.location)}
                                </div>
                            )}
                            {iv.notes && (
                                <div
                                    style={{
                                        marginTop: 2,
                                        fontSize: 11,
                                        color: "#6b7280",
                                    }}
                                >
                                    📝 {iv.notes}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // ===== colored status pill for applications =====
    const renderApplicationStatusPill = (statusRaw) => {
        const status = (statusRaw || "applied").toLowerCase();
        let bg = "#e5e7eb";
        let text = "#374151";
        let label = status;

        if (status === "applied") {
            bg = "#e5e7eb";
            text = "#374151";
            label = "Applied";
        } else if (status === "shortlisted") {
            bg = "#dbeafe";
            text = "#1d4ed8";
            label = "Shortlisted";
        } else if (status === "selected") {
            bg = "#dcfce7";
            text = "#15803d";
            label = "Selected";
        } else if (status === "rejected") {
            bg = "#fee2e2";
            text = "#b91c1c";
            label = "Rejected";
        }

        return (
            <span
                style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: bg,
                    color: text,
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                }}
            >
                {label}
            </span>
        );
    };

    // ===== pagination helpers =====
    const totalAppliedPages = Math.ceil(
        (appliedJobs?.length || 0) / PAGE_SIZE
    );

    const paginatedAppliedJobs = appliedJobs.slice(
        (appliedPage - 1) * PAGE_SIZE,
        appliedPage * PAGE_SIZE
    );

    const renderAppliedJobs = () => {
        if (appliedLoading) {
            return (
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                    Loading applied jobs…
                </p>
            );
        }

        if (!appliedJobs || appliedJobs.length === 0) {
            return (
                <p
                    style={{
                        fontSize: 13,
                        color: "#9ca3af",
                        margin: 0,
                    }}
                >
                    You have not applied to any jobs yet.
                </p>
            );
        }

        return (
            <>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        marginTop: 6,
                    }}
                >
                    {paginatedAppliedJobs.map((app) => (
                        <div
                            key={app.id}
                            style={{
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                padding: "8px 10px",
                                background: "#ffffff",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    alignItems: "flex-start",
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 14,
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 6,
                                        }}
                                    >
                                        <span
                                            style={{
                                                whiteSpace: "nowrap",
                                                textOverflow: "ellipsis",
                                                overflow: "hidden",
                                                maxWidth: 220,
                                            }}
                                        >
                                            {app.job?.title || "Job"}
                                        </span>
                                        {app.job?.company_name && (
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    color: "#6b7280",
                                                    padding: "1px 6px",
                                                    borderRadius: 999,
                                                    background: "#f3f4f6",
                                                }}
                                            >
                                                {app.job.company_name}
                                            </span>
                                        )}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#6b7280",
                                            marginTop: 2,
                                        }}
                                    >
                                        {app.job?.location} •{" "}
                                        {app.job?.job_type}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#9ca3af",
                                            marginTop: 2,
                                        }}
                                    >
                                        Applied on{" "}
                                        {app.applied_at
                                            ? new Date(
                                                app.applied_at
                                            ).toLocaleDateString()
                                            : "-"}
                                    </div>
                                </div>

                                {renderApplicationStatusPill(app.status)}
                            </div>
                        </div>
                    ))}
                </div>

                <PaginationControls
                    page={appliedPage}
                    totalPages={totalAppliedPages}
                    onPageChange={setAppliedPage}
                />
            </>
        );
    };

    return (
        <div
            style={{
                minHeight: "calc(100vh - 64px)",
                background:
                    "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 25%, #ecfeff 60%, #f9fafb 100%)",
                padding: "24px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 1050,
                    background: "rgba(255,255,255,0.96)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 24,
                    border: "1px solid rgba(148,163,184,0.25)",
                    boxShadow: "0 22px 60px rgba(15,23,42,0.18)",
                    padding: 20,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        marginBottom: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            Candidate Dashboard
                        </div>
                        <div
                            style={{
                                fontSize: 13,
                                color: "#6b7280",
                                marginTop: 2,
                            }}
                        >
                            Welcome back
                            {user?.username ? `, ${user.username}` : ""}.
                        </div>
                    </div>
                    {appliedJobs?.length > 0 && (
                        <div
                            style={{
                                padding: "6px 12px",
                                borderRadius: 999,
                                fontSize: 12,
                                background: "#f0f9ff",
                                color: "#0369a1",
                                border: "1px solid #bae6fd",
                            }}
                        >
                            {appliedJobs.length} applied job
                            {appliedJobs.length === 1 ? "" : "s"}
                        </div>
                    )}
                </div>

                {/* Grid: Applied jobs + Interviews */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1.4fr)",
                        gap: 14,
                    }}
                >
                    {/* Left: Applied jobs */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: 16,
                                padding: 12,
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: 6,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 15,
                                        color: "#111827",
                                    }}
                                >
                                    Applied Jobs
                                </div>
                                {appliedJobs?.length > 0 && (
                                    <span
                                        style={{
                                            fontSize: 11,
                                            padding: "0 8px",
                                            borderRadius: 999,
                                            background: "#f3f4f6",
                                        }}
                                    >
                                        {appliedJobs.length}
                                    </span>
                                )}
                            </div>
                            {renderAppliedJobs()}
                        </div>
                    </div>

                    {/* Right: Interviews */}
                    <div>
                        <div
                            style={{
                                background: "#ffffff",
                                borderRadius: 16,
                                padding: 12,
                                border: "1px solid #e5e7eb",
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: 6,
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 15,
                                            color: "#111827",
                                        }}
                                    >
                                        Interview Schedule
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#6b7280",
                                            marginTop: 2,
                                        }}
                                    >
                                        See your upcoming and past interviews.
                                    </div>
                                </div>
                            </div>

                            {interviewsLoading || loadingUser ? (
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: "#6b7280",
                                    }}
                                >
                                    Loading interviews…
                                </p>
                            ) : interviewsError ? (
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: "#ef4444",
                                    }}
                                >
                                    {interviewsError}
                                </p>
                            ) : (
                                <>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: "#111827",
                                            }}
                                        >
                                            Upcoming
                                        </div>
                                        {renderInterviewList(
                                            upcomingInterviews,
                                            "You don't have any upcoming interviews yet."
                                        )}
                                    </div>

                                    <div style={{ marginTop: 10 }}>
                                        <div
                                            style={{
                                                fontSize: 12,
                                                fontWeight: 600,
                                                color: "#111827",
                                            }}
                                        >
                                            Past
                                        </div>
                                        {renderInterviewList(
                                            pastInterviews,
                                            "No past interviews found."
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
