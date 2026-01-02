import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { 
  FiClock, FiAlertCircle, FiCheckCircle, FiXCircle, 
  FiArrowLeft, FiSend, FiBarChart2, FiShield, FiEye, FiEyeOff 
} from "react-icons/fi";

const CandidateJobTest = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();

    const [test, setTest] = useState(null);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");

    const [remainingSeconds, setRemainingSeconds] = useState(null);
    const [expired, setExpired] = useState(false);
    const [tabSwitchCount, setTabSwitchCount] = useState(0);
    const [fullscreen, setFullscreen] = useState(false);

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

                // Show warning
                setWarning("Do not switch tabs or refresh the page. The test will auto-submit.");
                setTimeout(() => setWarning(""), 5000);

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

        const unanswered = Object.values(answers).filter(a => !a).length;
        if (unanswered > 0) {
            if (!window.confirm(`You have ${unanswered} unanswered questions. Submit anyway?`)) {
                return;
            }
        }

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

                setResult(res.data);
                setExpired(true);
                localStorage.removeItem(timerKey);
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
                setTabSwitchCount(prev => prev + 1);
                if (tabSwitchCount >= 2) {
                    autoSubmit("tab-switch");
                } else {
                    setWarning(`Warning: Tab switch detected (${tabSwitchCount + 1}/2 allowed)`);
                    setTimeout(() => setWarning(""), 3000);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () =>
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
    }, [expired, result, autoSubmit, tabSwitchCount]);

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
        setWarning("Copy / paste is disabled during the test.");
        setTimeout(() => setWarning(""), 2000);
    };

    const blockShortcuts = (e) => {
        if (
            (e.ctrlKey || e.metaKey) &&
            ["c", "v", "x", "a", "s", "p"].includes(e.key.toLowerCase())
        ) {
            e.preventDefault();
            setWarning("Shortcuts are disabled during the test.");
            setTimeout(() => setWarning(""), 2000);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(console.log);
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    const goToApplications = () => {
        navigate("/candidate/applications");
    };

    const answeredCount = Object.values(answers).filter(a => a).length;
    const totalQuestions = test?.questions?.length || 0;

    // Loading State
    if (loading) {
        return (
            <div style={loadingContainerStyle}>
                <div style={loadingSpinnerStyle}></div>
                <p style={loadingTextStyle}>
                    Loading assessment...
                </p>
                <p style={loadingSubTextStyle}>
                    Preparing your test environment
                </p>
            </div>
        );
    }

    // Error State
    if ((error && !test) || (expired && !result)) {
        return (
            <div style={errorStateContainerStyle}>
                <div style={errorStateStyle}>
                    <div style={errorIconStyle}>
                        <FiXCircle size={32} />
                    </div>
                    <h4 style={errorTitleStyle}>Test Unavailable</h4>
                    <p style={errorMessageStyle}>
                        {error || "This test is no longer available or has expired."}
                    </p>
                    <button
                        type="button"
                        onClick={goToApplications}
                        style={errorActionButtonStyle}
                    >
                        <FiArrowLeft size={16} style={{ marginRight: 8 }} />
                        Go to My Applications
                    </button>
                </div>
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
            style={pageContainerStyle}
        >
            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            <div style={contentContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>
                            <span style={{ color: '#4f46e5' }}>Skill</span>
                            <span style={{ color: '#7c3aed' }}> Assessment</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Complete this test to increase your chances of being shortlisted
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>Proctored Test</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style={infoCardStyle}>
                        <div style={infoIconStyle}>
                            <FiShield size={20} />
                        </div>
                        <div>
                            <div style={infoTitleStyle}>Secure Environment</div>
                            <div style={infoTextStyle}>
                                Tab switching & copy/paste are restricted
                            </div>
                        </div>
                    </div>
                </div>

                {/* Warning Alert */}
                {warning && (
                    <div style={warningAlertStyle}>
                        <div style={warningIconStyle}>
                            <FiAlertCircle size={18} />
                        </div>
                        <div style={warningContentStyle}>
                            <strong>Warning:</strong> {warning}
                        </div>
                        <button 
                            style={warningCloseStyle}
                            onClick={() => setWarning("")}
                        >
                            <FiXCircle size={16} />
                        </button>
                    </div>
                )}

                {/* Error Alert */}
                {error && (
                    <div style={errorAlertStyle}>
                        <div style={errorIconStyle}>
                            <FiXCircle size={18} />
                        </div>
                        <div style={errorContentStyle}>
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div style={gridContainerStyle}>
                    {/* Left Column - Test Info & Timer (FIXED) */}
                    <div style={leftColumnStyle}>
                        <div style={infoPanelStyle}>
                            <div style={infoPanelHeaderStyle}>
                                <h3 style={infoPanelTitleStyle}>
                                    <FiClock size={20} style={{ marginRight: 10, color: '#4f46e5' }} />
                                    Test Information
                                </h3>
                            </div>

                            {/* Timer Card */}
                            <div style={timerCardStyle}>
                                <div style={timerHeaderStyle}>
                                    <div style={timerIconStyle}>
                                        <FiClock size={24} />
                                    </div>
                                    <div>
                                        <div style={timerLabelStyle}>Time Remaining</div>
                                        <div style={timerValueStyle}>
                                            {formatTime(remainingSeconds)}
                                        </div>
                                    </div>
                                </div>
                                <div style={timerProgressStyle}>
                                    <div 
                                        style={{
                                            ...timerProgressBarStyle,
                                            width: `${(remainingSeconds / (30 * 60)) * 100}%`,
                                            backgroundColor: remainingSeconds < 300 ? '#ef4444' : '#10b981'
                                        }}
                                    ></div>
                                </div>
                                <div style={timerHintStyle}>
                                    {remainingSeconds < 300 ? 'Less than 5 minutes left!' : 'Test auto-submits when time ends'}
                                </div>
                            </div>

                            {/* Stats Card */}
                            <div style={statsCardStyle}>
                                <div style={statsGridStyle}>
                                    <div style={statItemStyle}>
                                        <div style={statNumberStyle}>{totalQuestions}</div>
                                        <div style={statLabelStyle}>Total Questions</div>
                                    </div>
                                    <div style={statItemStyle}>
                                        <div style={statNumberStyle}>{answeredCount}</div>
                                        <div style={statLabelStyle}>Answered</div>
                                    </div>
                                    <div style={statItemStyle}>
                                        <div style={statNumberStyle}>{totalQuestions - answeredCount}</div>
                                        <div style={statLabelStyle}>Pending</div>
                                    </div>
                                </div>
                                <div style={progressBarContainerStyle}>
                                    <div 
                                        style={{
                                            ...progressBarStyle,
                                            width: `${(answeredCount / totalQuestions) * 100}%`
                                        }}
                                    ></div>
                                </div>
                                <div style={progressTextStyle}>
                                    Progress: {Math.round((answeredCount / totalQuestions) * 100)}%
                                </div>
                            </div>

                            {/* Result Display */}
                            {result && (
                                <div style={resultCardStyle}>
                                    <div style={resultHeaderStyle}>
                                        <div style={resultIconStyle}>
                                            <FiBarChart2 size={24} />
                                        </div>
                                        <div>
                                            <div style={resultTitleStyle}>Your Score</div>
                                            <div style={resultScoreStyle}>
                                                {result.score} / {result.total}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={resultStatusStyle}>
                                        <div style={{
                                            ...statusBadgeStyle,
                                            backgroundColor: result.passed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: result.passed ? '#10b981' : '#ef4444',
                                            borderColor: result.passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                                        }}>
                                            {result.passed ? 'Shortlist Criteria Met ✓' : 'Below Cutoff'}
                                        </div>
                                        <div style={resultMessageStyle}>
                                            {result.passed 
                                                ? 'Your score meets the shortlisting criteria. The recruiter will review your application.'
                                                : 'Your score is below the required cutoff (30+). Keep practicing!'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Controls */}
                            <div style={controlsCardStyle}>
                                <button
                                    onClick={toggleFullscreen}
                                    style={fullscreenButtonStyle}
                                >
                                    {fullscreen ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    style={refreshButtonStyle}
                                >
                                    <FiArrowLeft size={16} />
                                    Exit Test
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Questions (SCROLLABLE) */}
                    <div style={rightColumnStyle}>
                        <div style={questionsCardStyle}>
                            <div style={questionsHeaderStyle}>
                                <h3 style={questionsTitleStyle}>
                                    Assessment Questions
                                </h3>
                                <div style={questionsSubtitleStyle}>
                                    Select the correct option for each question
                                </div>
                            </div>

                            {!result ? (
                                <form onSubmit={handleSubmit} style={questionsFormStyle}>
                                    <div style={questionsListStyle}>
                                        {test.questions.map((q, index) => (
                                            <div key={q.id} style={questionCardStyle}>
                                                <div style={questionHeaderStyle}>
                                                    <div style={questionNumberStyle}>
                                                        {index + 1}
                                                    </div>
                                                    <div style={questionTextStyle}>
                                                        {q.text}
                                                    </div>
                                                </div>

                                                <div style={optionsGridStyle}>
                                                    {[
                                                        { label: "A", text: q.option_a },
                                                        { label: "B", text: q.option_b },
                                                        { label: "C", text: q.option_c },
                                                        { label: "D", text: q.option_d },
                                                    ].map((opt) => (
                                                        <label
                                                            key={opt.label}
                                                            style={{
                                                                ...optionLabelStyle,
                                                                borderColor: answers[q.id] === opt.label ? '#8b5cf6' : '#e5e7eb',
                                                                backgroundColor: answers[q.id] === opt.label ? '#f5f3ff' : '#ffffff',
                                                            }}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`q-${q.id}`}
                                                                style={{ display: "none" }}
                                                                checked={answers[q.id] === opt.label}
                                                                onChange={() => handleOptionChange(q.id, opt.label)}
                                                            />
                                                            <span style={optionMarkerStyle}>
                                                                {opt.label}
                                                            </span>
                                                            <span style={optionTextStyle}>
                                                                {opt.text}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={submitSectionStyle}>
                                        <div style={submitWarningStyle}>
                                            <FiAlertCircle size={14} style={{ marginRight: 6 }} />
                                            Once submitted, answers cannot be changed
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submitting || expired}
                                            style={submitButtonStyle}
                                        >
                                            {submitting ? (
                                                <>
                                                    <div style={spinnerStyle}></div>
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <FiSend size={18} style={{ marginRight: 8 }} />
                                                    Submit Assessment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div style={completionCardStyle}>
                                    <div style={completionIconStyle}>
                                        <FiCheckCircle size={48} color="#10b981" />
                                    </div>
                                    <h3 style={completionTitleStyle}>
                                        Assessment Submitted Successfully!
                                    </h3>
                                    <p style={completionMessageStyle}>
                                        Your test has been evaluated and the results have been shared with the recruiter.
                                        You can track your application status from the Applications page.
                                    </p>
                                    <button
                                        onClick={goToApplications}
                                        style={completionButtonStyle}
                                    >
                                        <FiArrowLeft size={18} style={{ marginRight: 8 }} />
                                        Go to My Applications
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ---------- UPDATED STYLES (Fixed Left Sidebar) ---------- */

const pageContainerStyle = {
    position: "fixed",
    top: 60, // Navbar height
    left: 260, // Sidebar width
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

const warningAlertStyle = {
    padding: "14px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    border: "1px solid #fbbf24",
    color: "#92400e",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
    animation: "fadeIn 0.3s ease",
};

const warningIconStyle = {
    marginRight: 12,
    color: "#f59e0b",
};

const warningContentStyle = {
    flex: 1,
};

const warningCloseStyle = {
    background: "none",
    border: "none",
    color: "#92400e",
    cursor: "pointer",
    padding: 4,
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

const errorContentStyle = {
    flex: 1,
};

const gridContainerStyle = {
    display: "grid",
    gridTemplateColumns: "300px 1fr", // Fixed width for left column
    gap: 24,
    flex: 1,
    minHeight: 0,
    animation: "fadeIn 0.6s ease",
};

const leftColumnStyle = {
    display: "flex",
    flexDirection: "column",
    height: "calc(100vh - 200px)", // Fixed height
    position: "sticky", // Make it sticky
    top: 28, // Offset from top
};

const rightColumnStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
};

const infoPanelStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 24,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflowY: "auto", // Scroll if content is too tall
    maxHeight: "100%",
};

const infoPanelHeaderStyle = {
    marginBottom: 16,
    textAlign: "center",
};

const infoPanelTitleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const timerCardStyle = {
    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(14, 165, 233, 0.3)",
};

const timerHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
};

const timerIconStyle = {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(14, 165, 233, 0.1)",
    color: "#0ea5e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const timerLabelStyle = {
    fontSize: 12,
    color: "#0369a1",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
};

const timerValueStyle = {
    fontSize: 28,
    fontWeight: 700,
    color: "#0c4a6e",
};

const timerProgressStyle = {
    height: 6,
    background: "rgba(14, 165, 233, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
};

const timerProgressBarStyle = {
    height: "100%",
    borderRadius: 3,
    transition: "width 1s linear, background-color 0.3s ease",
};

const timerHintStyle = {
    fontSize: 11,
    color: "#0369a1",
    textAlign: "center",
    fontStyle: "italic",
};

const statsCardStyle = {
    background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(186, 230, 253, 0.8)",
};

const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 16,
};

const statItemStyle = {
    textAlign: "center",
};

const statNumberStyle = {
    fontSize: 24,
    fontWeight: 700,
    color: "#0c4a6e",
    marginBottom: 4,
};

const statLabelStyle = {
    fontSize: 11,
    color: "#0369a1",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
};

const progressBarContainerStyle = {
    height: 6,
    background: "rgba(14, 165, 233, 0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
};

const progressBarStyle = {
    height: "100%",
    background: "linear-gradient(90deg, #0ea5e9, #3b82f6)",
    borderRadius: 3,
    transition: "width 0.3s ease",
};

const progressTextStyle = {
    fontSize: 12,
    color: "#0369a1",
    textAlign: "center",
    fontWeight: 500,
};

const resultCardStyle = {
    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    borderRadius: 16,
    padding: 20,
    border: "1px solid rgba(16, 185, 129, 0.3)",
};

const resultHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
};

const resultIconStyle = {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "rgba(16, 185, 129, 0.1)",
    color: "#10b981",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const resultTitleStyle = {
    fontSize: 12,
    color: "#065f46",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 4,
};

const resultScoreStyle = {
    fontSize: 28,
    fontWeight: 700,
    color: "#065f46",
};

const resultStatusStyle = {
    textAlign: "center",
};

const statusBadgeStyle = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 12,
    border: "1px solid",
};

const resultMessageStyle = {
    fontSize: 13,
    color: "#065f46",
    lineHeight: 1.5,
};

const controlsCardStyle = {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 16,
    borderTop: "1px solid rgba(226, 232, 240, 0.5)",
};

const fullscreenButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(99, 102, 241, 0.3)",
    background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    color: "#4f46e5",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(99, 102, 241, 0.1)",
        transform: "translateY(-1px)",
    },
};

const refreshButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 12,
    border: "1px solid rgba(239, 68, 68, 0.3)",
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    color: "#dc2626",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(239, 68, 68, 0.1)",
        transform: "translateY(-1px)",
    },
};

const questionsCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 24,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
};

const questionsHeaderStyle = {
    marginBottom: 24,
    textAlign: "center",
};

const questionsTitleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const questionsSubtitleStyle = {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
};

const questionsFormStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
};

const questionsListStyle = {
    flex: 1,
    overflowY: "auto",
    paddingRight: 8,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginBottom: 24,
};

const questionCardStyle = {
    background: "#ffffff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const questionHeaderStyle = {
    display: "flex",
    gap: 16,
    marginBottom: 16,
};

const questionNumberStyle = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    flexShrink: 0,
};

const questionTextStyle = {
    fontSize: 15,
    color: "#111827",
    fontWeight: 500,
    lineHeight: 1.5,
    flex: 1,
};

const optionsGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
};

const optionLabelStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        borderColor: "#8b5cf6",
        background: "#f5f3ff",
    },
};

const optionMarkerStyle = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "2px solid #d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    color: "#4b5563",
    flexShrink: 0,
};

const optionTextStyle = {
    fontSize: 14,
    color: "#374151",
    flex: 1,
};

const submitSectionStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
};

const submitWarningStyle = {
    fontSize: 12,
    color: "#ef4444",
    display: "flex",
    alignItems: "center",
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
    animation: "spin 1s linear infinite",
    marginRight: 10,
};

const completionCardStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: 40,
};

const completionIconStyle = {
    marginBottom: 20,
};

const completionTitleStyle = {
    fontSize: 24,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 16,
};

const completionMessageStyle = {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 1.6,
    maxWidth: 500,
    marginBottom: 32,
};

const completionButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "14px 32px",
    borderRadius: 12,
    border: "none",
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.4)",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 12px 32px rgba(79, 70, 229, 0.6)",
    },
};

