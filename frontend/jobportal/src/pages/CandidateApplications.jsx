import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import PaginationControls from "../components/PaginationControls";

const CandidateApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawingId, setWithdrawingId] = useState(null);

    // 🔹 New state for Test popup
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);

    // 🔹 Track tests that have already been started (and should now be expired/locked)
    const [testLocked, setTestLocked] = useState({});

    // 🔹 Live time for the modal (for info display)
    const [currentTime, setCurrentTime] = useState(new Date());

    const navigate = useNavigate();

    // Pagination state
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axiosClient.get("applications/");
                setApplications(res.data);
                setPage(1);

                // 🔹 On load, check which tests were already started earlier
                //    If a timer exists in localStorage for that application, we lock the test.
                const locked = {};
                res.data.forEach((app) => {
                    const key = `test_timer_${app.id}`;
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        // We treat it as expired/locked for UI purposes (no re-attempts)
                        locked[app.id] = true;
                    }
                });
                setTestLocked(locked);
            } catch (err) {
                console.error("Error loading applications:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    // 🔹 Update current time every second while modal is open
    useEffect(() => {
        if (!showTestModal) return;
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [showTestModal]);

    // 🔹 Block copy/paste/cut and keyboard shortcuts inside the test modal
    const handleBlockClipboard = (e) => {
        e.preventDefault();
    };

    const handleBlockShortcuts = (e) => {
        if ((e.ctrlKey || e.metaKey) &&
            ["c", "v", "x", "a"].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    };

    const renderStatusPill = (status) => {
        const baseStyle = {
            textTransform: "capitalize",
            fontSize: 12,
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

    const handleWithdraw = async (applicationId) => {
        const confirmWithdraw = window.confirm(
            "Are you sure you want to withdraw this application?"
        );
        if (!confirmWithdraw) return;

        try {
            setWithdrawingId(applicationId);
            await axiosClient.delete(`applications/${applicationId}/`);

            setApplications((prev) =>
                prev.filter((app) => app.id !== applicationId)
            );

            setPage((prevPage) => {
                const remaining = applications.length - 1;
                const newTotalPages =
                    Math.ceil(remaining / ITEMS_PER_PAGE) || 1;
                return Math.min(prevPage, newTotalPages);
            });
        } catch (err) {
            console.error(
                "Error withdrawing application:",
                err.response?.data || err
            );
            alert("Could not withdraw application. Please try again.");
        } finally {
            setWithdrawingId(null);
        }
    };

    // 🔹 When user clicks "Take Test" -> open popup (only if not locked)
    const handleTakeTest = (applicationId) => {
        if (testLocked[applicationId]) return; // already expired/locked
        setSelectedApplicationId(applicationId);
        setShowTestModal(true);
    };

    // 🔹 Close popup without starting test
    const handleCloseTestModal = () => {
        setShowTestModal(false);
        setSelectedApplicationId(null);
    };

    // 🔹 Start test: set 30 min limit + navigate + lock test for future
    const handleConfirmStartTest = () => {
        if (!selectedApplicationId) return;

        // Exactly 30 mins from now
        const expiresAt = Date.now() + 30 * 60 * 1000;

        try {
            // You can read this in your Test component to enforce the timer
            localStorage.setItem(
                `test_timer_${selectedApplicationId}`,
                JSON.stringify({
                    applicationId: selectedApplicationId,
                    expiresAt,
                })
            );

            // 🔹 Immediately lock this test so user cannot come back and start again
            setTestLocked((prev) => ({
                ...prev,
                [selectedApplicationId]: true,
            }));
        } catch (e) {
            console.error("Failed to save test timer", e);
        }

        setShowTestModal(false);
        navigate(`/candidate/test/${selectedApplicationId}`);
    };

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
                    <span>Loading your applications…</span>

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

    // Pagination calculations
    const totalPages =
        Math.ceil(applications.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const currentApplications = applications.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
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
                            My Applications
                        </h2>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#6b7280",
                                maxWidth: 480,
                            }}
                        >
                            Track the jobs you&apos;ve applied for. After applying,
                            come here to take the skill test for each application.
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

                {/* Content */}
                {applications.length === 0 ? (
                    <p
                        style={{
                            marginTop: 16,
                            fontSize: 14,
                            color: "#6b7280",
                        }}
                    >
                        You haven&apos;t applied to any jobs yet. Browse jobs and
                        apply to get started.
                    </p>
                ) : (
                    <>
                        <ul
                            style={{
                                listStyle: "none",
                                paddingLeft: 0,
                                marginTop: 18,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            {currentApplications.map((app) => {
                                const isLocked = !!testLocked[app.id];
                                const isDisabled =
                                    !app.test || app.test.completed_at || isLocked;

                                return (
                                    <li
                                        key={app.id}
                                        style={{
                                            border: "1px solid #e5e7eb",
                                            borderRadius: 14,
                                            padding: "10px 12px",
                                            background:
                                                "linear-gradient(135deg,#ffffff,#f9fafb)",
                                            boxShadow:
                                                "0 2px 6px rgba(15,23,42,0.05)",
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
                                            {/* Left: job info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        fontSize: 15,
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
                                                            maxWidth: 260,
                                                        }}
                                                    >
                                                        {app.job?.title || "Job"}
                                                    </span>
                                                    {app.job?.company_name && (
                                                        <span
                                                            style={{
                                                                color: "#6b7280",
                                                                fontSize: 11,
                                                                padding:
                                                                    "1px 6px",
                                                                borderRadius: 999,
                                                                background:
                                                                    "#f3f4f6",
                                                            }}
                                                        >
                                                            {
                                                                app.job
                                                                    .company_name
                                                            }
                                                        </span>
                                                    )}
                                                </div>

                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#6b7280",
                                                        marginTop: 2,
                                                    }}
                                                >
                                                    {app.job?.location} •{" "}
                                                    {app.job?.job_type}
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop: 6,
                                                        fontSize: 12,
                                                        color: "#9ca3af",
                                                    }}
                                                >
                                                    Applied on{" "}
                                                    {app.applied_at
                                                        ? new Date(
                                                            app.applied_at
                                                        ).toLocaleDateString()
                                                        : "-"}
                                                </div>

                                                {app.cover_letter && (
                                                    <div
                                                        style={{
                                                            fontSize: 13,
                                                            marginTop: 6,
                                                            fontStyle: "italic",
                                                            color: "#4b5563",
                                                        }}
                                                    >
                                                        “{app.cover_letter}”
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right: status + actions */}
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    alignItems: "flex-end",
                                                    gap: 6,
                                                }}
                                            >
                                                {renderStatusPill(app.status)}

                                                {/* Take Test button */}
                                                <button
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() =>
                                                        handleTakeTest(app.id)
                                                    }
                                                    style={{
                                                        padding: "4px 10px",
                                                        fontSize: 12,
                                                        borderRadius: 999,
                                                        opacity: isDisabled ? 0.5 : 1,
                                                        cursor: isDisabled
                                                            ? "not-allowed"
                                                            : "pointer",
                                                        backgroundColor:
                                                            app.test?.completed_at
                                                                ? "#9ca3af"
                                                                : isLocked
                                                                    ? "#9ca3af"
                                                                    : "#2563eb",
                                                        color: "white",
                                                        border: "none",
                                                    }}
                                                >
                                                    {app.test?.completed_at
                                                        ? "Test Completed"
                                                        : isLocked
                                                            ? "Test Expired"
                                                            : "Take Test"}
                                                </button>

                                                {/* Withdraw button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-outline"
                                                    onClick={() =>
                                                        handleWithdraw(app.id)
                                                    }
                                                    disabled={
                                                        withdrawingId === app.id
                                                    }
                                                    style={{
                                                        padding: "4px 10px",
                                                        fontSize: 12,
                                                        borderRadius: 999,
                                                    }}
                                                >
                                                    {withdrawingId === app.id
                                                        ? "Withdrawing..."
                                                        : "Withdraw"}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <div style={{ marginTop: 10 }}>
                            <PaginationControls
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    </>
                )}
            </div>

            {/* 🔹 Test Start Popup */}
            {showTestModal && (
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
                            maxWidth: 420,
                            background:
                                "linear-gradient(135deg, #eff6ff, #f9fafb)",
                            borderRadius: 20,
                            boxShadow: "0 24px 80px rgba(15,23,42,0.45)",
                            border: "1px solid rgba(148,163,184,0.35)",
                            padding: "18px 20px",
                        }}
                        tabIndex={0}
                        onCopy={handleBlockClipboard}
                        onPaste={handleBlockClipboard}
                        onCut={handleBlockClipboard}
                        onKeyDown={handleBlockShortcuts}
                    >
                        <h3
                            style={{
                                margin: 0,
                                marginBottom: 8,
                                fontSize: 18,
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            Starting the Test
                        </h3>

                        <div
                            style={{
                                marginBottom: 6,
                                fontSize: 13,
                                color: "#6b7280",
                            }}
                        >
                            Current time:{" "}
                            <strong>
                                {currentTime.toLocaleTimeString()}
                            </strong>
                        </div>

                        <div
                            style={{
                                marginBottom: 6,
                                fontSize: 13,
                                color: "#1d4ed8",
                            }}
                        >
                            Test time limit:&nbsp;
                            <strong>30:00 minutes</strong> from the moment you
                            click <strong>Start Now</strong>.
                        </div>

                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                color: "#4b5563",
                                lineHeight: 1.6,
                            }}
                        >
                            Once you start the test, you must complete it within{" "}
                            <strong>30 minutes</strong>.
                            <br />
                            Please{" "}
                            <strong>
                                do not switch tabs, refresh the page, or use
                                copy / paste during the test
                            </strong>
                            . These actions may cause your test to be submitted
                            automatically.
                        </p>

                        <div
                            style={{
                                marginTop: 16,
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 8,
                            }}
                        >
                            <button
                                type="button"
                                onClick={handleCloseTestModal}
                                style={{
                                    padding: "6px 12px",
                                    fontSize: 13,
                                    borderRadius: 999,
                                    border: "1px solid #e5e7eb",
                                    background: "#ffffff",
                                    color: "#4b5563",
                                    cursor: "pointer",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmStartTest}
                                style={{
                                    padding: "6px 14px",
                                    fontSize: 13,
                                    borderRadius: 999,
                                    border: "none",
                                    background:
                                        "linear-gradient(135deg,#2563eb,#4f46e5)",
                                    color: "#ffffff",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                }}
                            >
                                Start Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CandidateApplications;
