import { useEffect, useState } from "react";
import { getSavedJobs } from "../api/jobs";
import JobCard from "../components/JobCard";

const SavedJobs = () => {
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSaved = async () => {
            try {
                setError("");
                const res = await getSavedJobs();
                setSaved(res.data);
            } catch (err) {
                console.error(
                    "Error loading saved jobs:",
                    err.response?.data || err
                );
                setError("Could not load saved jobs.");
            } finally {
                setLoading(false);
            }
        };

        loadSaved();
    }, []);

    if (loading) {
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
                        padding: "12px 18px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.95)",
                        boxShadow: "0 12px 35px rgba(15,23,42,0.14)",
                        fontSize: 14,
                        color: "#4b5563",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    <span
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: "999px",
                            border: "2px solid #4f46e5",
                            borderTopColor: "transparent",
                            display: "inline-block",
                            animation: "spin 0.7s linear infinite",
                        }}
                    />
                    <span>Loading your saved jobs…</span>

                    <style>
                        {`
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    `}
                    </style>
                </div>
            </div>
        );
    }

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
                    maxWidth: 900,
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
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: 4,
                            }}
                        >
                            Saved Jobs ❤️
                        </h2>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#6b7280",
                                maxWidth: 480,
                            }}
                        >
                            All the jobs you&apos;ve bookmarked, in one place.
                            Come back anytime and apply when you&apos;re ready.
                        </p>
                    </div>
                    {saved.length > 0 && (
                        <div
                            style={{
                                padding: "6px 12px",
                                borderRadius: 999,
                                fontSize: 12,
                                background: "#f0f9ff",
                                color: "#0369a1",
                                border: "1px solid #bae6fd",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {saved.length} saved job
                            {saved.length === 1 ? "" : "s"}
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <p
                        style={{
                            color: "#b91c1c",
                            fontSize: 13,
                            marginTop: 10,
                        }}
                    >
                        {error}
                    </p>
                )}

                {/* Content */}
                {saved.length === 0 ? (
                    <p
                        style={{
                            marginTop: 16,
                            fontSize: 14,
                            color: "#6b7280",
                        }}
                    >
                        You haven&apos;t saved any jobs yet. Tap the ❤️ icon on
                        a job to save it here.
                    </p>
                ) : (
                    <div
                        style={{
                            marginTop: 16,
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: 12,
                        }}
                    >
                        {saved.map((item) => (
                            <JobCard
                                key={item.id}
                                job={{ ...item.job, is_saved: true }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedJobs;