/* Loading State */
const loadingContainerStyle = {
    position: "fixed",
    top: 60, // Navbar height
    left: 260, // Sidebar width
    right: 0,
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #fdf2f8 100%)",
};

const loadingSpinnerStyle = {
    width: 40,
    height: 40,
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
    marginBottom: 4,
};

const loadingSubTextStyle = {
    fontSize: 12,
    color: "#9ca3af",
};

/* Error State */
const errorStateContainerStyle = {
    position: "fixed",
    top: 60, // Navbar height
    left: 260, // Sidebar width
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8fafc 0%, #f0f9ff 50%, #fdf2f8 100%)",
};

const errorStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    textAlign: "center",
    animation: "fadeIn 0.4s ease",
    maxWidth: 500,
    margin: "40px auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
};

const errorIconStyle = {
    color: "#ef4444",
    marginBottom: 16,
};

const errorTitleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#dc2626",
    marginBottom: 8,
};

const errorMessageStyle = {
    fontSize: 14,
    color: "#6b7280",
    maxWidth: 300,
    lineHeight: 1.6,
    opacity: 0.8,
    marginBottom: 24,
};

const errorActionButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    borderRadius: 12,
    border: "1px solid rgba(239, 68, 68, 0.3)",
    background: "linear-gradient(135deg, #ffffff, #fef2f2)",
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#fee2e2",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
    },
};

export default CandidateJobTest;