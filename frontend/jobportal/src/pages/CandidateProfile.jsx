import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";

const CandidateProfile = () => {
    const [form, setForm] = useState({
        full_name: "",
        phone_number: "",
        bio: "",
        skills: "",
        experience: "",
    });
    const [resumeFile, setResumeFile] = useState(null);
    const [existingResumeUrl, setExistingResumeUrl] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setError("");
                const res = await axiosClient.get("candidate/profile/");
                const data = res.data;

                setForm({
                    full_name: data.full_name || "",
                    phone_number: data.phone_number || "",
                    bio: data.bio || "",
                    skills: data.skills || "",
                    experience:
                        data.experience !== null && data.experience !== undefined
                            ? String(data.experience)
                            : "",
                });

                if (data.resume) {
                    setExistingResumeUrl(data.resume);
                }
            } catch (err) {
                console.error("Error loading profile:", err.response?.data || err);
                setError("Could not load your profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setSaving(true);

        try {
            const fd = new FormData();

            fd.append("full_name", form.full_name);
            fd.append("phone_number", form.phone_number);
            fd.append("bio", form.bio);
            fd.append("skills", form.skills);

            if (form.experience !== "") {
                fd.append("experience", Number(form.experience));
            }

            if (resumeFile) {
                fd.append("resume", resumeFile);
            }

            const res = await axiosClient.put("candidate/profile/", fd);
            setMessage("Profile updated successfully ✨");

            if (res.data.resume) {
                setExistingResumeUrl(res.data.resume);
            }
        } catch (err) {
            console.error("Error saving profile:", err.response?.data || err);
            if (err.response?.data) {
                const data = err.response.data;
                const firstKey = Object.keys(data)[0];
                const firstMsg = Array.isArray(data[firstKey])
                    ? data[firstKey][0]
                    : data[firstKey];
                setError(String(firstMsg));
            } else {
                setError("Could not save profile. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const initials = useMemo(() => {
        if (form.full_name?.trim()) {
            return form.full_name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return "C";
    }, [form.full_name]);

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
                    padding: "16px",
                }}
            >
                <div
                    style={{
                        padding: "16px 24px",
                        borderRadius: "999px",
                        background: "rgba(255, 255, 255, 0.9)",
                        boxShadow: "0 10px 40px rgba(15, 23, 42, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <span
                        style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "999px",
                            border: "2px solid #4f46e5",
                            borderTopColor: "transparent",
                            animation: "spin 0.8s linear infinite",
                            display: "inline-block",
                        }}
                    />
                    <span style={{ fontSize: "14px", color: "#4b5563" }}>
                        Loading your profile…
                    </span>
                </div>

                <style>
                    {`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}
                </style>
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
                    maxWidth: "960px",
                    background: "rgba(255, 255, 255, 0.94)",
                    backdropFilter: "blur(12px)",
                    borderRadius: "28px",
                    boxShadow: "0 22px 60px rgba(15, 23, 42, 0.18)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                    padding: "24px",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "20px",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h1
                            style={{
                                fontSize: "22px",
                                fontWeight: 700,
                                color: "#111827",
                                marginBottom: "4px",
                            }}
                        >
                            Candidate Profile
                        </h1>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                maxWidth: "520px",
                            }}
                        >
                            Keep your profile updated so recruiters can quickly
                            understand your skills, experience, and contact details.
                        </p>
                    </div>
                    <span
                        style={{
                            fontSize: "11px",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            background: "#ecfeff",
                            color: "#0f766e",
                            border: "1px solid rgba(45, 212, 191, 0.7)",
                            alignSelf: "flex-start",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Candidate · Profile
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

                {/* Main grid: left summary + right form */}
                <div
                    className="candidate-profile-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0, 260px) minmax(0, 1fr)",
                        gap: "24px",
                    }}
                >
                    {/* LEFT PANEL */}
                    <div
                        style={{
                            borderRadius: "20px",
                            padding: "18px 16px 16px",
                            background:
                                "radial-gradient(circle at 0% 0%, #eef2ff, #eff6ff 45%, #f9fafb 100%)",
                            border: "1px solid rgba(191, 219, 254, 0.9)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                gap: "10px",
                            }}
                        >
                            {/* Avatar */}
                            <div
                                style={{
                                    width: "72px",
                                    height: "72px",
                                    borderRadius: "999px",
                                    background:
                                        "radial-gradient(circle at 0% 0%, #0ea5e9, #6366f1 50%, #4f46e5 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: "26px",
                                    fontWeight: 700,
                                    boxShadow:
                                        "0 12px 35px rgba(37,99,235,0.5)",
                                    marginBottom: "4px",
                                }}
                            >
                                {initials}
                            </div>

                            <div>
                                <div
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        color: "#111827",
                                    }}
                                >
                                    {form.full_name || "Your Name"}
                                </div>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                    }}
                                >
                                    {form.experience
                                        ? `${form.experience} yrs experience`
                                        : "Fresher / Entry level"}
                                </div>
                            </div>

                            {/* Phone info */}
                            <div
                                style={{
                                    marginTop: "8px",
                                    width: "100%",
                                    padding: "10px 12px",
                                    borderRadius: "14px",
                                    background: "rgba(255,255,255,0.9)",
                                    border:
                                        "1px dashed rgba(148, 163, 184, 0.9)",
                                    fontSize: "12px",
                                    color: "#4b5563",
                                    textAlign: "left",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: "4px",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            color: "#9ca3af",
                                        }}
                                    >
                                        Phone
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            color: "#6b7280",
                                        }}
                                    >
                                        {form.phone_number || "Not added"}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        marginTop: "4px",
                                        fontSize: "11px",
                                        color: "#9ca3af",
                                    }}
                                >
                                    Recruiters may contact you on this number for
                                    interviews, so keep it updated.
                                </p>
                            </div>

                            {/* Hint */}
                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "11px",
                                    color: "#9ca3af",
                                }}
                            >
                                Tip: A{" "}
                                <span style={{ fontWeight: 500 }}>
                                    clear bio & skills
                                </span>{" "}
                                attract better opportunities.
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL – FORM */}
                    <div
                        style={{
                            borderRadius: "20px",
                            border: "1px solid rgba(209, 213, 219, 0.9)",
                            padding: "18px 18px 16px",
                            background:
                                "linear-gradient(135deg, #ffffff, #f9fafb)",
                        }}
                    >
                        <form onSubmit={handleSubmit}>
                            {/* Name + Phone */}
                            <div
                                style={{
                                    display: "flex",
                                    gap: "14px",
                                    flexWrap: "wrap",
                                    marginBottom: "12px",
                                }}
                            >
                                <div style={{ flex: "1 1 200px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "13px",
                                            fontWeight: 500,
                                            color: "#374151",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        className="input"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        placeholder="e.g., Prateek Patil"
                                        style={{
                                            width: "100%",
                                            borderRadius: "10px",
                                            border:
                                                "1px solid rgba(209, 213, 219, 0.9)",
                                            padding: "8px 10px",
                                            fontSize: "14px",
                                            outline: "none",
                                            transition:
                                                "border-color 0.15s, box-shadow 0.15s",
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor =
                                                "#4f46e5";
                                            e.target.style.boxShadow =
                                                "0 0 0 1px rgba(79,70,229,0.25)";
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor =
                                                "rgba(209, 213, 219, 0.9)";
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                </div>

                                <div style={{ flex: "1 1 200px" }}>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "13px",
                                            fontWeight: 500,
                                            color: "#374151",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        className="input"
                                        type="tel"
                                        name="phone_number"
                                        value={form.phone_number}
                                        onChange={handleChange}
                                        placeholder="e.g., +91 98765 43210"
                                        style={{
                                            width: "100%",
                                            borderRadius: "10px",
                                            border:
                                                "1px solid rgba(209, 213, 219, 0.9)",
                                            padding: "8px 10px",
                                            fontSize: "14px",
                                            outline: "none",
                                            transition:
                                                "border-color 0.15s, box-shadow 0.15s",
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor =
                                                "#4f46e5";
                                            e.target.style.boxShadow =
                                                "0 0 0 1px rgba(79,70,229,0.25)";
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor =
                                                "rgba(209, 213, 219, 0.9)";
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Bio */}
                            <div style={{ marginBottom: "10px" }}>
                                <label
                                    style={{
                                        display: "block",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        color: "#374151",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Bio
                                </label>
                                <textarea
                                    className="input"
                                    rows={4}
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    placeholder="Write a short summary about yourself, your goals, and your expertise."
                                    style={{
                                        width: "100%",
                                        borderRadius: "12px",
                                        border:
                                            "1px solid rgba(209, 213, 219, 0.9)",
                                        padding: "8px 10px",
                                        fontSize: "14px",
                                        resize: "vertical",
                                        outline: "none",
                                        transition:
                                            "border-color 0.15s, box-shadow 0.15s",
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#4f46e5";
                                        e.target.style.boxShadow =
                                            "0 0 0 1px rgba(79,70,229,0.25)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor =
                                            "rgba(209, 213, 219, 0.9)";
                                        e.target.style.boxShadow = "none";
                                    }}
                                />
                                <div
                                    style={{
                                        marginTop: "4px",
                                        fontSize: "11px",
                                        color: "#9ca3af",
                                    }}
                                >
                                    Example: “Final-year student trained in MERN &
                                    Django, building projects in web development.”
                                </div>
                            </div>

                            {/* Skills + Experience + Resume */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "minmax(0, 1.4fr) minmax(0, 1fr)",
                                    gap: "14px",
                                    marginTop: "10px",
                                }}
                            >
                                {/* Skills */}
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            fontSize: "13px",
                                            fontWeight: 500,
                                            color: "#374151",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Skills
                                    </label>
                                    <textarea
                                        className="input"
                                        rows={4}
                                        name="skills"
                                        value={form.skills}
                                        onChange={handleChange}
                                        placeholder="Example: React, Django, Python, REST APIs, MySQL..."
                                        style={{
                                            width: "100%",
                                            borderRadius: "12px",
                                            border:
                                                "1px solid rgba(209, 213, 219, 0.9)",
                                            padding: "8px 10px",
                                            fontSize: "14px",
                                            resize: "vertical",
                                            outline: "none",
                                            transition:
                                                "border-color 0.15s, box-shadow 0.15s",
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor =
                                                "#4f46e5";
                                            e.target.style.boxShadow =
                                                "0 0 0 1px rgba(79,70,229,0.25)";
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor =
                                                "rgba(209, 213, 219, 0.9)";
                                            e.target.style.boxShadow = "none";
                                        }}
                                    />
                                    <p
                                        style={{
                                            fontSize: "11px",
                                            color: "#6b7280",
                                            marginTop: "4px",
                                        }}
                                    >
                                        Tip: You can write comma-separated skills
                                        or short bullet-style lines.
                                    </p>
                                </div>

                                {/* Right side: experience + resume */}
                                <div
                                    style={{
                                        padding: "10px 10px",
                                        borderRadius: "12px",
                                        background: "#f9fafb",
                                        border:
                                            "1px solid rgba(229, 231, 235, 0.9)",
                                    }}
                                >
                                    <div className="form-group" style={{ marginBottom: "10px" }}>
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: "13px",
                                                fontWeight: 500,
                                                color: "#374151",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            Experience (years)
                                        </label>
                                        <input
                                            className="input"
                                            type="number"
                                            min="0"
                                            name="experience"
                                            value={form.experience}
                                            onChange={handleChange}
                                            placeholder="e.g., 0, 1, 2..."
                                            style={{
                                                width: "100%",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid rgba(209, 213, 219, 0.9)",
                                                padding: "8px 10px",
                                                fontSize: "14px",
                                                outline: "none",
                                                transition:
                                                    "border-color 0.15s, box-shadow 0.15s",
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor =
                                                    "#4f46e5";
                                                e.target.style.boxShadow =
                                                    "0 0 0 1px rgba(79,70,229,0.25)";
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor =
                                                    "rgba(209, 213, 219, 0.9)";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: "13px",
                                                fontWeight: 500,
                                                color: "#374151",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            Resume (PDF)
                                        </label>
                                        <input
                                            className="input"
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            style={{
                                                width: "100%",
                                                borderRadius: "10px",
                                                border:
                                                    "1px solid rgba(209, 213, 219, 0.9)",
                                                padding: "6px 8px",
                                                fontSize: "13px",
                                                background: "white",
                                            }}
                                        />
                                        {existingResumeUrl && (
                                            <p
                                                style={{
                                                    fontSize: "13px",
                                                    marginTop: "6px",
                                                }}
                                            >
                                                Current resume:{" "}
                                                <a
                                                    href={`http://127.0.0.1:8000${existingResumeUrl}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="link-inline"
                                                    style={{ color: "#2563eb" }}
                                                >
                                                    View / Download
                                                </a>
                                            </p>
                                        )}
                                        <p
                                            style={{
                                                fontSize: "11px",
                                                color: "#6b7280",
                                                marginTop: "4px",
                                            }}
                                        >
                                            Upload your latest resume in PDF format.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                style={{
                                    marginTop: "16px",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "8px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    style={{
                                        padding: "8px 14px",
                                        borderRadius: "999px",
                                        border:
                                            "1px solid rgba(148, 163, 184, 0.9)",
                                        background: "white",
                                        fontSize: "13px",
                                        color: "#4b5563",
                                        cursor: "pointer",
                                    }}
                                >
                                    Reset
                                </button>
                                <button
                                    className="btn btn-primary"
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        padding: "8px 18px",
                                        borderRadius: "999px",
                                        border: "none",
                                        background:
                                            "linear-gradient(135deg,#4f46e5,#6366f1)",
                                        color: "white",
                                        fontSize: "13px",
                                        fontWeight: 500,
                                        cursor: saving ? "default" : "pointer",
                                        boxShadow:
                                            "0 12px 30px rgba(79,70,229,0.4)",
                                        opacity: saving ? 0.8 : 1,
                                    }}
                                >
                                    {saving ? "Saving…" : "Save Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <style>
                    {`
                    @media (max-width: 768px) {
                        .candidate-profile-grid {
                            grid-template-columns: minmax(0, 1fr) !important;
                        }
                    }
                `}
                </style>
            </div>
        </div>
    );
};

export default CandidateProfile;
