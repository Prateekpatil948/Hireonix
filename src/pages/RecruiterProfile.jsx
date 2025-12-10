import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";

const RecruiterProfile = () => {
    const { user, isAuthenticated } = useAuth();
    const [form, setForm] = useState({
        full_name: "",
        phone_number: "",
        position: "",
        linkedin: "",
        bio: "",
    });
    const [meta, setMeta] = useState({
        username: "",
        email: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await axiosClient.get("recruiter/profile/");
                const data = res.data;

                setForm({
                    full_name: data.full_name || "",
                    phone_number: data.phone_number || "",
                    position: data.position || "",
                    linkedin: data.linkedin || "",
                    bio: data.bio || "",
                });

                setMeta({
                    username: data.username || "",
                    email: data.email || "",
                });
            } catch (err) {
                console.error(err);
                setError("Failed to load recruiter profile.");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && user?.role === "recruiter") {
            fetchProfile();
        } else {
            setLoading(false);
            setError("You are not authorized to view this page.");
        }
    }, [isAuthenticated, user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        try {
            await axiosClient.put("recruiter/profile/", form);
            setSuccess("Profile updated successfully ✨");
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
        } catch (err) {
            console.error(err);
            setError("Failed to update profile. Please try again.");
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
        if (meta.username) return meta.username[0].toUpperCase();
        return "?";
    }, [form.full_name, meta.username]);

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
                            Profile updated successfully
                        </h4>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#4b5563",
                                lineHeight: 1.5,
                            }}
                        >
                            Your recruiter profile is now updated.
                            <br />
                            Candidates will see your latest details.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

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
                        Loading recruiter profile…
                    </span>

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

    if (!isAuthenticated || user?.role !== "recruiter") {
        return (
            <div
                style={{
                    minHeight: "calc(100vh - 64px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background:
                        "linear-gradient(135deg, #fee2e2 0%, #fef2f2 40%, #f9fafb 100%)",
                    padding: "16px",
                }}
            >
                <div
                    style={{
                        maxWidth: "420px",
                        width: "100%",
                        background: "rgba(255,255,255,0.96)",
                        padding: "24px 24px 20px",
                        borderRadius: "24px",
                        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
                        border: "1px solid #fecaca",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "20px",
                            marginBottom: "6px",
                            color: "#b91c1c",
                        }}
                    >
                        Access Denied
                    </h2>
                    <p style={{ fontSize: "14px", color: "#6b7280" }}>
                        You must be logged in as a recruiter to view this page.
                    </p>
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
                position: "relative",
            }}
        >
            <style>
                {`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    90% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(10px); }
                }

                @media (max-width: 768px) {
                    .profile-grid {
                        grid-template-columns: minmax(0,1fr) !important;
                    }
                }
            `}
            </style>

            {showPopup && <Popup />}

            <div
                style={{
                    width: "100%",
                    maxWidth: "960px",
                    background: "rgba(255, 255, 255, 0.92)",
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
                            Recruiter Profile
                        </h1>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                maxWidth: "520px",
                            }}
                        >
                            This is your personal recruiter profile. Candidates may
                            see parts of this when you interact with them. Keep it
                            professional and up to date.
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
                        Recruiter · {meta.username || "Profile"}
                    </span>
                </div>

                {/* Toast messages */}
                {(error || success) && (
                    <div style={{ marginBottom: "12px" }}>
                        {error && (
                            <div
                                style={{
                                    marginBottom: success ? "8px" : 0,
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
                        {success && (
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
                                <span>{success}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Main content: left summary + right form */}
                <div
                    className="profile-grid"
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
                                        "radial-gradient(circle at 0% 0%, #4f46e5, #6366f1 50%, #0ea5e9 100%)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: "26px",
                                    fontWeight: 700,
                                    boxShadow:
                                        "0 12px 35px rgba(79,70,229,0.5)",
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
                                    {form.position || "Recruiter / Hiring Manager"}
                                </div>
                            </div>

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
                                        Username
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            color: "#6b7280",
                                        }}
                                    >
                                        {meta.username || "—"}
                                    </span>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
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
                                        Email
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            color: "#6b7280",
                                            maxWidth: "160px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        title={meta.email}
                                    >
                                        {meta.email || "—"}
                                    </span>
                                </div>
                            </div>

                            {/* Small hint */}
                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "11px",
                                    color: "#9ca3af",
                                }}
                            >
                                Tip: Use your{" "}
                                <span style={{ fontWeight: 500 }}>
                                    real name
                                </span>{" "}
                                and role so candidates can trust who they’re
                                talking to.
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
                            {/* Name + Position */}
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
                                        type="text"
                                        name="full_name"
                                        value={form.full_name}
                                        onChange={handleChange}
                                        placeholder="e.g. Rahul Sharma"
                                        style={{
                                            width: "100%",
                                            borderRadius: "10px",
                                            border:
                                                "1px solid rgba(209, 213, 219, 0.9)",
                                            padding: "8px 10px 8px 10px",
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
                                        Position / Role
                                    </label>
                                    <input
                                        type="text"
                                        name="position"
                                        value={form.position}
                                        onChange={handleChange}
                                        placeholder="e.g. HR Manager, Talent Acquisition"
                                        style={{
                                            width: "100%",
                                            borderRadius: "10px",
                                            border:
                                                "1px solid rgba(209, 213, 219, 0.9)",
                                            padding: "8px 10px 8px 10px",
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

                            {/* Phone + LinkedIn */}
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
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={form.phone_number}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        style={{
                                            width: "100%",
                                            borderRadius: "10px",
                                            border:
                                                "1px solid rgba(209, 213, 219, 0.9)",
                                            padding: "8px 10px 8px 10px",
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
                                        LinkedIn Profile
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={form.linkedin}
                                        onChange={handleChange}
                                        placeholder="https://www.linkedin.com/in/yourprofile"
                                        style={{
                                            width: "100%",
                                            borderRadius: "10px",
                                            border:
                                                "1px solid rgba(209, 213, 219, 0.9)",
                                            padding: "8px 10px 8px 10px",
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
                                    name="bio"
                                    value={form.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Short intro about you, your experience, and what kind of candidates you usually hire."
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
                                    Example: “5+ years hiring for product-based
                                    companies. Mostly hire SDEs, data engineers,
                                    and ML roles.”
                                </div>
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
                                    onClick={() => {
                                        window.location.reload();
                                    }}
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
                                    {saving ? "Saving…" : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruiterProfile;
