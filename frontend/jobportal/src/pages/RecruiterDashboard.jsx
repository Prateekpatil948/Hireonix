import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PaginationControls from "../components/PaginationControls";
import RecruiterTestResult from "../components/RecruiterTestResult"; // ✅

const RecruiterDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        job: "",
        status: "",
    });

    const [activeProfile, setActiveProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [interviews, setInterviews] = useState([]);
    const [interviewsLoading, setInterviewsLoading] = useState(false);

    // Modal state
    const [interviewModalApp, setInterviewModalApp] = useState(null);
    const [interviewForm, setInterviewForm] = useState({
        date: "",
        time: "",
        mode: "online",
        location: "",
        notes: "",
    });

    // ✅ NEW: Test performance modal state
    const [performanceModalAppId, setPerformanceModalAppId] = useState(null);

    // Pagination for applications
    const [page, setPage] = useState(1);
    const APPS_PER_PAGE = 4;

    const fetchApplications = async () => {
        setLoading(true);
        setError("");

        try {
            const params = {};

            if (filters.search.trim()) params.search = filters.search.trim();
            if (filters.job.trim()) params.job = filters.job.trim();
            if (filters.status.trim()) params.status = filters.status.trim();

            const res = await axiosClient.get("recruiter/applications/", { params });
            setApplications(res.data);
            setPage(1); // reset to first page whenever we refetch
        } catch (err) {
            console.error("Error loading applications:", err.response?.data || err);
            setError("Could not load applications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();
        fetchApplications();
    };

    const handleClearFilters = () => {
        setFilters({
            search: "",
            job: "",
            status: "",
        });
        fetchApplications();
    };

    const renderStatusPill = (status) => {
        const baseStyle = {
            textTransform: "capitalize",
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 999,
        };

        if (status === "shortlisted") {
            return (
                <span
                    style={{
                        ...baseStyle,
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                    }}
                >
                    {status}
                </span>
            );
        }

        if (status === "selected") {
            return (
                <span
                    style={{
                        ...baseStyle,
                        backgroundColor: "#dbeafe",
                        color: "#1e3a8a",
                    }}
                >
                    {status}
                </span>
            );
        }

        if (status === "rejected") {
            return (
                <span
                    style={{
                        ...baseStyle,
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                    }}
                >
                    {status}
                </span>
            );
        }

        return (
            <span
                style={{
                    ...baseStyle,
                    backgroundColor: "#e5e7eb",
                    color: "#374151",
                }}
            >
                {status}
            </span>
        );
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await axiosClient.patch(`applications/${applicationId}/`, {
                status: newStatus,
            });

            setApplications((prev) =>
                prev.map((app) =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                )
            );

            if (activeProfile && activeProfile.application_id === applicationId) {
                setActiveProfile({ ...activeProfile, status: newStatus });
            }
        } catch (err) {
            console.error("Error updating status:", err.response?.data || err);
            alert("Could not update application status.");
        }
    };

    const handleDownloadResume = async (applicationId) => {
        if (!applicationId) {
            alert("Cannot download resume right now.");
            return;
        }

        try {
            const response = await axiosClient.get(
                `applications/${applicationId}/download-resume/`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const contentDisposition = response.headers["content-disposition"];
            let fileName = "resume.pdf";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    fileName = match[1];
                }
            }

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading resume:", err.response?.data || err);
            alert(
                "Could not download resume. Maybe the candidate has not uploaded it yet."
            );
        }
    };

    const fetchInterviews = async (applicationId) => {
        if (!applicationId) return;

        setInterviewsLoading(true);
        try {
            const res = await axiosClient.get(
                `applications/${applicationId}/interviews/`
            );
            setInterviews(res.data || []);
        } catch (err) {
            console.error("Error loading interviews:", err.response?.data || err);
        } finally {
            setInterviewsLoading(false);
        }
    };

    const openScheduleInterview = async (app) => {
        if (!app) return;

        setInterviewModalApp(app);
        setInterviewForm({
            date: "",
            time: "",
            mode: "online",
            location: "",
            notes: "",
        });
        setInterviews([]);
        fetchInterviews(app.id);
    };

    const closeScheduleInterview = () => {
        setInterviewModalApp(null);
    };

    const handleInterviewInputChange = (e) => {
        const { name, value } = e.target;
        setInterviewForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateInterview = async (e) => {
        e.preventDefault();

        if (!interviewModalApp) {
            alert("No application selected.");
            return;
        }

        const { date, time, mode, location, notes } = interviewForm;

        if (!date || !time) {
            alert("Please choose both date and time.");
            return;
        }

        const scheduled_at = `${date}T${time}`;

        try {
            const res = await axiosClient.post(
                `applications/${interviewModalApp.id}/interviews/`,
                {
                    scheduled_at,
                    mode,
                    location,
                    notes,
                }
            );

            setInterviews((prev) => [res.data, ...(prev || [])]);

            setInterviewForm({
                date: "",
                time: "",
                mode: "online",
                location: "",
                notes: "",
            });
        } catch (err) {
            console.error("Error scheduling interview:", err.response?.data || err);
            alert("Could not schedule interview. Please try again.");
        }
    };

    const openCandidateProfile = async (application) => {
        // ✅ Support multiple possible field names just in case
        const candidateId =
            application.candidate ||
            application.candidate_id ||
            application.candidate_profile;

        if (!candidateId) {
            alert("Candidate information is missing on this application.");
            return;
        }

        setProfileLoading(true);
        setActiveProfile(null);
        setInterviews([]);

        try {
            const res = await axiosClient.get(
                `recruiter/candidates/${candidateId}/`
            );
            setActiveProfile({
                ...res.data,
                jobTitle: application.job?.title,
                companyName: application.job?.company_name,
                status: application.status,
                application_id: application.id,
            });

            fetchInterviews(application.id);
        } catch (err) {
            console.error("Error loading candidate profile:", err.response?.data || err);
            alert("Could not load candidate profile.");
        } finally {
            setProfileLoading(false);
        }
    };

    // Pagination calculations for applications
    const totalPages = Math.ceil(applications.length / APPS_PER_PAGE) || 1;
    const startIndex = (page - 1) * APPS_PER_PAGE;
    const currentApplications = applications.slice(
        startIndex,
        startIndex + APPS_PER_PAGE
    );

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
                    maxWidth: 1100,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 24,
                    boxShadow: "0 22px 60px rgba(15,23,42,0.18)",
                    border: "1px solid rgba(148,163,184,0.25)",
                    padding: 18,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        marginBottom: 12,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                marginBottom: 2,
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            Recruiter Dashboard
                        </h2>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#6b7280",
                            }}
                        >
                            View, filter and manage applications for your posted jobs.
                        </p>
                    </div>
                    <div
                        style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            whiteSpace: "nowrap",
                            border: "1px solid #bfdbfe",
                        }}
                    >
                        {applications.length} application
                        {applications.length === 1 ? "" : "s"}
                    </div>
                </div>

                {/* Filters */}
                <form
                    onSubmit={handleApplyFilters}
                    style={{
                        background: "#f9fafb",
                        padding: 10,
                        borderRadius: 14,
                        marginBottom: 14,
                        border: "1px solid #e5e7eb",
                        display: "grid",
                        gridTemplateColumns: "2fr 1.3fr 1.1fr auto",
                        gap: 8,
                        alignItems: "flex-end",
                    }}
                >
                    <div>
                        <label
                            className="form-label"
                            style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}
                        >
                            Search Candidate
                        </label>
                        <input
                            className="input"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Name or email"
                        />
                    </div>

                    <div>
                        <label
                            className="form-label"
                            style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}
                        >
                            Job Title
                        </label>
                        <input
                            className="input"
                            name="job"
                            value={filters.job}
                            onChange={handleFilterChange}
                            placeholder="e.g. React Developer"
                        />
                    </div>

                    <div>
                        <label
                            className="form-label"
                            style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}
                        >
                            Status
                        </label>
                        <select
                            className="input"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="">All</option>
                            <option value="applied">Applied</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="selected">Selected</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: 6,
                            justifyContent: "flex-end",
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleClearFilters}
                            style={{ fontSize: 13 }}
                        >
                            Clear
                        </button>
                        <button
                            className="btn btn-primary"
                            type="submit"
                            style={{ fontSize: 13 }}
                        >
                            Apply
                        </button>
                    </div>
                </form>

                {error && (
                    <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>
                        {error}
                    </p>
                )}

                {loading ? (
                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                        Loading applications...
                    </p>
                ) : applications.length === 0 ? (
                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                        No applications found.
                    </p>
                ) : (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1.2fr)",
                            gap: 12,
                            alignItems: "flex-start",
                        }}
                    >
                        {/* Left: Application list */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 6,
                            }}
                        >
                            {currentApplications.map((app) => (
                                <div
                                    key={app.id}
                                    style={{
                                        borderRadius: 12,
                                        border: "1px solid #e5e7eb",
                                        padding: "8px 10px",
                                        background: "#ffffff",
                                        boxShadow: "0 2px 6px rgba(15,23,42,0.04)",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            alignItems: "flex-start",
                                        }}
                                    >
                                        {/* Left side: job + candidate info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    fontSize: 14,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        whiteSpace: "nowrap",
                                                        textOverflow: "ellipsis",
                                                        overflow: "hidden",
                                                        maxWidth: "260px",
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
                                                    marginTop: 2,
                                                    fontSize: 11,
                                                    color: "#6b7280",
                                                    display: "flex",
                                                    gap: 6,
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                {app.job?.location && (
                                                    <span>📍 {app.job.location}</span>
                                                )}
                                                {app.job?.job_type && (
                                                    <span>• {app.job.job_type}</span>
                                                )}
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: 4,
                                                    fontSize: 12,
                                                    color: "#374151",
                                                }}
                                            >
                                                Candidate:{" "}
                                                <strong>
                                                    {app.candidate_username || "Unknown"}
                                                </strong>
                                            </div>

                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#9ca3af",
                                                    marginTop: 2,
                                                }}
                                            >
                                                Applied on{" "}
                                                {new Date(
                                                    app.applied_at
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Right side: status + actions */}
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 6,
                                                alignItems: "flex-end",
                                                minWidth: 170,
                                            }}
                                        >
                                            <div>{renderStatusPill(app.status)}</div>

                                            <select
                                                className="input"
                                                style={{
                                                    fontSize: 11,
                                                    padding: "2px 6px",
                                                    height: 26,
                                                    minWidth: 130,
                                                }}
                                                value={app.status}
                                                onChange={(e) =>
                                                    handleStatusChange(app.id, e.target.value)
                                                }
                                            >
                                                <option value="applied">Applied</option>
                                                <option value="shortlisted">Shortlisted</option>
                                                <option value="selected">Selected</option>
                                                <option value="rejected">Rejected</option>
                                            </select>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: 6,
                                                    justifyContent: "flex-end",
                                                }}
                                            >
                                                <button
                                                    className="btn btn-outline"
                                                    type="button"
                                                    onClick={() => openCandidateProfile(app)}
                                                    style={{
                                                        fontSize: 11,
                                                        padding: "3px 8px",
                                                    }}
                                                >
                                                    View
                                                </button>

                                                <button
                                                    className="btn btn-primary"
                                                    type="button"
                                                    onClick={() => handleDownloadResume(app.id)}
                                                    style={{
                                                        fontSize: 11,
                                                        padding: "3px 8px",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    📄 Resume
                                                </button>

                                                <button
                                                    className="btn btn-outline"
                                                    type="button"
                                                    onClick={() => openScheduleInterview(app)}
                                                    style={{
                                                        fontSize: 11,
                                                        padding: "3px 8px",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    📅 Interview
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {applications.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <PaginationControls
                                        page={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Right: Candidate profile panel */}
                        <div
                            style={{
                                borderRadius: 16,
                                border: "1px solid #e5e7eb",
                                padding: 14,
                                background: "#ffffff",
                                minHeight: 160,
                                maxHeight: 460,
                                boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 15,
                                        }}
                                    >
                                        Candidate Profile
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#9ca3af",
                                        }}
                                    >
                                        Quick view of the selected applicant.
                                    </div>
                                </div>
                            </div>

                            {profileLoading && (
                                <p
                                    style={{
                                        fontSize: 13,
                                        color: "#6b7280",
                                        marginTop: 8,
                                    }}
                                >
                                    Loading profile…
                                </p>
                            )}

                            {!profileLoading && !activeProfile && (
                                <div
                                    style={{
                                        flex: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        textAlign: "center",
                                    }}
                                >
                                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                                        Select an application and click{" "}
                                        <span style={{ fontWeight: 600 }}>
                                            “View Profile”
                                        </span>{" "}
                                        to see candidate details here.
                                    </p>
                                </div>
                            )}

                            {!profileLoading && activeProfile && (
                                <div
                                    style={{
                                        fontSize: 13,
                                        color: "#374151",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 6,
                                        overflowY: "auto",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 8,
                                            alignItems: "flex-start",
                                            marginBottom: 4,
                                        }}
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: 15,
                                                    fontWeight: 600,
                                                    marginBottom: 2,
                                                }}
                                            >
                                                {activeProfile.user?.username ||
                                                    activeProfile.user_username ||
                                                    activeProfile.username ||
                                                    "Unknown Candidate"}
                                            </div>
                                            {activeProfile.jobTitle && (
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#6b7280",
                                                    }}
                                                >
                                                    Applied for{" "}
                                                    <strong>{activeProfile.jobTitle}</strong>
                                                    {activeProfile.companyName && (
                                                        <span>
                                                            {" "}
                                                            @ {activeProfile.companyName}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {activeProfile.status && (
                                            <div>{renderStatusPill(activeProfile.status)}</div>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            borderRadius: 10,
                                            background: "#f9fafb",
                                            padding: 8,
                                            border: "1px solid #e5e7eb",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 4,
                                        }}
                                    >
                                        <div>
                                            <strong>Experience:</strong>{" "}
                                            {activeProfile.experience || 0} year
                                            {activeProfile.experience === 1 ? "" : "s"}
                                        </div>

                                        <div>
                                            <strong>Skills:</strong>{" "}
                                            {activeProfile.skills?.trim()
                                                ? activeProfile.skills
                                                : "Not specified."}
                                        </div>

                                        {activeProfile.bio?.trim() && (
                                            <div>
                                                <strong>Bio:</strong>{" "}
                                                <span style={{ fontSize: 12 }}>
                                                    {activeProfile.bio}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: 10,
                                            display: "flex",
                                            justifyContent: "flex-start",
                                        }}
                                    >
                                        {activeProfile.resume ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    handleDownloadResume(
                                                        activeProfile.application_id
                                                    )
                                                }
                                                style={{
                                                    fontSize: 12,
                                                    padding: "6px 12px",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: 6,
                                                }}
                                            >
                                                <span>📄</span>
                                                <span>Download Resume</span>
                                            </button>
                                        ) : (
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    color: "#9ca3af",
                                                }}
                                            >
                                                No resume uploaded for this candidate.
                                            </span>
                                        )}
                                    </div>

                                    {/* ✅ Test summary + See Performance button */}
                                    {activeProfile.application_id && (
                                        <div
                                            style={{
                                                marginTop: 10,
                                                borderRadius: 10,
                                                border: "1px solid #e5e7eb",
                                                background: "#f9fafb",
                                                padding: 8,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 8,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 2,
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    Test Score
                                                </span>

                                                {/* 
                                                  NOTE:
                                                  If your API already returns score fields
                                                  in the candidate profile, you can show them
                                                  here by replacing these fallbacks.
                                                */}
                                                <span
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#6b7280",
                                                    }}
                                                >
                                                    {/* Try common field names, otherwise fallback */}
                                                    {activeProfile.test_score != null
                                                        ? `${activeProfile.test_score}${activeProfile.test_total
                                                            ? ` / ${activeProfile.test_total}`
                                                            : ""
                                                        }`
                                                        : activeProfile.test_percentage != null
                                                            ? `${activeProfile.test_percentage}%`
                                                            : "Score available in performance view."}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="btn btn-outline"
                                                style={{
                                                    fontSize: 11,
                                                    padding: "6px 10px",
                                                    whiteSpace: "nowrap",
                                                }}
                                                onClick={() =>
                                                    setPerformanceModalAppId(
                                                        activeProfile.application_id
                                                    )
                                                }
                                            >
                                                See Performance
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Schedule Interview Modal */}
            {interviewModalApp && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15,23,42,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 50,
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <div
                        className="card"
                        style={{
                            width: "100%",
                            maxWidth: 560,
                            background: "#ffffff",
                            borderRadius: 18,
                            padding: 20,
                            boxShadow: "0 20px 40px rgba(15,23,42,0.45)",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 16,
                                borderBottom: "1px solid #e5e7eb",
                                paddingBottom: 10,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 18,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            width: 26,
                                            height: 26,
                                            borderRadius: "999px",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "#eef2ff",
                                            fontSize: 14,
                                        }}
                                    >
                                        📅
                                    </span>
                                    Schedule Interview
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#6b7280",
                                        marginTop: 4,
                                    }}
                                >
                                    {interviewModalApp.job?.title || "Job"} •{" "}
                                    <span style={{ fontWeight: 500 }}>
                                        {interviewModalApp.candidate_username || "Candidate"}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{
                                    fontSize: 11,
                                    padding: "4px 10px",
                                    borderRadius: 999,
                                    borderColor: "#e5e7eb",
                                }}
                                onClick={closeScheduleInterview}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleCreateInterview}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 12,
                                fontSize: 13,
                            }}
                        >
                            <div>
                                <label
                                    className="form-label"
                                    style={{ fontSize: 12, fontWeight: 500 }}
                                >
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    className="input"
                                    value={interviewForm.date}
                                    onChange={handleInterviewInputChange}
                                    style={{ fontSize: 13 }}
                                />
                            </div>

                            <div>
                                <label
                                    className="form-label"
                                    style={{ fontSize: 12, fontWeight: 500 }}
                                >
                                    Time
                                </label>
                                <input
                                    type="time"
                                    name="time"
                                    className="input"
                                    value={interviewForm.time}
                                    onChange={handleInterviewInputChange}
                                    style={{ fontSize: 13 }}
                                />
                            </div>

                            <div>
                                <label
                                    className="form-label"
                                    style={{ fontSize: 12, fontWeight: 500 }}
                                >
                                    Mode
                                </label>
                                <select
                                    name="mode"
                                    className="input"
                                    value={interviewForm.mode}
                                    onChange={handleInterviewInputChange}
                                    style={{ fontSize: 13 }}
                                >
                                    <option value="online">Online</option>
                                    <option value="onsite">Onsite</option>
                                    <option value="phone">Phone</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    className="form-label"
                                    style={{ fontSize: 12, fontWeight: 500 }}
                                >
                                    Location / Link
                                </label>
                                <input
                                    name="location"
                                    className="input"
                                    placeholder="Meeting link or address"
                                    value={interviewForm.location}
                                    onChange={handleInterviewInputChange}
                                    style={{ fontSize: 13 }}
                                />
                            </div>

                            <div style={{ gridColumn: "1 / -1" }}>
                                <label
                                    className="form-label"
                                    style={{ fontSize: 12, fontWeight: 500 }}
                                >
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    className="input"
                                    rows={3}
                                    placeholder="Optional notes for the candidate"
                                    value={interviewForm.notes}
                                    onChange={handleInterviewInputChange}
                                    style={{ fontSize: 13, resize: "vertical" }}
                                />
                            </div>

                            <div
                                style={{
                                    gridColumn: "1 / -1",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: 8,
                                    marginTop: 4,
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "#9ca3af",
                                    }}
                                >
                                    Interview details will be visible to the candidate.
                                </span>

                                <div style={{ display: "flex", gap: 8 }}>
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={closeScheduleInterview}
                                        style={{ fontSize: 13, borderRadius: 999 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{
                                            fontSize: 13,
                                            borderRadius: 999,
                                            paddingInline: 18,
                                        }}
                                    >
                                        Save Interview
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* Interviews list */}
                        <div
                            style={{
                                marginTop: 16,
                                fontSize: 12,
                                maxHeight: 180,
                                overflowY: "auto",
                                borderTop: "1px solid #e5e7eb",
                                paddingTop: 10,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    marginBottom: 6,
                                    color: "#111827",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                <span>Upcoming interviews</span>
                                {interviews && interviews.length > 0 && (
                                    <span
                                        style={{
                                            fontSize: 11,
                                            padding: "0 8px",
                                            borderRadius: 999,
                                            background: "#f3f4f6",
                                        }}
                                    >
                                        {interviews.length}
                                    </span>
                                )}
                            </div>

                            {interviewsLoading && (
                                <p style={{ color: "#6b7280", margin: 0 }}>
                                    Loading interviews…
                                </p>
                            )}

                            {!interviewsLoading &&
                                (!interviews || interviews.length === 0) && (
                                    <p style={{ color: "#9ca3af", margin: 0 }}>
                                        No interviews scheduled yet.
                                    </p>
                                )}

                            {!interviewsLoading && interviews && interviews.length > 0 && (
                                <ul
                                    style={{
                                        listStyle: "none",
                                        padding: 0,
                                        margin: 0,
                                    }}
                                >
                                    {interviews.map((iv) => (
                                        <li
                                            key={iv.id}
                                            style={{
                                                padding: "8px 10px",
                                                borderRadius: 10,
                                                border: "1px solid #e5e7eb",
                                                marginBottom: 6,
                                                background: "#f9fafb",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    fontSize: 12,
                                                    marginBottom: 2,
                                                    gap: 8,
                                                }}
                                            >
                                                <span style={{ fontWeight: 500 }}>
                                                    {iv.scheduled_at
                                                        ? new Date(
                                                            iv.scheduled_at
                                                        ).toLocaleString()
                                                        : "No time"}
                                                </span>
                                                <span
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
                                                </span>
                                            </div>

                                            {iv.location && (
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#6b7280",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    📍 {iv.location}
                                                </div>
                                            )}

                                            {iv.notes && (
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        color: "#4b5563",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    📝 {iv.notes}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ Test Performance Modal */}
            {performanceModalAppId && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15,23,42,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 60,
                        backdropFilter: "blur(4px)",
                    }}
                >
                    <div
                        className="card"
                        style={{
                            width: "100%",
                            maxWidth: 640,
                            maxHeight: "80vh",
                            overflowY: "auto",
                            background: "#ffffff",
                            borderRadius: 18,
                            padding: 20,
                            boxShadow: "0 20px 40px rgba(15,23,42,0.45)",
                            border: "1px solid #e5e7eb",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                                borderBottom: "1px solid #e5e7eb",
                                paddingBottom: 8,
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: 18,
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            width: 26,
                                            height: 26,
                                            borderRadius: "999px",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "#fee2e2",
                                            fontSize: 14,
                                        }}
                                    >
                                        📊
                                    </span>
                                    Test Performance
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#6b7280",
                                        marginTop: 2,
                                    }}
                                >
                                    Detailed MCQ test performance for this application.
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-outline"
                                style={{
                                    fontSize: 11,
                                    padding: "4px 10px",
                                    borderRadius: 999,
                                    borderColor: "#e5e7eb",
                                }}
                                onClick={() => setPerformanceModalAppId(null)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Full test performance view */}
                        <RecruiterTestResult applicationId={performanceModalAppId} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecruiterDashboard;
