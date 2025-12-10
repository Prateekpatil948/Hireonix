import { useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";

const RecruiterCompany = () => {
    const [form, setForm] = useState({
        name: "",
        website: "",
        industry: "",
        location: "",
        about: "",
        company_size: "",
        founded_year: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showPopup, setShowPopup] = useState(false);

    const loadCompany = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axiosClient.get("recruiter/company/");
            const data = res.data || {};
            setForm({
                name: data.name || "",
                website: data.website || "",
                industry: data.industry || "",
                location: data.location || "",
                about: data.about || "",
                company_size: data.company_size || "",
                founded_year: data.founded_year || "",
            });
        } catch (err) {
            console.error("Error loading company:", err.response?.data || err);
            setError("Could not load company details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompany();
    }, []);

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
        setMessage("");

        try {
            const payload = {
                ...form,
                founded_year: form.founded_year ? Number(form.founded_year) : null,
            };

            await axiosClient.put("recruiter/company/", payload);
            setMessage("Company details updated successfully ✨");

            // show popup like RecruiterJobs
            setShowPopup(true);
            setTimeout(() => setShowPopup(false), 3000);
        } catch (err) {
            console.error("Error updating company:", err.response?.data || err);
            setError("Could not update company details.");
        } finally {
            setSaving(false);
        }
    };

    const initials = useMemo(() => {
        if (form.name?.trim()) {
            return form.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        return "C";
    }, [form.name]);

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
                            Company updated successfully
                        </h4>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#4b5563",
                                lineHeight: 1.5,
                            }}
                        >
                            Your company details are now updated.
                            <br />
                            Candidates will see the latest info on your job postings.
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
                        Loading company details…
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
                    .company-profile-grid {
                        grid-template-columns: minmax(0, 1fr) !important;
                    }
                }
            `}
            </style>

            {showPopup && <Popup />}

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
                            Company Profile
                        </h1>
                        <p
                            style={{
                                fontSize: "14px",
                                color: "#6b7280",
                                maxWidth: "520px",
                            }}
                        >
                            Update your company information. This will be shown
                            on your job postings and helps candidates know who
                            they are applying to.
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
                        Recruiter · Company
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
                    className="company-profile-grid"
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
                            {/* Logo avatar */}
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
                                    {form.name || "Your Company Name"}
                                </div>
                                <div
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                    }}
                                >
                                    {form.industry || "Industry not set"}
                                </div>
                            </div>

                            {/* Info block */}
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
                                        Location
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            color: "#6b7280",
                                            maxWidth: "150px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        title={form.location}
                                    >
                                        {form.location || "Not added"}
                                    </span>
                                </div>
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
                                        Website
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            color: "#2563eb",
                                            maxWidth: "150px",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                        title={form.website}
                                    >
                                        {form.website || "Not added"}
                                    </span>
                                </div>
                                {form.founded_year && (
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
                                            Founded
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "11px",
                                                color: "#6b7280",
                                            }}
                                        >
                                            {form.founded_year}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Hint */}
                            <div
                                style={{
                                    marginTop: "10px",
                                    fontSize: "11px",
                                    color: "#9ca3af",
                                }}
                            >
                                Tip: A clear{" "}
                                <span style={{ fontWeight: 500 }}>
                                    company profile
                                </span>{" "}
                                builds trust and gets more quality applicants.
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
                            {/* Name + Website */}
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
                                        Company Name
                                    </label>
                                    <input
                                        className="input"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="Your company name"
                                        required
                                        style={inputStyle}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
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
                                        Website
                                    </label>
                                    <input
                                        className="input"
                                        name="website"
                                        value={form.website}
                                        onChange={handleChange}
                                        placeholder="https://example.com"
                                        style={inputStyle}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
                                    />
                                </div>
                            </div>

                            {/* Industry + Location */}
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
                                        Industry
                                    </label>
                                    <input
                                        className="input"
                                        name="industry"
                                        value={form.industry}
                                        onChange={handleChange}
                                        placeholder="e.g. IT Services, EdTech"
                                        style={inputStyle}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
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
                                        Location
                                    </label>
                                    <input
                                        className="input"
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="City, State"
                                        style={inputStyle}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
                                    />
                                </div>
                            </div>

                            {/* Size + Founded */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1.2fr 1fr",
                                    gap: "14px",
                                    marginBottom: "12px",
                                }}
                            >
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
                                        Company Size
                                    </label>
                                    <select
                                        className="input"
                                        name="company_size"
                                        value={form.company_size || ""}
                                        onChange={handleChange}
                                        style={{
                                            ...inputStyle,
                                            paddingRight: "30px",
                                        }}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
                                    >
                                        <option value="">Select size</option>
                                        <option value="small">
                                            Small (1–50 employees)
                                        </option>
                                        <option value="medium">
                                            Medium (51–200 employees)
                                        </option>
                                        <option value="large">
                                            Large (200+ employees)
                                        </option>
                                    </select>
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
                                        Founded Year
                                    </label>
                                    <input
                                        className="input"
                                        type="number"
                                        name="founded_year"
                                        value={form.founded_year}
                                        onChange={handleChange}
                                        placeholder="e.g. 2018"
                                        style={inputStyle}
                                        onFocus={onInputFocus}
                                        onBlur={onInputBlur}
                                    />
                                </div>
                            </div>

                            {/* About */}
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
                                    About Company
                                </label>
                                <textarea
                                    className="input"
                                    name="about"
                                    value={form.about}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Write a short description about your company, what you do, and the kind of roles you usually hire for."
                                    style={{
                                        ...inputStyle,
                                        borderRadius: "12px",
                                        resize: "vertical",
                                        minHeight: "80px",
                                    }}
                                    onFocus={onInputFocus}
                                    onBlur={onInputBlur}
                                />
                                <div
                                    style={{
                                        marginTop: "4px",
                                        fontSize: "11px",
                                        color: "#9ca3af",
                                    }}
                                >
                                    Example: “We are a product-based startup
                                    building AI tools, currently hiring for
                                    full-stack, data and DevOps roles.”
                                </div>
                            </div>

                            {/* Actions */}
                            <div
                                style={{
                                    marginTop: "14px",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "8px",
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={loadCompany}
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
                                    className="btn btn-primary mt-3"
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

/* shared input styles + focus handlers */
const inputStyle = {
    width: "100%",
    borderRadius: "10px",
    border: "1px solid rgba(209, 213, 219, 0.9)",
    padding: "8px 10px",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
};

const onInputFocus = (e) => {
    e.target.style.borderColor = "#4f46e5";
    e.target.style.boxShadow = "0 0 0 1px rgba(79,70,229,0.25)";
};

const onInputBlur = (e) => {
    e.target.style.borderColor = "rgba(209, 213, 219, 0.9)";
    e.target.style.boxShadow = "none";
};

export default RecruiterCompany;
