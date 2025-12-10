import { useState } from "react";
import axiosClient from "../api/axiosClient";

const RecruiterJobs = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        job_type: "Full-time",
        salary_min: "",
        salary_max: "",
        qualification: "",
        batch: "",
        skills: "",
        external_link: "",
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);
    const [showPopup, setShowPopup] = useState(false); // ✅ popup state

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);

        try {
            const payload = {
                title: form.title,
                description: form.description,
                location: form.location,
                job_type: form.job_type,
                salary_min: form.salary_min ? Number(form.salary_min) : null,
                salary_max: form.salary_max ? Number(form.salary_max) : null,
                qualification: form.qualification || "",
                batch: form.batch || "",
                skills: form.skills || "",
                external_link: form.external_link || "",
            };

            await axiosClient.post("jobs/", payload);

            setMessage("Job posted successfully ✨");
            setForm({
                title: "",
                description: "",
                location: "",
                job_type: "Full-time",
                salary_min: "",
                salary_max: "",
                qualification: "",
                batch: "",
                skills: "",
                external_link: "",
            });

            // ✅ Show popup
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
        } catch (err) {
            console.error("Error posting job:", err.response?.data || err);

            if (err.response?.data) {
                const data = err.response.data;
                const msg =
                    data.detail ||
                    (Array.isArray(data.non_field_errors)
                        ? data.non_field_errors[0]
                        : data.non_field_errors) ||
                    JSON.stringify(data);

                setError(String(msg));
            } else {
                setError("Could not create job. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    // ✅ Center popup component
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
                            Job posted successfully
                        </h4>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#4b5563",
                                lineHeight: 1.5,
                            }}
                        >
                            Your job is now live for candidates.
                            <br />
                            You can view and manage it from your{" "}
                            <strong>Manage Jobs</strong> or{" "}
                            <strong>Recruiter Dashboard</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
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
            {/* ✅ fade animation keyframes */}
            <style>
                {`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(10px); }
                }
            `}
            </style>

            {showPopup && <Popup />}

            <div
                style={{
                    width: "100%",
                    maxWidth: "850px",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "24px",
                    boxShadow: "0 22px 60px rgba(15, 23, 42, 0.16)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                    padding: "22px 22px 20px",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                        marginBottom: "18px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: "4px",
                            }}
                        >
                            Post New Job
                        </h1>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                maxWidth: "480px",
                            }}
                        >
                            Share a clear job opening with title, location,
                            requirements and a short description to attract the
                            right candidates.
                        </p>
                    </div>
                    <span
                        style={{
                            fontSize: "11px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            background: "#eef2ff",
                            color: "#4f46e5",
                            border: "1px solid rgba(129, 140, 248, 0.6)",
                            alignSelf: "flex-start",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Recruiter · Job Posting
                    </span>
                </div>

                {/* Toast messages */}
                {(error || message) && (
                    <div style={{ marginBottom: "12px" }}>
                        {error && (
                            <div
                                style={{
                                    marginBottom: message ? "8px" : 0,
                                    padding: "8px 12px",
                                    borderRadius: "12px",
                                    background: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    color: "#b91c1c",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span
                                    style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "999px",
                                        background: "#ef4444",
                                    }}
                                />
                                <span>{error}</span>
                            </div>
                        )}
                        {message && (
                            <div
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "12px",
                                    background: "#ecfdf3",
                                    border: "1px solid #bbf7d0",
                                    color: "#166534",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                }}
                            >
                                <span
                                    style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "999px",
                                        background: "#22c55e",
                                    }}
                                />
                                <span>{message}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* FORM */}
                <div
                    style={{
                        borderRadius: "18px",
                        border: "1px solid rgba(209, 213, 219, 0.9)",
                        padding: "16px 16px 14px",
                        background: "linear-gradient(135deg, #ffffff, #f9fafb)",
                    }}
                >
                    <form onSubmit={handleSubmit}>
                        {/* Row 1: Title + Location */}
                        <div
                            style={{
                                display: "flex",
                                gap: "14px",
                                flexWrap: "wrap",
                                marginBottom: "12px",
                            }}
                        >
                            <div style={{ flex: "1 1 220px" }}>
                                <label style={labelStyle}>Job Title</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. React Developer"
                                    style={inputStyle}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                            </div>
                            <div style={{ flex: "1 1 220px" }}>
                                <label style={labelStyle}>Location</label>
                                <input
                                    name="location"
                                    value={form.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. Bengaluru / Remote"
                                    style={inputStyle}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                            </div>
                        </div>

                        {/* Row 2: Job type + Batch */}
                        <div
                            style={{
                                display: "flex",
                                gap: "14px",
                                flexWrap: "wrap",
                                marginBottom: "12px",
                            }}
                        >
                            <div style={{ flex: "1 1 200px" }}>
                                <label style={labelStyle}>Job Type</label>
                                <select
                                    name="job_type"
                                    value={form.job_type}
                                    onChange={handleChange}
                                    style={{
                                        ...inputStyle,
                                        paddingRight: "30px",
                                    }}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Internship">Internship</option>
                                    <option value="Contract">Contract</option>
                                </select>
                            </div>
                            <div style={{ flex: "1 1 200px" }}>
                                <label style={labelStyle}>Batch</label>
                                <input
                                    name="batch"
                                    value={form.batch}
                                    onChange={handleChange}
                                    placeholder="e.g. 2023 / 2024 / Any"
                                    style={inputStyle}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                            </div>
                        </div>

                        {/* Row 3: Qualification + Skills */}
                        <div
                            style={{
                                display: "flex",
                                gap: "14px",
                                flexWrap: "wrap",
                                marginBottom: "12px",
                            }}
                        >
                            <div style={{ flex: "1 1 220px" }}>
                                <label style={labelStyle}>Qualification</label>
                                <input
                                    name="qualification"
                                    value={form.qualification}
                                    onChange={handleChange}
                                    placeholder="e.g. B.E / B.Tech / Any degree"
                                    style={inputStyle}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                            </div>
                            <div style={{ flex: "1 1 220px" }}>
                                <label style={labelStyle}>Skills</label>
                                <input
                                    name="skills"
                                    value={form.skills}
                                    onChange={handleChange}
                                    placeholder="e.g. React, Django, REST API"
                                    style={inputStyle}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                                <small
                                    style={{
                                        fontSize: 11,
                                        color: "#6b7280",
                                    }}
                                >
                                    Separate skills with commas.
                                </small>
                            </div>
                        </div>

                        {/* Row 4: Salary */}
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap",
                                marginBottom: "12px",
                            }}
                        >
                            <div style={{ flex: "1 1 150px" }}>
                                <label style={labelStyle}>
                                    Salary Min (optional)
                                </label>
                                <input
                                    type="number"
                                    name="salary_min"
                                    placeholder="Min"
                                    value={form.salary_min}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                            </div>
                            <div style={{ flex: "1 1 150px" }}>
                                <label style={labelStyle}>
                                    Salary Max (optional)
                                </label>
                                <input
                                    type="number"
                                    name="salary_max"
                                    placeholder="Max"
                                    value={form.salary_max}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                            </div>
                        </div>

                        {/* Row 5: External link */}
                        <div style={{ marginBottom: "12px" }}>
                            <label style={labelStyle}>
                                External Apply Link (optional)
                            </label>
                            <input
                                name="external_link"
                                value={form.external_link}
                                onChange={handleChange}
                                placeholder="https://company.com/careers/job-id"
                                style={inputStyle}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                            />
                            <small
                                style={{
                                    fontSize: 11,
                                    color: "#6b7280",
                                }}
                            >
                                If left empty, candidates will apply directly in
                                this portal.
                            </small>
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: "8px" }}>
                            <label style={labelStyle}>Job Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={form.description}
                                onChange={handleChange}
                                required
                                placeholder="Describe responsibilities, required skills, work style, benefits, etc."
                                style={{
                                    ...inputStyle,
                                    borderRadius: "12px",
                                    resize: "vertical",
                                    minHeight: "90px",
                                }}
                                onFocus={onInputFocus}
                                onBlur={onInputBlur}
                            />
                            <small
                                style={{
                                    fontSize: 11,
                                    color: "#6b7280",
                                }}
                            >
                                Example: “You will work with a small team to
                                build and maintain React & Django apps, follow
                                agile practices, and collaborate with design and
                                product.”
                            </small>
                        </div>

                        {/* Actions */}
                        <div
                            style={{
                                marginTop: "12px",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "8px",
                            }}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setForm({
                                        title: "",
                                        description: "",
                                        location: "",
                                        job_type: "Full-time",
                                        salary_min: "",
                                        salary_max: "",
                                        qualification: "",
                                        batch: "",
                                        skills: "",
                                        external_link: "",
                                    })
                                }
                                style={{
                                    padding: "7px 14px",
                                    borderRadius: "999px",
                                    border:
                                        "1px solid rgba(148, 163, 184, 0.9)",
                                    background: "white",
                                    fontSize: "13px",
                                    color: "#4b5563",
                                    cursor: "pointer",
                                }}
                            >
                                Clear
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: "7px 18px",
                                    borderRadius: "999px",
                                    border: "none",
                                    background:
                                        "linear-gradient(135deg,#4f46e5,#6366f1)",
                                    color: "white",
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    cursor: saving ? "default" : "pointer",
                                    boxShadow:
                                        "0 10px 26px rgba(79,70,229,0.4)",
                                    opacity: saving ? 0.85 : 1,
                                }}
                            >
                                {saving ? "Posting…" : "Post Job"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

/* shared styles */
const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "4px",
};

const inputStyle = {
    width: "100%",
    borderRadius: "10px",
    border: "1px solid rgba(209, 213, 219, 0.9)",
    padding: "8px 10px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    backgroundColor: "#ffffff",
};

const onInputFocus = (e) => {
    e.target.style.borderColor = "#4f46e5";
    e.target.style.boxShadow = "0 0 0 1px rgba(79,70,229,0.22)";
};

const onInputBlur = (e) => {
    e.target.style.borderColor = "rgba(209, 213, 219, 0.9)";
    e.target.style.boxShadow = "none";
};

export default RecruiterJobs;
