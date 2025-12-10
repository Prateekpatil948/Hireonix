import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { saveJob, unsaveJob } from "../api/jobs";
import { useAuth } from "../context/AuthContext";

const JobCard = ({ job }) => {
    const { isAuthenticated, user } = useAuth();
    const [saved, setSaved] = useState(!!job.is_saved);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setSaved(!!job.is_saved);
    }, [job.is_saved]);

    const canSave = isAuthenticated && user?.role === "candidate";

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!canSave || saving) return;

        setSaving(true);
        try {
            if (saved) {
                await unsaveJob(job.id);
                setSaved(false);
            } else {
                await saveJob(job.id);
                setSaved(true);
            }
        } catch (err) {
            console.error("Error (un)saving job:", err.response?.data || err);
            alert(
                err.response?.data?.detail ||
                "Could not update saved jobs. Check backend logs / console."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="job-card">
            <div
                className="job-card-title"
                style={{ display: "flex", justifyContent: "space-between", gap: 8 }}
            >
                <div>
                    {job.title}
                    {job.company_name && (
                        <span style={{ color: "#6b7280", fontSize: 13 }}>
                            {" "}
                            • {job.company_name}
                        </span>
                    )}
                </div>

                {canSave && (
                    <button
                        type="button"
                        onClick={handleToggleSave}
                        style={{
                            border: "none",
                            background: "transparent",
                            cursor: saving ? "default" : "pointer",
                            fontSize: 20,
                            lineHeight: 1,
                            opacity: saving ? 0.6 : 1,
                        }}
                        aria-label={saved ? "Unsave job" : "Save job"}
                    >
                        {saved ? "❤️" : "🤍"}
                    </button>
                )}
            </div>

            <div className="job-card-meta">
                {job.location} • {job.job_type}
            </div>

            <div className="job-card-footer">
                <Link to={`/jobs/${job.id}`} className="link-inline">
                    View details →
                </Link>
            </div>
        </div>
    );
};

export default JobCard;
