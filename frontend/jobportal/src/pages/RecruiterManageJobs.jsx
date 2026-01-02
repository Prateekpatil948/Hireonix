import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PaginationControls from "../components/PaginationControls";
import { 
  FiBriefcase, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight,
  FiMapPin, FiDollarSign, FiUsers, FiCheck, FiX, FiEye,
  FiCalendar, FiAward, FiLink, FiRefreshCw
} from "react-icons/fi";

const RecruiterManageJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editJob, setEditJob] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [popupTitle, setPopupTitle] = useState("");
    const [popupMessage, setPopupMessage] = useState("");

    const [page, setPage] = useState(1);
    const JOBS_PER_PAGE = 5;

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
            setError("Could not load your jobs. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const showSuccessMessage = (title, msg) => {
        setPopupTitle(title);
        setPopupMessage(msg);
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 3000);
    };

    const handleDelete = async (jobId, jobTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) return;

        setError("");
        setMessage("");
        try {
            await axiosClient.delete(`jobs/${jobId}/`);
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
            showSuccessMessage("Job Deleted", `${jobTitle} has been successfully deleted.`);
        } catch (err) {
            console.error("Error deleting job:", err);
            setError("Could not delete job. Please try again.");
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
                salary_min: editJob.salary_min ? Number(editJob.salary_min) : null,
                salary_max: editJob.salary_max ? Number(editJob.salary_max) : null,
                qualification: editJob.qualification || "",
                batch: editJob.batch || "",
                skills: editJob.skills || "",
                external_link: editJob.external_link || "",
            };

            const res = await axiosClient.put(`jobs/${editJob.id}/`, payload);
            setEditJob(null);
            setJobs((prev) => prev.map((j) => (j.id === res.data.id ? res.data : j)));
            showSuccessMessage("Job Updated", "Job details have been updated successfully.");
        } catch (err) {
            console.error("Error updating job:", err);
            setError("Could not update job. Please try again.");
        }
    };

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
            salary_min: job.salary_min ? Number(job.salary_min) : null,
            salary_max: job.salary_max ? Number(job.salary_max) : null,
            qualification: job.qualification || "",
            batch: job.batch || "",
            skills: job.skills || "",
            external_link: job.external_link || "",
        };

        try {
            const res = await axiosClient.put(`jobs/${job.id}/`, payload);
            setJobs((prev) => prev.map((j) => (j.id === res.data.id ? res.data : j)));
            const statusText = newActive ? "activated" : "deactivated";
            showSuccessMessage("Status Changed", `Job has been ${statusText} successfully.`);
        } catch (err) {
            console.error("Error toggling active:", err);
            setError("Could not change job status. Please try again.");
        }
    };

    // Success Popup Component
    const SuccessPopup = () => (
        <div style={successPopupOverlayStyle}>
            <div style={successPopupStyle}>
                <div style={successPopupHeaderStyle}>
                    <div style={successPopupIconStyle}>
                        <FiCheck size={24} />
                    </div>
                    <div style={successPopupContentStyle}>
                        <h4 style={successPopupTitleStyle}>
                            {popupTitle} ✅
                        </h4>
                        <p style={successPopupMessageStyle}>
                            {popupMessage}
                        </p>
                    </div>
                    <button 
                        style={successPopupCloseStyle}
                        onClick={() => setShowSuccessPopup(false)}
                    >
                        <FiX size={18} />
                    </button>
                </div>
                <div style={successPopupActionsStyle}>
                    <span style={successPopupHintStyle}>
                        Changes are reflected immediately
                    </span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={loadingContainerStyle}>
                <div style={loadingSpinnerStyle}></div>
                <p style={loadingTextStyle}>
                    Loading your jobs...
                </p>
            </div>
        );
    }

    // Pagination calculations
    const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE) || 1;
    const startIndex = (page - 1) * JOBS_PER_PAGE;
    const currentJobs = jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

    const activeJobsCount = jobs.filter(job => job.is_active).length;

    return (
        <div style={pageContainerStyle}>
            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes successPopup {
                    0% { opacity: 0; transform: translateY(20px) scale(0.95); }
                    10% { opacity: 1; transform: translateY(0) scale(1); }
                    90% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(20px) scale(0.95); }
                }
            `}</style>

            {showSuccessPopup && <SuccessPopup />}

            <div style={contentContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>
                            <span style={{ color: '#4f46e5' }}>Manage</span>
                            <span style={{ color: '#7c3aed' }}> Jobs</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Track, edit, and manage your job postings
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>{activeJobsCount} active jobs</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style={headerActionsStyle}>
                        <button 
                            style={refreshButtonStyle}
                            onClick={loadJobs}
                            title="Refresh jobs"
                        >
                            <FiRefreshCw size={18} />
                        </button>
                        <div style={statsCardStyle}>
                            <div style={statsIconStyle}>
                                <FiBriefcase size={20} />
                            </div>
                            <div>
                                <div style={statsNumberStyle}>{jobs.length}</div>
                                <div style={statsLabelStyle}>Total Jobs</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error/Message Alerts */}
                {error && (
                    <div style={errorAlertStyle}>
                        <div style={errorIconStyle}>
                            <FiX size={18} />
                        </div>
                        <div style={errorContentStyle}>
                            <strong>Error:</strong> {error}
                        </div>
                    </div>
                )}

                {message && !showSuccessPopup && (
                    <div style={successAlertStyle}>
                        <div style={successAlertIconStyle}>
                            <FiCheck size={18} />
                        </div>
                        <div style={successAlertContentStyle}>
                            {message}
                        </div>
                    </div>
                )}

                {/* Jobs List */}
                <div style={jobsCardStyle}>
                    <div style={jobsHeaderStyle}>
                        <h3 style={jobsTitleStyle}>
                            <FiBriefcase size={20} style={{ marginRight: 10, color: '#4f46e5' }} />
                            Your Job Postings
                        </h3>
                        <div style={jobsCountStyle}>
                            {jobs.length} total • {activeJobsCount} active
                        </div>
                    </div>

                    {jobs.length === 0 ? (
                        <div style={emptyStateStyle}>
                            <div style={emptyIconStyle}>📋</div>
                            <h4 style={emptyTitleStyle}>No Jobs Posted Yet</h4>
                            <p style={emptyMessageStyle}>
                                Start by posting your first job to manage listings here.
                            </p>
                            <button style={emptyActionButtonStyle}>
                                Post New Job
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={jobsListStyle}>
                                {currentJobs.map((job) => (
                                    <div 
                                        key={job.id} 
                                        style={jobCardStyle(job.is_active)}
                                        className="job-card"
                                    >
                                        <div style={jobCardHeaderStyle}>
                                            <div style={jobCardLeftStyle}>
                                                <div style={jobTitleRowStyle}>
                                                    <h4 style={jobTitleStyle}>
                                                        {job.title}
                                                    </h4>
                                                    <div style={jobStatusBadgeStyle(job.is_active)}>
                                                        {job.is_active ? 'Active' : 'Inactive'}
                                                    </div>
                                                </div>
                                                <div style={jobMetaStyle}>
                                                    <span style={jobMetaItemStyle}>
                                                        <FiMapPin size={12} style={{ marginRight: 4 }} />
                                                        {job.location}
                                                    </span>
                                                    <span style={jobMetaItemStyle}>
                                                        <FiBriefcase size={12} style={{ marginRight: 4 }} />
                                                        {job.job_type}
                                                    </span>
                                                    {(job.salary_min || job.salary_max) && (
                                                        <span style={jobMetaItemStyle}>
                                                            <FiDollarSign size={12} style={{ marginRight: 4 }} />
                                                            {job.salary_min || 'N/A'} - {job.salary_max || 'N/A'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={jobSkillsStyle}>
                                                    {job.skills && job.skills.split(',').slice(0, 3).map((skill, idx) => (
                                                        <span key={idx} style={skillTagStyle}>
                                                            {skill.trim()}
                                                        </span>
                                                    ))}
                                                    {job.skills && job.skills.split(',').length > 3 && (
                                                        <span style={moreSkillsStyle}>
                                                            +{job.skills.split(',').length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div style={jobCardActionsStyle}>
                                                <div style={actionButtonsStyle}>
                                                    <button
                                                        type="button"
                                                        style={viewButtonStyle}
                                                        onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                                                    >
                                                        <FiEye size={14} />
                                                        View
                                                    </button>
                                                    <button
                                                        type="button"
                                                        style={editButtonStyle}
                                                        onClick={() => setEditJob({
                                                            ...job,
                                                            salary_min: job.salary_min ?? "",
                                                            salary_max: job.salary_max ?? "",
                                                            qualification: job.qualification ?? "",
                                                            batch: job.batch ?? "",
                                                            skills: job.skills ?? "",
                                                            external_link: job.external_link ?? "",
                                                        })}
                                                    >
                                                        <FiEdit size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        style={toggleButtonStyle}
                                                        onClick={() => handleToggleActive(job)}
                                                    >
                                                        {job.is_active ? (
                                                            <>
                                                                <FiToggleLeft size={14} />
                                                                Deactivate
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiToggleRight size={14} />
                                                                Activate
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        style={deleteButtonStyle}
                                                        onClick={() => handleDelete(job.id, job.title)}
                                                    >
                                                        <FiTrash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                                <div style={jobDateStyle}>
                                                    Posted on {new Date(job.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {jobs.length > JOBS_PER_PAGE && (
                                <div style={paginationContainerStyle}>
                                    <PaginationControls
                                        page={page}
                                        totalPages={totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit Job Modal */}
            {editJob && (
                <div style={modalOverlayStyle}>
                    <div style={modalCardStyle}>
                        <div style={modalHeaderStyle}>
                            <div>
                                <h3 style={modalTitleStyle}>
                                    <span style={modalIconStyle}>✏️</span>
                                    Edit Job
                                </h3>
                                <p style={modalSubtitleStyle}>
                                    Update job details and requirements
                                </p>
                            </div>
                            <button 
                                style={modalCloseButtonStyle} 
                                onClick={() => setEditJob(null)}
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit}>
                            <div style={modalGridStyle}>
                                <div style={modalFormGroupStyle}>
                                    <label style={modalLabelStyle}>
                                        <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                        Job Title *
                                    </label>
                                    <input
                                        style={modalInputStyle}
                                        value={editJob.title}
                                        onChange={(e) => setEditJob({...editJob, title: e.target.value})}
                                        required
                                    />
                                </div>

                                <div style={modalFormGroupStyle}>
                                    <label style={modalLabelStyle}>
                                        <FiMapPin size={14} style={{ marginRight: 6 }} />
                                        Location *
                                    </label>
                                    <input
                                        style={modalInputStyle}
                                        value={editJob.location}
                                        onChange={(e) => setEditJob({...editJob, location: e.target.value})}
                                        required
                                    />
                                </div>

                                <div style={modalFormGroupStyle}>
                                    <label style={modalLabelStyle}>
                                        <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                        Job Type *
                                    </label>
                                    <select
                                        style={modalInputStyle}
                                        value={editJob.job_type}
                                        onChange={(e) => setEditJob({...editJob, job_type: e.target.value})}
                                        required
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Remote">Remote</option>
                                    </select>
                                </div>

                                <div style={modalFormGroupStyle}>
                                    <label style={modalLabelStyle}>
                                        <FiUsers size={14} style={{ marginRight: 6 }} />
                                        Target Batch
                                    </label>
                                    <input
                                        style={modalInputStyle}
                                        value={editJob.batch}
                                        onChange={(e) => setEditJob({...editJob, batch: e.target.value})}
                                        placeholder="e.g. 2023, 2024, Any"
                                    />
                                </div>

                                <div style={modalFormGroupStyle}>
                                    <label style={modalLabelStyle}>
                                        <FiAward size={14} style={{ marginRight: 6 }} />
                                        Qualification
                                    </label>
                                    <input
                                        style={modalInputStyle}
                                        value={editJob.qualification}
                                        onChange={(e) => setEditJob({...editJob, qualification: e.target.value})}
                                        placeholder="e.g. B.E/B.Tech, MCA, Any degree"
                                    />
                                </div>

                                <div style={modalFormGroupStyle}>
                                    <label style={modalLabelStyle}>
                                        <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                        Required Skills
                                    </label>
                                    <input
                                        style={modalInputStyle}
                                        value={editJob.skills}
                                        onChange={(e) => setEditJob({...editJob, skills: e.target.value})}
                                        placeholder="React, Python, AWS, Docker (comma separated)"
                                    />
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <div style={modalFormGroupStyle}>
                                        <label style={modalLabelStyle}>
                                            <FiDollarSign size={14} style={{ marginRight: 6 }} />
                                            Salary Range (₹ LPA)
                                        </label>
                                        <div style={salaryRangeStyle}>
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={editJob.salary_min}
                                                onChange={(e) => setEditJob({...editJob, salary_min: e.target.value})}
                                                style={salaryInputStyle}
                                            />
                                            <span style={salarySeparatorStyle}>to</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={editJob.salary_max}
                                                onChange={(e) => setEditJob({...editJob, salary_max: e.target.value})}
                                                style={salaryInputStyle}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <div style={modalFormGroupStyle}>
                                        <label style={modalLabelStyle}>
                                            <FiLink size={14} style={{ marginRight: 6 }} />
                                            External Apply Link
                                        </label>
                                        <input
                                            style={modalInputStyle}
                                            value={editJob.external_link}
                                            onChange={(e) => setEditJob({...editJob, external_link: e.target.value})}
                                            placeholder="https://company.com/careers/job-id"
                                        />
                                    </div>
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <div style={modalFormGroupStyle}>
                                        <label style={modalLabelStyle}>
                                            <FiBriefcase size={14} style={{ marginRight: 6 }} />
                                            Job Description *
                                        </label>
                                        <textarea
                                            style={modalTextareaStyle}
                                            rows={6}
                                            value={editJob.description}
                                            onChange={(e) => setEditJob({...editJob, description: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <div style={modalFormGroupStyle}>
                                        <label style={modalLabelStyle}>
                                            <FiToggleLeft size={14} style={{ marginRight: 6 }} />
                                            Job Status
                                        </label>
                                        <div style={statusToggleStyle}>
                                            <button
                                                type="button"
                                                style={statusButtonStyle(editJob.is_active === true)}
                                                onClick={() => setEditJob({...editJob, is_active: true})}
                                            >
                                                Active
                                            </button>
                                            <button
                                                type="button"
                                                style={statusButtonStyle(editJob.is_active === false)}
                                                onClick={() => setEditJob({...editJob, is_active: false})}
                                            >
                                                Inactive
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={modalActionsStyle}>
                                <button
                                    type="button"
                                    style={modalCancelButtonStyle}
                                    onClick={() => setEditJob(null)}
                                >
                                    <FiX size={16} style={{ marginRight: 6 }} />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={modalSubmitButtonStyle}
                                >
                                    <FiCheck size={18} style={{ marginRight: 8 }} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------- ENHANCED STYLES ---------- */

const pageContainerStyle = {
    position: "fixed",
    top: 60,
    left: 260,
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

const headerActionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
};

const refreshButtonStyle = {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    background: "linear-gradient(135deg, #f9fafb, #f3f4f6)",
    color: "#8b5cf6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        color: "#7c3aed",
        transform: "rotate(90deg)",
    },
};

const statsCardStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    border: "1px solid rgba(99, 102, 241, 0.2)",
};

const statsIconStyle = {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "rgba(79, 70, 229, 0.1)",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

const statsNumberStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1,
};

const statsLabelStyle = {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: 500,
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

const errorIconStyle = {
    marginRight: 12,
    color: "#ef4444",
};

const errorContentStyle = {
    flex: 1,
};

const successAlertStyle = {
    padding: "14px 18px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
    border: "1px solid #86efac",
    color: "#065f46",
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    marginBottom: 20,
    animation: "fadeIn 0.3s ease",
};

const successAlertIconStyle = {
    marginRight: 12,
    color: "#10b981",
};

const successAlertContentStyle = {
    flex: 1,
};

const jobsCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 24,
    flex: 1,
    display: "flex",
    flexDirection: "column",
    animation: "fadeIn 0.6s ease",
};

const jobsHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
};

const jobsTitleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    display: "flex",
    alignItems: "center",
};

const jobsCountStyle = {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
    padding: "6px 12px",
    borderRadius: 20,
    background: "#f3f4f6",
};

const jobsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    flex: 1,
    overflowY: "auto",
    paddingRight: 4,
};

const jobCardStyle = (isActive) => ({
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: "20px",
    borderRadius: 16,
    border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(209, 213, 219, 0.8)'}`,
    transition: "all 0.2s ease",
    animation: "fadeIn 0.4s ease",
    animationFillMode: "both",
    ":hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 32px rgba(139, 92, 246, 0.1)",
        borderColor: isActive ? "#10b981" : "#8b5cf6",
    },
});

const jobCardHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "flex-start",
};

const jobCardLeftStyle = {
    flex: 1,
    minWidth: 0,
};

const jobTitleRowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
};

const jobTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    flex: 1,
    minWidth: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
};

const jobStatusBadgeStyle = (isActive) => ({
    fontSize: 11,
    padding: "4px 12px",
    borderRadius: 999,
    background: isActive 
        ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" 
        : "linear-gradient(135deg, #fef3c7, #fde68a)",
    color: isActive ? "#047857" : "#92400e",
    fontWeight: 600,
    textTransform: "uppercase",
    border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
    whiteSpace: "nowrap",
});

const jobMetaStyle = {
    display: "flex",
    gap: 16,
    marginBottom: 12,
    flexWrap: "wrap",
};

const jobMetaItemStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: 13,
    color: "#6b7280",
};

const jobSkillsStyle = {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
};

const skillTagStyle = {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    color: "#4b5563",
    fontWeight: 500,
    border: "1px solid #e5e7eb",
};

const moreSkillsStyle = {
    fontSize: 11,
    color: "#9ca3af",
    fontStyle: "italic",
};

const jobCardActionsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "flex-end",
    minWidth: 220,
};

const actionButtonsStyle = {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
};

const viewButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.7)",
    background: "#fff",
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        borderColor: "#0ea5e9",
        color: "#0369a1",
    },
};

const editButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.7)",
    background: "#fff",
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        borderColor: "#8b5cf6",
        color: "#7c3aed",
    },
};

const toggleButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.7)",
    background: "#fff",
    color: "#374151",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        borderColor: "#f59e0b",
        color: "#d97706",
    },
};

const deleteButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid rgba(254, 202, 202, 0.8)",
    background: "#fff",
    color: "#dc2626",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#fee2e2",
        borderColor: "#ef4444",
        color: "#b91c1c",
    },
};

const jobDateStyle = {
    fontSize: 11,
    color: "#9ca3af",
    fontStyle: "italic",
};

const emptyStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    textAlign: "center",
    flex: 1,
};

const emptyIconStyle = {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.8,
    background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
};

const emptyTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#7c3aed",
    marginBottom: 8,
};

const emptyMessageStyle = {
    fontSize: 13,
    color: "#8b5cf6",
    maxWidth: 300,
    lineHeight: 1.5,
    opacity: 0.8,
    marginBottom: 20,
};

const emptyActionButtonStyle = {
    padding: "10px 24px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
    },
};

const paginationContainerStyle = {
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
};

const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    height: "100%",
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

/* Success Popup Styles */
const successPopupOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
    animation: "successPopup 3s ease forwards",
};

const successPopupStyle = {
    width: "100%",
    maxWidth: 420,
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 25px 50px rgba(15, 23, 42, 0.3)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    animation: "successPopup 3s ease forwards",
};

const successPopupHeaderStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
};

const successPopupIconStyle = {
    width: 48,
    height: 48,
    borderRadius: 12,
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
};

const successPopupContentStyle = {
    flex: 1,
};

const successPopupTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px 0",
};

const successPopupMessageStyle = {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.5,
    margin: 0,
};

const successPopupCloseStyle = {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    background: "linear-gradient(135deg, #f9fafb, #f3f4f6)",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        color: "#ef4444",
        transform: "rotate(90deg)",
    },
};

const successPopupActionsStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
};

const successPopupHintStyle = {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
};

/* Modal Styles */
const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
    padding: 20,
};

const modalCardStyle = {
    width: "100%",
    maxWidth: 800,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    padding: 28,
    boxShadow: "0 25px 50px rgba(15, 23, 42, 0.3)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    animation: "fadeIn 0.3s ease",
};

const modalHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
};

const modalTitleStyle = {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: 8,
};

const modalIconStyle = {
    display: "inline-flex",
    width: 32,
    height: 32,
    borderRadius: "50%",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef2ff",
    fontSize: 16,
};

const modalSubtitleStyle = {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 0,
};

const modalCloseButtonStyle = {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    background: "linear-gradient(135deg, #f9fafb, #f3f4f6)",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        color: "#ef4444",
        transform: "rotate(90deg)",
    },
};

const modalGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20,
    marginBottom: 24,
};

const modalFormGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const modalLabelStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#374151",
    display: "flex",
    alignItems: "center",
};

const modalInputStyle = {
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    fontSize: 14,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.95)",
    outline: "none",
    ":focus": {
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.15)",
        background: "#fff",
    },
    "::placeholder": {
        color: "#9ca3af",
    },
};

const modalTextareaStyle = {
    ...modalInputStyle,
    resize: "vertical",
    minHeight: 140,
    fontFamily: "inherit",
    lineHeight: 1.5,
};

const salaryRangeStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
};

const salaryInputStyle = {
    ...modalInputStyle,
    flex: 1,
    textAlign: "center",
};

const salarySeparatorStyle = {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
};

const statusToggleStyle = {
    display: "flex",
    gap: 8,
};

const statusButtonStyle = (isActive) => ({
    flex: 1,
    padding: "12px 16px",
    borderRadius: 10,
    border: `1px solid ${isActive ? '#10b981' : 'rgba(209, 213, 219, 0.8)'}`,
    background: isActive ? "rgba(16, 185, 129, 0.1)" : "#fff",
    color: isActive ? "#047857" : "#6b7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
    ":hover": {
        borderColor: isActive ? "#10b981" : "#8b5cf6",
        background: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(139, 92, 246, 0.05)",
    },
});

const modalActionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
    paddingTop: 24,
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
};

const modalCancelButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "12px 24px",
    borderRadius: 12,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f9fafb",
        borderColor: "#ef4444",
        color: "#ef4444",
        transform: "translateY(-2px)",
    },
};

const modalSubmitButtonStyle = {
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
};

export default RecruiterManageJobs;