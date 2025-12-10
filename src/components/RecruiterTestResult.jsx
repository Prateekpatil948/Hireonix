import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

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
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                Loading test results…
            </p>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "#b91c1c",
                    background: "#fee2e2",
                    borderRadius: 10,
                    padding: "6px 8px",
                    border: "1px solid #fecaca",
                }}
            >
                {error}
            </div>
        );
    }

    if (!data) return null;

    return (
        <div
            style={{
                marginTop: 10,
                borderTop: "1px solid #e5e7eb",
                paddingTop: 8,
                display: "flex",
                flexDirection: "column",
                gap: 6,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                }}
            >
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111827",
                    }}
                >
                    Test Performance
                </div>
                <div
                    style={{
                        fontSize: 11,
                        textAlign: "right",
                    }}
                >
                    <div>
                        Score:{" "}
                        <span style={{ fontWeight: 600, color: "#16a34a" }}>
                            {data.score} / {data.total_marks}
                        </span>
                    </div>
                    <div
                        style={{
                            color: data.passed ? "#16a34a" : "#b91c1c",
                            fontWeight: 500,
                        }}
                    >
                        {data.passed ? "Shortlist criteria met" : "Below cutoff"}
                    </div>
                </div>
            </div>

            <div
                style={{
                    maxHeight: 180,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                }}
            >
                {data.questions.map((q, idx) => {
                    const isCorrect = q.candidate_answer === q.correct_option;

                    return (
                        <div
                            key={q.id}
                            style={{
                                borderRadius: 10,
                                border: "1px solid #e5e7eb",
                                padding: "6px 8px",
                                background: "#f9fafb",
                                fontSize: 11,
                            }}
                        >
                            <div
                                style={{
                                    marginBottom: 4,
                                    color: "#111827",
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 600,
                                        color: "#16a34a",
                                        marginRight: 4,
                                    }}
                                >
                                    Q{idx + 1}.
                                </span>
                                {q.text}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 8,
                                    flexWrap: "wrap",
                                }}
                            >
                                <div>
                                    Candidate:{" "}
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            color: isCorrect
                                                ? "#16a34a"
                                                : "#b91c1c",
                                        }}
                                    >
                                        {q.candidate_answer || "Not answered"}
                                    </span>
                                </div>
                                <div>
                                    Correct:{" "}
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            color: "#16a34a",
                                        }}
                                    >
                                        {q.correct_option}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecruiterTestResult;
