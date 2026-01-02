import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { FiCheckCircle, FiXCircle, FiHelpCircle, FiBarChart2, FiClock, FiAward } from "react-icons/fi";

const RecruiterTestResult = ({ applicationId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!applicationId) return;

        const fetchResults = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await axiosClient.get(
                    `/applications/${applicationId}/test-results/`
                );
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError(
                    err.response?.data?.detail ||
                    "Could not load test results for this application."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [applicationId]);

    if (!applicationId) return null;

    if (loading) {
        return (
            <div style={loadingContainerStyle}>
                <div style={loadingSpinnerStyle}></div>
                <p style={loadingTextStyle}>
                    Loading test results...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={errorStateStyle}>
                <FiXCircle size={24} style={{ color: '#ef4444', marginBottom: 12 }} />
                <p style={errorTextStyle}>{error}</p>
                <button 
                    style={retryButtonStyle}
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!data) return (
        <div style={emptyStateStyle}>
            <FiHelpCircle size={32} style={{ marginBottom: 12, color: '#8b5cf6' }} />
            <h4 style={emptyTitleStyle}>No test data available</h4>
            <p style={emptyMessageStyle}>
                The candidate hasn't taken the test yet or results are not available.
            </p>
        </div>
    );

    // Calculate statistics
    const correctAnswers = data.questions.filter(q => q.candidate_answer === q.correct_option).length;
    const totalQuestions = data.questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const score = data.score || 0;
    const totalMarks = data.total_marks || totalQuestions;
    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

    return (
        <div style={containerStyle}>
            {/* Header with Stats */}
            <div style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>
                        <FiBarChart2 size={20} style={{ marginRight: 8, color: '#8b5cf6' }} />
                        Detailed Test Performance
                    </h3>
                    <p style={subtitleStyle}>
                        MCQ assessment results for candidate evaluation
                    </p>
                </div>
                <div style={scoreBadgeStyle(data.passed)}>
                    <div style={scoreNumberStyle}>{score}/{totalMarks}</div>
                    <div style={scoreLabelStyle}>{percentage}%</div>
                </div>
            </div>

            {/* Performance Overview */}
            <div style={overviewGridStyle}>
                <div style={statCardStyle}>
                    <div style={statIconStyle("#d1fae5", "#059669")}>
                        <FiCheckCircle size={20} />
                    </div>
                    <div>
                        <div style={statNumberStyle}>{correctAnswers}/{totalQuestions}</div>
                        <div style={statLabelStyle}>Correct Answers</div>
                    </div>
                </div>
                
                <div style={statCardStyle}>
                    <div style={statIconStyle("#fef3c7", "#d97706")}>
                        <FiAward size={20} />
                    </div>
                    <div>
                        <div style={statNumberStyle}>{accuracy}%</div>
                        <div style={statLabelStyle}>Accuracy</div>
                    </div>
                </div>
                
                <div style={statCardStyle}>
                    <div style={statIconStyle("#dbeafe", "#2563eb")}>
                        <FiClock size={20} />
                    </div>
                    <div>
                        <div style={statNumberStyle}>
                            {data.time_taken ? `${data.time_taken} mins` : 'N/A'}
                        </div>
                        <div style={statLabelStyle}>Time Taken</div>
                    </div>
                </div>
                
                <div style={statCardStyle}>
                    <div style={statIconStyle(data.passed ? "#d1fae5" : "#fee2e2", data.passed ? "#059669" : "#dc2626")}>
                        {data.passed ? <FiCheckCircle size={20} /> : <FiXCircle size={20} />}
                    </div>
                    <div>
                        <div style={statNumberStyle}>
                            {data.passed ? 'Passed' : 'Failed'}
                        </div>
                        <div style={statLabelStyle}>
                            {data.passed ? 'Criteria Met' : 'Below Cutoff'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Question-by-Question Breakdown */}
            <div style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <h4 style={sectionTitleStyle}>
                        Question Breakdown
                        <span style={sectionCountStyle}>
                            {totalQuestions} Questions
                        </span>
                    </h4>
                    <div style={legendStyle}>
                        <div style={legendItemStyle}>
                            <div style={legendDotStyle("#10b981")}></div>
                            <span>Correct</span>
                        </div>
                        <div style={legendItemStyle}>
                            <div style={legendDotStyle("#ef4444")}></div>
                            <span>Incorrect</span>
                        </div>
                    </div>
                </div>

                <div style={questionsListStyle}>
                    {data.questions.map((q, idx) => {
                        const isCorrect = q.candidate_answer === q.correct_option;
                        const answered = q.candidate_answer !== null && q.candidate_answer !== undefined;
                        
                        return (
                            <div 
                                key={q.id} 
                                style={questionCardStyle(isCorrect, answered)}
                            >
                                <div style={questionHeaderStyle}>
                                    <div style={questionNumberStyle(idx + 1, isCorrect, answered)}>
                                        Q{idx + 1}
                                    </div>
                                    <div style={questionStatusStyle(isCorrect, answered)}>
                                        {isCorrect ? 'Correct' : answered ? 'Incorrect' : 'Not Answered'}
                                    </div>
                                </div>
                                
                                <div style={questionTextStyle}>
                                    {q.text}
                                </div>
                                
                                <div style={optionsGridStyle}>
                                    <div style={optionGroupStyle}>
                                        <div style={optionLabelStyle}>Candidate's Answer:</div>
                                        <div style={candidateAnswerStyle(isCorrect, answered)}>
                                            {answered ? q.candidate_answer : 'Not answered'}
                                            {answered && !isCorrect && (
                                                <FiXCircle size={14} style={{ marginLeft: 6 }} />
                                            )}
                                            {answered && isCorrect && (
                                                <FiCheckCircle size={14} style={{ marginLeft: 6, color: '#10b981' }} />
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div style={optionGroupStyle}>
                                        <div style={optionLabelStyle}>Correct Answer:</div>
                                        <div style={correctAnswerStyle}>
                                            {q.correct_option}
                                            <FiCheckCircle size={14} style={{ marginLeft: 6, color: '#10b981' }} />
                                        </div>
                                    </div>
                                </div>
                                
                                {q.explanation && (
                                    <div style={explanationStyle}>
                                        <strong>Explanation:</strong> {q.explanation}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary Footer */}
            <div style={summaryStyle}>
                <div style={summaryContentStyle}>
                    <div style={summaryIconStyle}>📊</div>
                    <div>
                        <div style={summaryTitleStyle}>
                            Overall Performance Summary
                        </div>
                        <div style={summaryTextStyle}>
                            Candidate scored {score} out of {totalMarks} points ({percentage}% accuracy). 
                            {data.passed 
                                ? " Performance meets the shortlisting criteria." 
                                : " Performance is below the required cutoff score."}
                        </div>
                    </div>
                </div>
                <button 
                    style={exportButtonStyle}
                    onClick={() => window.print()}
                >
                    Export Report
                </button>
            </div>
        </div>
    );
};

/* ---------- ENHANCED STYLES ---------- */

const containerStyle = {
    animation: "fadeIn 0.4s ease",
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
};

const titleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    display: "flex",
    alignItems: "center",
};

const subtitleStyle = {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 0,
};

const scoreBadgeStyle = (passed) => ({
    padding: "12px 20px",
    borderRadius: 12,
    background: passed 
        ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
        : "linear-gradient(135deg, #fee2e2, #fecaca)",
    border: `1px solid ${passed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
    textAlign: "center",
    minWidth: 100,
});

const scoreNumberStyle = {
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1,
};

const scoreLabelStyle = {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 600,
    marginTop: 2,
};

const overviewGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 32,
};

const statCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: "16px",
    borderRadius: 12,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "all 0.2s ease",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
        borderColor: "#8b5cf6",
    },
};

const statIconStyle = (bgColor, color) => ({
    width: 44,
    height: 44,
    borderRadius: 12,
    background: bgColor,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
});

const statNumberStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1,
    marginBottom: 2,
};

const statLabelStyle = {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 500,
};

const sectionStyle = {
    marginBottom: 32,
};

const sectionHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 12,
};

const sectionTitleStyle = {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 12,
};

const sectionCountStyle = {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    color: "#4b5563",
    fontWeight: 600,
};

const legendStyle = {
    display: "flex",
    gap: 16,
};

const legendItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#6b7280",
};

const legendDotStyle = (color) => ({
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: color,
});

const questionsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxHeight: "400px",
    overflowY: "auto",
    paddingRight: 4,
};

const questionCardStyle = (isCorrect, answered) => ({
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: "16px",
    borderRadius: 12,
    border: `1px solid ${
        !answered ? 'rgba(209, 213, 219, 0.8)' : 
        isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
    }`,
    transition: "all 0.2s ease",
    animation: "fadeIn 0.3s ease",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
    },
});

const questionHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
};

const questionNumberStyle = (number, isCorrect, answered) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: !answered 
        ? "linear-gradient(135deg, #f3f4f6, #e5e7eb)" 
        : isCorrect 
            ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
            : "linear-gradient(135deg, #fee2e2, #fecaca)",
    color: !answered ? "#6b7280" : isCorrect ? "#059669" : "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    border: `1px solid ${!answered ? 'rgba(209, 213, 219, 0.8)' : isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
});

const questionStatusStyle = (isCorrect, answered) => ({
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    background: !answered 
        ? "#f3f4f6" 
        : isCorrect 
            ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
            : "linear-gradient(135deg, #fee2e2, #fecaca)",
    color: !answered ? "#6b7280" : isCorrect ? "#047857" : "#b91c1c",
    fontWeight: 600,
    textTransform: "uppercase",
});

const questionTextStyle = {
    fontSize: 14,
    color: "#111827",
    lineHeight: 1.5,
    marginBottom: 16,
    fontWeight: 500,
};

const optionsGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginBottom: 12,
};

const optionGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
};

const optionLabelStyle = {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
};

const candidateAnswerStyle = (isCorrect, answered) => ({
    padding: "10px 12px",
    borderRadius: 8,
    background: !answered 
        ? "#f9fafb" 
        : isCorrect 
            ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
            : "linear-gradient(135deg, #fee2e2, #fecaca)",
    border: `1px solid ${
        !answered ? '#e5e7eb' : 
        isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
    }`,
    color: !answered ? "#6b7280" : isCorrect ? "#047857" : "#b91c1c",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
});

const correctAnswerStyle = {
    padding: "10px 12px",
    borderRadius: 8,
    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    border: "1px solid rgba(14, 165, 233, 0.3)",
    color: "#0369a1",
    fontSize: 13,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
};

const explanationStyle = {
    marginTop: 12,
    padding: "12px",
    borderRadius: 8,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontSize: 12,
    color: "#475569",
    lineHeight: 1.5,
    fontStyle: "italic",
};

const summaryStyle = {
    padding: "20px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
    border: "1px solid rgba(186, 230, 253, 0.8)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
};

const summaryContentStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flex: 1,
};

const summaryIconStyle = {
    fontSize: 32,
    opacity: 0.8,
};

const summaryTitleStyle = {
    fontSize: 14,
    fontWeight: 700,
    color: "#0369a1",
    marginBottom: 4,
};

const summaryTextStyle = {
    fontSize: 12,
    color: "#0c4a6e",
    lineHeight: 1.5,
    maxWidth: 500,
};

const exportButtonStyle = {
    padding: "10px 20px",
    borderRadius: 10,
    border: "1px solid rgba(14, 165, 233, 0.3)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#0ea5e9",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
    ":hover": {
        background: "#f0f9ff",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
    },
};

const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
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
};

const errorStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    borderRadius: 12,
    border: "1px solid #fecaca",
    textAlign: "center",
};

const errorTextStyle = {
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 16,
    maxWidth: 300,
    lineHeight: 1.5,
};

const retryButtonStyle = {
    padding: "8px 20px",
    borderRadius: 8,
    border: "1px solid #dc2626",
    background: "linear-gradient(135deg, #ffffff, #fef2f2)",
    color: "#dc2626",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#fee2e2",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
    },
};

const emptyStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #ffffff, #faf5ff)",
    borderRadius: 12,
    border: "1px dashed rgba(139, 92, 246, 0.4)",
    textAlign: "center",
};

const emptyTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#7c3aed",
    marginBottom: 8,
};

const emptyMessageStyle = {
    fontSize: 12,
    color: "#8b5cf6",
    maxWidth: 250,
    lineHeight: 1.5,
    opacity: 0.8,
};

// Add CSS animations
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);

export default RecruiterTestResult;