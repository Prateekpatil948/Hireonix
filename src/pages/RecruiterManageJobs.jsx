// src/pages/RecruiterManageJobs.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PaginationControls from "../components/PaginationControls";

const RecruiterManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editJob, setEditJob] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Popup state
    const [showPopup, setShowPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const JOBS_PER_PAGE = 4;

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axiosClient.get("jobs/my-jobs/");
            setJobs(res.data);
            setPage(1);
        } catch (err) {
            console.error("Error loading jobs:", err);
            setError("Could not load your jobs.");
        } finally {
            setLoading(false);
        }
    };

    const showSuccessPopup = (title, msg) => {
        setPopupTitle(title);
        setMessage(msg);
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;

        setError("");
        setMessage("");
        try {
            await axiosClient.delete(`jobs/${jobId}/`);
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
            showSuccessPopup("Job deleted", "The job has been deleted successfully.");
        } catch (err) {
            console.error("Error deleting job:", err);
            setError("Could not delete job.");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const payload = {
                title: editJob.title,
                location: editJob.location,
                job_type: editJob.job_type,
                description: editJob.description,
                is_active: editJob.is_active,
                salary_min:
                    editJob.salary_min !== "" && editJob.salary_min != null
                        ? Number(editJob.salary_min)
                        : null,
                salary_max:
                    editJob.salary_max !== "" && editJob.salary_max != null
                        ? Number(editJob.salary_max)
                        : null,
                qualification: editJob.qualification || "",
                batch: editJob.batch || "",
                skills: editJob.skills || "",
                external_link: editJob.external_link || "",
            };

            const res = await axiosClient.put(`jobs/${editJob.id}/`, payload);
            setEditJob(null);
            // Update local list with fresh job data
            setJobs((prev) =>
                prev.map((j) => (j.id === res.data.id ? res.data : j))
            );

            showSuccessPopup(
                "Job updated",
                "Job details have been updated successfully."
            );
        } catch (err) {
            console.error("Error updating job:", err);
            setError("Could not update job.");
        }
    };

    // 🔧 FIXED: use PUT instead of PATCH, send full job payload with toggled is_active
    const handleToggleActive = async (job) => {
        setError("");
        setMessage("");

        const newActive = !job.is_active;

        const payload = {
            title: job.title,
            location: job.location,
            job_type: job.job_type,
            description: job.description,
            is_active: newActive,
            salary_min:
                job.salary_min !== "" && job.salary_min != null
                    ? Number(job.salary_min)
                    : null,
            salary_max:
                job.salary_max !== "" && job.salary_max != null
                    ? Number(job.salary_max)
                    : null,
            qualification: job.qualification || "",
            batch: job.batch || "",
            skills: job.skills || "",
            external_link: job.external_link || "",
        };

        try {
            const res = await axiosClient.put(`jobs/${job.id}/`, payload);

            setJobs((prev) =>
                prev.map((j) => (j.id === res.data.id ? res.data : j))
            );

            const statusText = newActive ? "activated" : "deactivated";
            showSuccessPopup(
                "Status changed",
                `Job has been ${statusText} successfully.`
            );
        } catch (err) {
            console.error("Error toggling active:", err);
            setError("Could not change job status.");
        }
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
                }}
            >
                <p style={{ fontSize: 14, color: "#6b7280" }}>Loading jobs...</p>
            </div>
        );
    }

    // Pagination calculations
    const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE) || 1;
    const startIndex = (page - 1) * JOBS_PER_PAGE;
    const currentJobs = jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

    // Center popup component
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
                            {popupTitle || "Success"}
                        </h4>
                        <p
                            style={{
                                margin: 0,
                                fontSize: 13,
                                color: "#4b5563",
                                lineHeight: 1.5,
                            }}
                        >
                            {message ||
                                "Your changes have been applied successfully."}
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
            {/* fade animation keyframes */}
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
                    maxWidth: 1000,
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    borderRadius: 24,
                    boxShadow: "0 22px 60px rgba(15,23,42,0.18)",
                    border: "1px solid rgba(148,163,184,0.25)",
                    padding: 20,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                        marginBottom: 10,
                        flexWrap: "wrap",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                marginBottom: 2,
                                fontSize: 20,
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            Manage Your Jobs
                        </h2>
                        <p
                            style={{
                                fontSize: 14,
                                color: "#6b7280",
                            }}
                        >
                            Edit, activate/deactivate or delete jobs posted by you.
                        </p>
                    </div>
                    <div
                        style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            background: "#ecfeff",
                            color: "#0f766e",
                            border: "1px solid #99f6e4",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {jobs.length} job{jobs.length === 1 ? "" : "s"}
                    </div>
                </div>

                {error && (
                    <p style={{ color: "#b91c1c", marginTop: 8, fontSize: 13 }}>
                        {error}
                    </p>
                )}
                {message && (
                    <p style={{ color: "#15803d", marginTop: 8, fontSize: 13 }}>
                        {message}
                    </p>
                )}

                {jobs.length === 0 ? (
                    <p
                        style={{
                            marginTop: 12,
                            fontSize: 14,
                            color: "#6b7280",
                        }}
                    >
                        No jobs posted yet.
                    </p>
                ) : (
                    <>
                        <ul
                            style={{
                                listStyle: "none",
                                paddingLeft: 0,
                                marginTop: 12,
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                            }}
                        >
                            {currentJobs.map((job) => (
                                <li
                                    key={job.id}
                                    style={{
                                        borderRadius: 14,
                                        border: "1px solid #e5e7eb",
                                        padding: "10px 12px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        alignItems: "center",
                                        background: "#ffffff",
                                        boxShadow: "0 2px 5px rgba(15,23,42,0.04)",
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 15,
                                                marginBottom: 2,
                                            }}
                                        >
                                            {job.title}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: "#6b7280",
                                            }}
                                        >
                                            {job.location} • {job.job_type}
                                        </div>

                                        {(job.salary_min || job.salary_max) && (
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    color: "#4b5563",
                                                    marginTop: 4,
                                                }}
                                            >
                                                Salary:{" "}
                                                {job.salary_min
                                                    ? job.salary_min
                                                    : "N/A"}{" "}
                                                {job.salary_max
                                                    ? `– ${job.salary_max}`
                                                    : ""}
                                            </div>
                                        )}

                                        <div
                                            style={{
                                                fontSize: 11,
                                                marginTop: 6,
                                                display: "inline-flex",
                                                alignItems: "center",
                                                padding: "2px 8px",
                                                borderRadius: 999,
                                                backgroundColor: job.is_active
                                                    ? "#dcfce7"
                                                    : "#fee2e2",
                                                color: job.is_active
                                                    ? "#166534"
                                                    : "#b91c1c",
                                                border: job.is_active
                                                    ? "1px solid #bbf7d0"
                                                    : "1px solid #fecaca",
                                            }}
                                        >
                                            {job.is_active ? "Active" : "Inactive"}
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: 8,
                                            justifyContent: "flex-end",
                                        }}
                                    >
                                        <button
                                            className="btn btn-outline"
                                            onClick={() =>
                                                setEditJob({
                                                    ...job,
                                                    salary_min: job.salary_min ?? "",
                                                    salary_max: job.salary_max ?? "",
                                                    qualification: job.qualification ?? "",
                                                    batch: job.batch ?? "",
                                                    skills: job.skills ?? "",
                                                    external_link: job.external_link ?? "",
                                                })
                                            }
                                            style={{ fontSize: 12, padding: "5px 10px" }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-outline"
                                            onClick={() => handleToggleActive(job)}
                                            style={{ fontSize: 12, padding: "5px 10px" }}
                                        >
                                            {job.is_active ? "Deactivate" : "Activate"}
                                        </button>

                                        <button
                                            className="btn btn-outline"
                                            onClick={() => handleDelete(job.id)}
                                            style={{
                                                fontSize: 12,
                                                padding: "5px 10px",
                                                color: "#b91c1c",
                                                borderColor: "#fecaca",
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
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

                {/* Edit Job Modal */}
                {editJob && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(15, 23, 42, 0.45)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 50,
                            padding: "20px",
                        }}
                    >
                        <div
                            style={{
                                width: "100%",
                                maxWidth: "620px",
                                maxHeight: "90vh",
                                background:
                                    "linear-gradient(135deg,#ffffff,#f9fafb)",
                                borderRadius: "16px",
                                boxShadow:
                                    "0 20px 40px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.2)",
                                padding: "20px",
                                overflowY: "auto",
                            }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 10,
                                }}
                            >
                                <div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: 18,
                                            fontWeight: 600,
                                        }}
                                    >
                                        Edit Job
                                    </h3>
                                    <p
                                        style={{
                                            margin: 0,
                                            fontSize: 13,
                                            color: "#6b7280",
                                        }}
                                    >
                                        Update job details and save changes.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditJob(null)}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        fontSize: 22,
                                        cursor: "pointer",
                                        lineHeight: 1,
                                        color: "#6b7280",
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit}>
                                <div
                                    style={{
                                        display: "grid",
                                        gap: 10,
                                        gridTemplateColumns: "1fr",
                                    }}
                                >
                                    <div className="form-group">
                                        <label className="form-label">Job Title</label>
                                        <input
                                            className="input"
                                            value={editJob.title}
                                            onChange={(e) =>
                                                setEditJob({
                                                    ...editJob,
                                                    title: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input
                                            className="input"
                                            value={editJob.location}
                                            onChange={(e) =>
                                                setEditJob({
                                                    ...editJob,
                                                    location: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Job Type</label>
                                        <input
                                            className="input"
                                            value={editJob.job_type}
                                            onChange={(e) =>
                                                setEditJob({
                                                    ...editJob,
                                                    job_type: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Qualification</label>
                                        <input
                                            className="input"
                                            value={editJob.qualification}
                                            onChange={(e) =>
                                                setEditJob({
                                                    ...editJob,
                                                    qualification: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. B.E / B.Tech / Any degree"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Batch</label>
                                        <input
                                            className="input"
                                            value={editJob.batch}
                                            onChange={(e) =>
                                                setEditJob({
                                                    ...editJob,
                                                    batch: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. 2023, 2024, 2022 and before"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Skills</label>
                                        <input
                                            className="input"
                                            value={editJob.skills}
                                            onChange={(e) =>
                                                setEditJob({
                                                    ...editJob,
                                                    skills: e.target.value,
                                                })
                                            }
                                            placeholder="e.g. React, Django, REST API"
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

                                    <div className="form-group">
                                        <label className="form-label">
                                            External Apply Link (optional)
                                        </label>
                                        <input
                                            className="input"
                                            value={editJob.external_link}
                                            onChange={(e) =>
                                                setEditJob({
                                                    ...editJob,
                                                    external_link: e.target.value,
                                                })
                                            }
                                            placeholder="https://company.com/careers/job-id"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">
                                            Salary Range (optional)
                                        </label>
                                        <div style={{ display: "flex", gap: 8 }}>
                                            <input
                                                className="input"
                                                type="number"
                                                placeholder="Min"
                                                value={editJob.salary_min}
                                                onChange={(e) =>
                                                    setEditJob({
                                                        ...editJob,
                                                        salary_min: e.target.value,
                                                    })
                                                }
                                            />
                                            <input
                                                className="input"
                                                type="number"
                                                placeholder="Max"
                                                value={editJob.salary_max}
                                                onChange={(e) =>
                                                    setEditJob({
                                                        ...editJob,
                                                        salary_max: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="input"
                                            rows={4}
                                            value={editJob.description}
                                            onChange={(e) =>
                                                setEditJob({
                                                    ...editJob,
                                                    description: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "flex-end",
                                        gap: 8,
                                        marginTop: 14,
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="btn btn-outline"
                                        onClick={() => setEditJob(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruiterManageJobs;
