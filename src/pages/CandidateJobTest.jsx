import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const CandidateJobTest = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const [expired, setExpired] = useState(false);

    const timerKey = `test_timer_${applicationId}`;

    // Format mm:ss
    const formatTime = (secs) => {
        if (secs == null || Number.isNaN(secs)) return "--:--";
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    };

    // Fetch test + initialize timer from localStorage
    useEffect(() => {
        const fetchTest = async () => {
            setLoading(true);
            setError("");

            try {
                // 🔹 Check timer
                const stored = localStorage.getItem(timerKey);
                if (!stored) {
                    setError(
                        "Test is not available. Please start the test from My Applications."
                    );
                    setTest(null);
                    setExpired(true);
                    return;
                }

                let parsed;
                try {
                    parsed = JSON.parse(stored);
                } catch {
                    parsed = null;
                }

                if (!parsed || !parsed.expiresAt) {
                    setError("Invalid test timer. Please contact support.");
                    setTest(null);
                    setExpired(true);
                    return;
                }

                const now = Date.now();
                const diffMs = parsed.expiresAt - now;
                if (diffMs <= 0) {
                    setError("Test time is already over.");
                    setTest(null);
                    setRemainingSeconds(0);
                    setExpired(true);
                    return;
                }

                const initialSeconds = Math.floor(diffMs / 1000);
                setRemainingSeconds(initialSeconds);

                // 🔹 Load test questions
                const res = await axiosClient.get(
                    `/applications/${applicationId}/test/`
                );
                setTest(res.data);

                const initial = {};
                res.data.questions.forEach((q) => {
                    initial[q.id] = "";
                });
                setAnswers(initial);
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.detail ||
                        "Could not load test. You may not have access or test is not available."
                );
            } finally {
                setLoading(false);
            }
        };

        if (applicationId) {
            fetchTest();
        }
    }, [applicationId, timerKey]);

    const handleOptionChange = (questionId, option) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: option,
        }));
    };

    // Common payload builder
    const buildPayload = () => ({
        answers: Object.entries(answers)
            .filter(([, selected]) => !!selected)
            .map(([question_id, selected_option]) => ({
                question_id: Number(question_id),
                selected_option,
            })),
    });

    // Manual submit (button)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting || expired || result) return;

        setSubmitting(true);
        setError("");

        try {
            const payload = buildPayload();

            const res = await axiosClient.post(
                `/applications/${applicationId}/submit-test/`,
                payload
            );
            setResult(res.data);
            setExpired(true);
            localStorage.removeItem(timerKey);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.detail ||
                    "Could not submit test. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Auto-submit (time-over, tab-switch, etc.)
    const autoSubmit = useCallback(
        async (reason) => {
            if (submitting || result || expired) return;

            setSubmitting(true);
            setError("");

            try {
                const payload = {
                    ...buildPayload(),
                    auto_submitted: true,
                    reason: reason || "auto",
                };

                const res = await axiosClient.post(
                    `/applications/${applicationId}/submit-test/`,
                    payload
                );

                // ✅ Save score and mark as expired, but STAY on this page
                setResult(res.data);
                setExpired(true);
                localStorage.removeItem(timerKey);
                // ❌ NO redirect here – user stays and sees score in the UI
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.detail ||
                        "Could not auto-submit your test. Please contact support."
                );
            } finally {
                setSubmitting(false);
            }
        },
        [applicationId, expired, result, submitting, answers, timerKey]
    );

    // Countdown timer effect
    useEffect(() => {
        if (remainingSeconds == null || expired || result) return;

        if (remainingSeconds <= 0) {
            setRemainingSeconds(0);
            setExpired(true);
            autoSubmit("time-over");
            return;
        }

        const intervalId = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev == null) return prev;
                if (prev <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [remainingSeconds, expired, result, autoSubmit]);

    // Tab switching → auto-submit
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !expired && !result) {
                autoSubmit("tab-switch");
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
    }, [expired, result, autoSubmit]);

    // Refresh / close → warn
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!expired && !result) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [expired, result]);

    // Block copy / paste / cut + shortcuts
    const blockClipboard = (e) => {
        e.preventDefault();
        alert("Copy / paste is disabled during the test.");
    };

    const blockShortcuts = (e) => {
        if (
            (e.ctrlKey || e.metaKey) &&
            ["c", "v", "x", "a", "s", "p"].includes(e.key.toLowerCase())
        ) {
            e.preventDefault();
        }
    };

    const goToApplications = () => {
        navigate("/candidate/applications");
    };

    if (loading) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)",
                }}
            >
                <div
                    style={{
                        padding: "10px 16px",
                        borderRadius: 999,
                        background: "rgba(15,23,42,0.9)",
                        color: "#e5e7eb",
                        fontSize: 13,
                        border: "1px solid rgba(148,163,184,0.7)",
                    }}
                >
                    Loading test...
                </div>
            </div>
        );
    }

    // ❗ Only show "expired" message if we have NO result
    if ((error && !test) || (expired && !result)) {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)",
                    padding: 16,
                }}
            >
                <div
                    style={{
                        maxWidth: 420,
                        width: "100%",
                        background: "rgba(127,29,29,0.16)",
                        borderRadius: 18,
                        padding: 16,
                        border: "1px solid rgba(248,113,113,0.7)",
                        color: "#fecaca",
                        fontSize: 13,
                        marginBottom: 10,
                    }}
                >
                    {error || "This test is no longer available or has expired."}
                </div>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={goToApplications}
                    style={{ fontSize: 13 }}
                >
                    Go to My Applications
                </button>
            </div>
        );
    }

    if (!test) return null;

    return (
        <div
            onCopy={blockClipboard}
            onCut={blockClipboard}
            onPaste={blockClipboard}
            onKeyDown={blockShortcuts}
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                    "radial-gradient(circle at top, #0f172a 0, #020617 55%, #000 100%)",
                padding: 16,
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 960,
                    background: "rgba(15,23,42,0.94)",
                    borderRadius: 24,
                    padding: 18,
                    border: "1px solid rgba(148,163,184,0.5)",
                    boxShadow: "0 24px 80px rgba(15,23,42,0.9)",
                    color: "#e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "90vh",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                        marginBottom: 12,
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: 22,
                                fontWeight: 600,
                                marginBottom: 4,
                            }}
                        >
                            Skill Assessment
                        </h1>
                        <div
                            style={{
                                fontSize: 12,
                                color: "#9ca3af",
                            }}
                        >
                            25 questions · 2 marks each · Total {test.total_marks}{" "}
                            marks
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#6b7280",
                                marginTop: 2,
                            }}
                        >
                            Complete this test to increase your chances of being
                            shortlisted.
                        </div>
                        <div
                            style={{
                                fontSize: 11,
                                color: "#facc15",
                                marginTop: 4,
                            }}
                        >
                            Time remaining:{" "}
                            <strong>{formatTime(remainingSeconds)}</strong> (auto
                            submit when time ends)
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 8,
                        }}
                    >
                        {/* Timer badge */}
                        <div
                            style={{
                                padding: "6px 12px",
                                borderRadius: 999,
                                backgroundColor: expired
                                    ? "rgba(127,29,29,0.8)"
                                    : "rgba(15,23,42,0.9)",
                                border: expired
                                    ? "1px solid rgba(248,113,113,0.8)"
                                    : "1px solid rgba(129,140,248,0.8)",
                                fontSize: 13,
                                fontWeight: 600,
                                minWidth: 90,
                                textAlign: "center",
                            }}
                        >
                            {expired
                                ? "Time Up"
                                : `⏱ ${formatTime(remainingSeconds)}`}
                        </div>

                        {result && (
                            <div
                                style={{
                                    padding: "8px 10px",
                                    borderRadius: 16,
                                    border: "1px solid rgba(52,211,153,0.7)",
                                    background: "rgba(6,78,59,0.5)",
                                    textAlign: "right",
                                    minWidth: 160,
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: "#d1fae5",
                                    }}
                                >
                                    Your Score
                                </div>
                                <div
                                    style={{
                                        fontSize: 18,
                                        fontWeight: 700,
                                        color: "#6ee7b7",
                                    }}
                                >
                                    {result.score} / {result.total}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        marginTop: 2,
                                        color: result.passed
                                            ? "#bbf7d0"
                                            : "#fecaca",
                                    }}
                                >
                                    {result.passed
                                        ? "Shortlist criteria met"
                                        : "Below shortlist cutoff (30+)"}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div
                        style={{
                            marginBottom: 8,
                            background: "rgba(127,29,29,0.4)",
                            borderRadius: 12,
                            padding: "6px 10px",
                            border: "1px solid rgba(248,113,113,0.7)",
                            fontSize: 12,
                            color: "#fecaca",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Questions list */}
                {!result && (
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            paddingRight: 4,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                        }}
                    >
                        {test.questions.map((q, index) => (
                            <div
                                key={q.id}
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(17,24,39,0.98))",
                                    borderRadius: 16,
                                    padding: 10,
                                    border: "1px solid rgba(55,65,81,0.9)",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: 13,
                                        marginBottom: 6,
                                    }}
                                >
                                    <span
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: 22,
                                            height: 22,
                                            borderRadius: 999,
                                            background: "rgba(16,185,129,0.1)",
                                            border:
                                                "1px solid rgba(52,211,153,0.8)",
                                            color: "#6ee7b7",
                                            fontSize: 11,
                                            fontWeight: 600,
                                            marginRight: 6,
                                        }}
                                    >
                                        {index + 1}
                                    </span>
                                    {q.text}
                                </p>

                                <div
                                    style={{
                                        display: "grid",
                                        gap: 6,
                                    }}
                                >
                                    {[
                                        { label: "A", text: q.option_a },
                                        { label: "B", text: q.option_b },
                                        { label: "C", text: q.option_c },
                                        { label: "D", text: q.option_d },
                                    ].map((opt) => (
                                        <label
                                            key={opt.label}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                padding: "6px 8px",
                                                borderRadius: 12,
                                                cursor: "pointer",
                                                border:
                                                    answers[q.id] === opt.label
                                                        ? "1px solid rgba(52,211,153,0.9)"
                                                        : "1px solid rgba(55,65,81,0.9)",
                                                background:
                                                    answers[q.id] === opt.label
                                                        ? "rgba(6,78,59,0.65)"
                                                        : "rgba(15,23,42,0.9)",
                                                fontSize: 12,
                                            }}
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${q.id}`}
                                                style={{ display: "none" }}
                                                checked={
                                                    answers[q.id] === opt.label
                                                }
                                                onChange={() =>
                                                    handleOptionChange(
                                                        q.id,
                                                        opt.label
                                                    )
                                                }
                                            />
                                            <span
                                                style={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: 999,
                                                    border:
                                                        "1px solid rgba(148,163,184,0.8)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: 11,
                                                    color: "#e5e7eb",
                                                }}
                                            >
                                                {opt.label}
                                            </span>
                                            <span>{opt.text}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: 6,
                                paddingTop: 6,
                                borderTop: "1px dashed rgba(75,85,99,0.8)",
                                fontSize: 11,
                                color: "#9ca3af",
                            }}
                        >
                            <span>
                                Once you submit, your answers cannot be changed.
                            </span>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || expired}
                                style={{
                                    fontSize: 13,
                                    paddingInline: 18,
                                }}
                            >
                                {submitting ? "Submitting..." : "Submit Test"}
                            </button>
                        </div>
                    </form>
                )}

                {/* After result */}
                {result && (
                    <div
                        style={{
                            marginTop: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: 12,
                        }}
                    >
                        <div
                            style={{
                                color: "#9ca3af",
                                fontSize: 11,
                            }}
                        >
                            Your performance has been shared with the recruiter.
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={goToApplications}
                            style={{ fontSize: 13 }}
                        >
                            Go to My Applications
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateJobTest;
