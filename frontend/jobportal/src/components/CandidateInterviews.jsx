    import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

export default function CandidateInterviews() {
    const { isAuthenticated, loadingUser } = useAuth();

    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Fetch interviews for the logged-in candidate
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchInterviews = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await axiosClient.get("interviews/"); // -> /api/interviews/
                const items = Array.isArray(res.data) ? res.data : res.data.results || [];
                // Sort by date ascending
                const sorted = [...items].sort((a, b) => {
                    const da = a.scheduled_at ? new Date(a.scheduled_at) : 0;
                    const db = b.scheduled_at ? new Date(b.scheduled_at) : 0;
                    return da - db;
                });
                setInterviews(sorted);
            } catch (err) {
                console.error("Error fetching candidate interviews:", err);
                setError("Could not load interviews. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, [isAuthenticated]);

    if (!isAuthenticated && !loadingUser) {
        return (
            <div style={{ fontSize: 14, color: "#6b7280" }}>
                Please log in to see your interview schedule.
            </div>
        );
    }

    const now = new Date();

    const upcoming = interviews.filter((iv) => {
        if (!iv.scheduled_at) return false;
        const d = new Date(iv.scheduled_at);
        return d >= now;
    });

    const past = interviews.filter((iv) => {
        if (!iv.scheduled_at) return false;
        const d = new Date(iv.scheduled_at);
        return d < now;
    });

    const formatDateTime = (isoString) => {
        if (!isoString) return "No time";
        const d = new Date(isoString);
        return d.toLocaleString();
    };

    const getJobTitle = (iv) =>
        iv.job?.title ||
        iv.application?.job?.title ||
        iv.job_title ||
        "Job";

    const getCompanyName = (iv) =>
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

    const renderList = (items, emptyText) => {
        if (items.length === 0) {
            return (
                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
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
                        {/* Top row: title + status */}
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
                                        {getJobTitle(iv)}
                                    </span>
                                    {getCompanyName(iv) && (
                                        <span
                                            style={{
                                                fontSize: 11,
                                                color: "#6b7280",
                                                padding: "1px 6px",
                                                borderRadius: 999,
                                                background: "#f3f4f6",
                                            }}
                                        >
                                            {getCompanyName(iv)}
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
                                {(iv.mode || "online")} • {iv.status || "scheduled"}
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ marginTop: 6, fontSize: 12, color: "#4b5563" }}>
                            {iv.mode && (
                                <div style={{ marginBottom: 2 }}>
                                    <strong>Mode:</strong> {iv.mode}
                                </div>
                            )}
                            {iv.location && (
                                <div style={{ marginBottom: 2 }}>
                                    <strong>
                                        {iv.mode === "online" ? "Meeting link:" : "Location:"}
                                    </strong>{" "}
                                    {renderLocation(iv.location)}
                                </div>
                            )}
                            {iv.notes && (
                                <div style={{ marginTop: 2, fontSize: 11, color: "#6b7280" }}>
                                    📝 {iv.notes}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div
            className="card"
            style={{
                background: "#ffffff",
                borderRadius: 12,
                padding: 12,
                border: "1px solid #e5e7eb",
            }}
        >
            <div
                style={{
                    marginBottom: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                        Interview Schedule
                    </div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>
                        View your upcoming and past interview invitations.
                    </div>
                </div>
            </div>

            {loading || loadingUser ? (
                <p style={{ fontSize: 13, color: "#6b7280" }}>Loading interviews…</p>
            ) : error ? (
                <p style={{ fontSize: 13, color: "#ef4444" }}>{error}</p>
            ) : (
                <>
                    {/* Upcoming */}
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
                        {renderList(
                            upcoming,
                            "You don't have any upcoming interviews yet."
                        )}
                    </div>

                    {/* Past */}
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
                        {renderList(
                            past,
                            "No past interviews found."
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
