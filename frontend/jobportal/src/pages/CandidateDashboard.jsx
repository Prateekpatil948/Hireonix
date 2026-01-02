// src/pages/CandidateDashboardV2.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/AuthContext";
import PaginationControls from "../components/PaginationControls";
import { FiSearch, FiFilter, FiX, FiClock, FiCheckCircle, FiAlertCircle, FiCalendar, FiBriefcase, FiMapPin } from "react-icons/fi";

export default function CandidateDashboardV2() {
    const { user, isAuthenticated, loadingUser } = useAuth();

    const [jobApplications, setJobApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);

    const [skillAssessments, setSkillAssessments] = useState([]);
    const [assessmentsLoading, setAssessmentsLoading] = useState(false);
    const [assessmentsError, setAssessmentsError] = useState("");

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        jobType: "",
    });

    // Pagination states
    const [applicationsPage, setApplicationsPage] = useState(1);
    const [assessmentsPage, setAssessmentsPage] = useState(1);
    const APPLICATIONS_PER_PAGE = 5;
    const ASSESSMENTS_PER_PAGE = 4;

    // ===== Fetch job applications =====
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchJobApplications = async () => {
            try {
                setApplicationsLoading(true);
                const res = await axiosClient.get("applications/");
                const data = Array.isArray(res.data)
                    ? res.data
                    : res.data.results || [];
                setJobApplications(data);
                setApplicationsPage(1);
            } catch (err) {
                console.error("Error fetching job applications:", err);
            } finally {
                setApplicationsLoading(false);
            }
        };

        fetchJobApplications();
    }, [isAuthenticated]);

    // ===== Fetch skill assessments =====
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchSkillAssessments = async () => {
    try {
        setAssessmentsLoading(true);
        setAssessmentsError("");

        // ✅ Correct endpoint
        const res = await axiosClient.get("applications/");
        const applications = Array.isArray(res.data)
            ? res.data
            : res.data.results || [];

        // ✅ Extract tests (Skill Assessments)
        const assessments = applications
            .filter(app => app.test) // only applications with tests
            .map(app => {
                const test = app.test;

                return {
                    id: test.id,
                    applicationId: app.id,
                    jobTitle: app.job?.title || "Job",
                    companyName: app.job?.company_name || "",
                    status: test.completed_at ? "completed" : "pending",
                    score: test.score,
                    passed: test.passed,
                    startedAt: test.started_at,
                    completedAt: test.completed_at,
                    duration: test.time_limit,
                    expiresAt: test.expires_at,
                };
            })
            // Optional: sort by expiry if exists
            .sort((a, b) => {
                const da = a.expiresAt ? new Date(a.expiresAt) : 0;
                const db = b.expiresAt ? new Date(b.expiresAt) : 0;
                return da - db;
            });

        setSkillAssessments(assessments);
    } catch (err) {
        console.error("Error fetching assessments:", err);
        setAssessmentsError(
            "Could not load skill assessments. Please try again."
        );
    } finally {
        setAssessmentsLoading(false);
    }
};


        fetchSkillAssessments();
    }, [isAuthenticated]);

    // Filtered applications
    const filteredApplications = jobApplications.filter(app => {
        const matchesSearch = filters.search === "" || 
            (app.job?.title?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
            (app.job?.company_name?.toLowerCase() || "").includes(filters.search.toLowerCase());
        
        const matchesStatus = filters.status === "" || 
            (app.status?.toLowerCase() || "") === filters.status.toLowerCase();
        
        const matchesJobType = filters.jobType === "" || 
            (app.job?.job_type?.toLowerCase() || "") === filters.jobType.toLowerCase();
        
        return matchesSearch && matchesStatus && matchesJobType;
    });

    // Filtered assessments
    const now = new Date();
    const upcomingAssessments = skillAssessments.filter((assessment) => {
        if (!assessment.due_date) return false;
        const d = new Date(assessment.due_date);
        return d >= now;
    });

    const completedAssessments = skillAssessments.filter((assessment) => {
        if (!assessment.due_date) return false;
        const d = new Date(assessment.due_date);
        return d < now;
    });

    // Pagination calculations
    const totalApplicationsPages = Math.ceil(
        (filteredApplications?.length || 0) / APPLICATIONS_PER_PAGE
    );
    const totalAssessmentsPages = Math.ceil(
        (upcomingAssessments?.length || 0) / ASSESSMENTS_PER_PAGE
    );

    const paginatedApplications = filteredApplications.slice(
        (applicationsPage - 1) * APPLICATIONS_PER_PAGE,
        applicationsPage * APPLICATIONS_PER_PAGE
    );

    const paginatedAssessments = upcomingAssessments.slice(
        (assessmentsPage - 1) * ASSESSMENTS_PER_PAGE,
        assessmentsPage * ASSESSMENTS_PER_PAGE
    );

    // Active filter count
    const activeFilterCount = Object.values(filters).filter(v => v.trim()).length;

    // Formatting functions
    const formatDateTime = (isoString) => {
        if (!isoString) return "No due date";
        const d = new Date(isoString);
        return d.toLocaleString();
    };

    const getAssessmentTitle = (assessment) =>
        assessment.test?.title ||
        assessment.assessment_name ||
        "Skill Assessment";

    const getJobForAssessment = (assessment) =>
        assessment.job?.title ||
        assessment.application?.job?.title ||
        assessment.related_job ||
        "";

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleClear = () => {
        setFilters({
            search: "",
            status: "",
            jobType: "",
        });
        setApplicationsPage(1);
        setAssessmentsPage(1);
    };

    // Status pill styling
    const renderApplicationStatusPill = (statusRaw) => {
        const status = (statusRaw || "applied").toLowerCase();
        let bg = "#e5e7eb";
        let text = "#374151";
        let label = status;
        let icon = null;

        if (status === "applied") {
            bg = "#eef2ff";
            text = "#4f46e5";
            label = "Applied";
            icon = "📋";
        } else if (status === "shortlisted") {
            bg = "#fef3c7";
            text = "#d97706";
            label = "Shortlisted";
            icon = "⭐";
        } else if (status === "selected") {
            bg = "#d1fae5";
            text = "#047857";
            label = "Selected";
            icon = "🎉";
        } else if (status === "rejected") {
            bg = "#fee2e2";
            text = "#dc2626";
            label = "Rejected";
            icon = "❌";
        } else if (status === "interview") {
            bg = "#dbeafe";
            text = "#1d4ed8";
            label = "Interview";
            icon = "💼";
        }

        return (
            <span style={statusPillStyle(bg, text)}>
                {icon} {label}
            </span>
        );
    };

    const assessmentStatusPillStyle = (isUpcoming) => ({
        fontSize: "11px",
        padding: "4px 12px",
        borderRadius: "20px",
        background: isUpcoming ? 
            "linear-gradient(135deg, #fef3c7, #fde68a)" : 
            "linear-gradient(135deg, #d1fae5, #a7f3d0)",
        color: isUpcoming ? "#92400e" : "#065f46",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        border: isUpcoming ? "1px solid rgba(251, 191, 36, 0.3)" : "1px solid rgba(16, 185, 129, 0.3)",
    });

    if (!isAuthenticated && !loadingUser) {
        return (
            <div style={pageContainerStyle}>
                <div style={contentContainerStyle}>
                    <div style={authRequiredStyle}>
                        <div style={authIconStyle}>🔐</div>
                        <h3 style={authTitleStyle}>Authentication Required</h3>
                        <p style={authMessageStyle}>
                            Please log in to view your personalized dashboard and track your applications.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={pageContainerStyle}>
            {/* CSS for animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>

            <div style={contentContainerStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div>
                        <h1 style={titleStyle}>
                            <span style={{ color: '#4f46e5' }}>My</span>
                            <span style={{ color: '#7c3aed' }}> Dashboard</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Tracking <span style={highlightTextStyle}>{jobApplications.length}</span> applications & 
                                <span style={highlightTextStyle}> {skillAssessments.length}</span> assessments
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>👋 Welcome back, {user?.username || "User"}!</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        style={filterToggleButtonStyle}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter size={16} />
                        <span>Filters</span>
                        {activeFilterCount > 0 && (
                            <span style={activeFilterBadgeStyle}>{activeFilterCount}</span>
                        )}
                    </button>
                </div>

                {/* Compact Search Bar */}
                <div style={compactSearchBarStyle}>
                    <div style={searchInputWrapperStyle}>
                        <FiSearch size={18} style={searchIconStyle} />
                        <input
                            style={compactSearchInputStyle}
                            name="search"
                            value={filters.search}
                            onChange={handleChange}
                            placeholder="Search applications by job title or company..."
                        />
                        {filters.search && (
                            <button 
                                type="button"
                                style={clearSearchButtonStyle}
                                onClick={() => setFilters({...filters, search: ""})}
                            >
                                <FiX size={14} />
                            </button>
                        )}
                    </div>
                    
                    <div style={quickFiltersStyle}>
                        <div style={quickFilterItemStyle}>
                            <select
                                style={quickFilterSelectStyle}
                                name="status"
                                value={filters.status}
                                onChange={handleChange}
                            >
                                <option value="">All Status</option>
                                <option value="applied">Applied</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="interview">Interview</option>
                                <option value="selected">Selected</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div style={quickFilterItemStyle}>
                            <select
                                style={quickFilterSelectStyle}
                                name="jobType"
                                value={filters.jobType}
                                onChange={handleChange}
                            >
                                <option value="">All Job Types</option>
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="contract">Contract</option>
                                <option value="internship">Internship</option>
                                <option value="remote">Remote</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters (Collapsible) */}
                {showFilters && (
                    <div style={advancedFiltersStyle}>
                        <div style={advancedFiltersHeaderStyle}>
                            <h3 style={advancedFiltersTitleStyle}>
                                <FiFilter size={16} style={{ marginRight: 8 }} />
                                Application Filters
                            </h3>
                            <button 
                                style={closeFiltersButtonStyle}
                                onClick={() => setShowFilters(false)}
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        
                        <div style={advancedFiltersGridStyle}>
                            <div style={advancedFilterItemStyle}>
                                <label style={advancedFilterLabelStyle}>
                                    <span style={{ color: '#4f46e5' }}>🔍</span> Search
                                </label>
                                <input
                                    style={advancedFilterInputStyle}
                                    name="search"
                                    value={filters.search}
                                    onChange={handleChange}
                                    placeholder="Job title, company, keywords..."
                                />
                            </div>
                            
                            <div style={advancedFilterItemStyle}>
                                <label style={advancedFilterLabelStyle}>
                                    <span style={{ color: '#ef4444' }}>📊</span> Status
                                </label>
                                <select
                                    style={advancedFilterSelectStyle}
                                    name="status"
                                    value={filters.status}
                                    onChange={handleChange}
                                >
                                    <option value="">All Status</option>
                                    <option value="applied">Applied</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="interview">Interview</option>
                                    <option value="selected">Selected</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            
                            <div style={advancedFilterItemStyle}>
                                <label style={advancedFilterLabelStyle}>
                                    <span style={{ color: '#10b981' }}>💼</span> Job Type
                                </label>
                                <select
                                    style={advancedFilterSelectStyle}
                                    name="jobType"
                                    value={filters.jobType}
                                    onChange={handleChange}
                                >
                                    <option value="">All Job Types</option>
                                    <option value="full-time">Full-time</option>
                                    <option value="part-time">Part-time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                        </div>
                        
                        <div style={advancedFilterActionsStyle}>
                            <button
                                style={advancedClearButtonStyle}
                                type="button"
                                onClick={handleClear}
                            >
                                Clear All
                            </button>
                            <button 
                                style={advancedApplyButtonStyle} 
                                type="button"
                                onClick={() => setShowFilters(false)}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats Overview */}
                <div style={statsContainerStyle}>
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#eef2ff", "#4f46e5")}>
                            📋
                        </div>
                        <div>
                            <div style={statNumberStyle}>{jobApplications.length}</div>
                            <div style={statLabelStyle}>Total Applications</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#fef3c7", "#d97706")}>
                            ⭐
                        </div>
                        <div>
                            <div style={statNumberStyle}>
                                {jobApplications.filter(app => app.status === 'shortlisted').length}
                            </div>
                            <div style={statLabelStyle}>Shortlisted</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#fce7f3", "#db2777")}>
                            ⏰
                        </div>
                        <div>
                            <div style={statNumberStyle}>{upcomingAssessments.length}</div>
                            <div style={statLabelStyle}>Pending Assessments</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#d1fae5", "#059669")}>
                            ✅
                        </div>
                        <div>
                            <div style={statNumberStyle}>{completedAssessments.length}</div>
                            <div style={statLabelStyle}>Completed</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={gridContainerStyle}>
                    {/* Left Column - Applications */}
                    <div style={columnStyle}>
                        <div style={sectionHeaderStyle}>
                            <div>
                                <h3 style={sectionTitleStyle}>
                                    <FiBriefcase size={18} style={{ marginRight: 8, color: '#4f46e5' }} />
                                    Job Applications
                                </h3>
                                <p style={sectionSubtitleStyle}>
                                    Track your application progress and status updates
                                </p>
                            </div>
                            {filteredApplications.length > 0 && (
                                <span style={sectionCountStyle}>
                                    {filteredApplications.length}
                                </span>
                            )}
                        </div>

                        {/* Loading State */}
                        {applicationsLoading ? (
                            <div style={loadingContainerStyle}>
                                <div style={loadingSpinnerStyle}></div>
                                <p style={loadingTextStyle}>
                                    Loading your applications...
                                </p>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div style={emptyStateStyle}>
                                <div style={emptyIconStyle}>📁</div>
                                <h4 style={emptyTitleStyle}>No applications found</h4>
                                <p style={emptyMessageStyle}>
                                    {activeFilterCount > 0 
                                        ? "Try adjusting your filters"
                                        : "You haven't applied to any jobs yet."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={applicationsListStyle}>
                                    {paginatedApplications.map((application, index) => (
                                        <div 
                                            key={application.id} 
                                            style={{
                                                ...applicationCardStyle,
                                                animationDelay: `${index * 0.05}s`,
                                            }}
                                        >
                                            <div style={applicationCardHeaderStyle}>
                                                <div style={applicationTitleSectionStyle}>
                                                    <div style={applicationTitleRowStyle}>
                                                        <span style={applicationTitleStyle}>
                                                            {application.job?.title || "Untitled Position"}
                                                        </span>
                                                        {application.job?.company_name && (
                                                            <span style={companyTagStyle}>
                                                                {application.job.company_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={applicationMetaStyle}>
                                                        {application.job?.location && (
                                                            <span style={metaItemStyle}>
                                                                <FiMapPin size={12} style={{ marginRight: 4 }} />
                                                                {application.job.location}
                                                            </span>
                                                        )}
                                                        {application.job?.job_type && (
                                                            <span style={metaItemStyle}>
                                                                <FiBriefcase size={12} style={{ marginRight: 4 }} />
                                                                {application.job.job_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={applicationDateStyle}>
                                                        <FiCalendar size={12} style={{ marginRight: 4 }} />
                                                        Applied on {application.applied_at
                                                            ? new Date(application.applied_at).toLocaleDateString()
                                                            : "-"}
                                                    </div>
                                                </div>
                                                {renderApplicationStatusPill(application.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {filteredApplications.length > APPLICATIONS_PER_PAGE && (
                                    <div style={paginationContainerStyle}>
                                        <PaginationControls
                                            page={applicationsPage}
                                            totalPages={totalApplicationsPages}
                                            onPageChange={setApplicationsPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Right Column - Assessments */}
                    <div style={columnStyle}>
                        <div style={sectionHeaderStyle}>
                            <div>
                                <h3 style={sectionTitleStyle}>
                                    <FiClock size={18} style={{ marginRight: 8, color: '#10b981' }} />
                                    Skill Assessments
                                </h3>
                                <p style={sectionSubtitleStyle}>
                                    Complete your pending assessments on time
                                </p>
                            </div>
                            {upcomingAssessments.length > 0 && (
                                <span style={sectionCountStyle}>
                                    {upcomingAssessments.length}
                                </span>
                            )}
                        </div>

                        {/* Loading State */}
                        {assessmentsLoading ? (
                            <div style={loadingContainerStyle}>
                                <div style={loadingSpinnerStyle}></div>
                                <p style={loadingTextStyle}>
                                    Loading assessments...
                                </p>
                            </div>
                        ) : assessmentsError ? (
                            <div style={errorStateStyle}>
                                <FiAlertCircle size={24} style={{ color: '#ef4444', marginBottom: 12 }} />
                                <p style={errorTextStyle}>{assessmentsError}</p>
                            </div>
                        ) : (
                            <>
                                {/* Upcoming Assessments */}
                                {upcomingAssessments.length > 0 && (
                                    <div style={assessmentSectionStyle}>
                                        <h4 style={subsectionTitleStyle}>
                                            <span style={{ color: '#d97706' }}>⏰</span> Upcoming
                                        </h4>
                                        <div style={assessmentsListStyle}>
                                            {paginatedAssessments.map((assessment, index) => (
                                                <div 
                                                    key={assessment.id} 
                                                    style={{
                                                        ...assessmentCardStyle,
                                                        animationDelay: `${index * 0.05}s`,
                                                    }}
                                                >
                                                    <div style={assessmentCardHeaderStyle}>
                                                        <div style={assessmentTitleSectionStyle}>
                                                            <div style={assessmentTitleRowStyle}>
                                                                <span style={assessmentTitleStyle}>
                                                                    {getAssessmentTitle(assessment)}
                                                                </span>
                                                                {getJobForAssessment(assessment) && (
                                                                    <span style={assessmentJobTagStyle}>
                                                                        {getJobForAssessment(assessment)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={assessmentDueStyle}>
                                                                <FiCalendar size={12} style={{ marginRight: 4 }} />
                                                                Due: {formatDateTime(assessment.due_date)}
                                                            </div>
                                                        </div>
                                                        <div style={assessmentStatusPillStyle(true)}>
                                                            <FiClock size={12} />
                                                            Pending
                                                        </div>
                                                    </div>
                                                    <div style={assessmentDetailsStyle}>
                                                        {assessment.type && (
                                                            <div style={assessmentDetailRowStyle}>
                                                                <strong>Type:</strong> {assessment.type}
                                                            </div>
                                                        )}
                                                        {assessment.duration && (
                                                            <div style={assessmentDetailRowStyle}>
                                                                <strong>Duration:</strong> {assessment.duration} mins
                                                            </div>
                                                        )}
                                                        {assessment.link && (
                                                            <div style={assessmentDetailRowStyle}>
                                                                <strong>Link:</strong>{" "}
                                                                <a 
                                                                    href={assessment.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    style={assessmentLinkStyle}
                                                                >
                                                                    Start Assessment
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {upcomingAssessments.length > ASSESSMENTS_PER_PAGE && (
                                            <div style={paginationContainerStyle}>
                                                <PaginationControls
                                                    page={assessmentsPage}
                                                    totalPages={totalAssessmentsPages}
                                                    onPageChange={setAssessmentsPage}
                                                    size="small"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Completed Assessments */}
                                {completedAssessments.length > 0 && (
                                    <div style={assessmentSectionStyle}>
                                        <h4 style={subsectionTitleStyle}>
                                            <span style={{ color: '#059669' }}>✅</span> Completed
                                        </h4>
                                        <div style={assessmentsListStyle}>
                                            {completedAssessments.slice(0, 3).map((assessment, index) => (
                                                <div 
                                                    key={assessment.id} 
                                                    style={{
                                                        ...assessmentCardStyle,
                                                        animationDelay: `${index * 0.05}s`,
                                                    }}
                                                >
                                                    <div style={assessmentCardHeaderStyle}>
                                                        <div style={assessmentTitleSectionStyle}>
                                                            <div style={assessmentTitleRowStyle}>
                                                                <span style={assessmentTitleStyle}>
                                                                    {getAssessmentTitle(assessment)}
                                                                </span>
                                                                {getJobForAssessment(assessment) && (
                                                                    <span style={assessmentJobTagStyle}>
                                                                        {getJobForAssessment(assessment)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={assessmentDueStyle}>
                                                                <FiCheckCircle size={12} style={{ marginRight: 4, color: '#059669' }} />
                                                                Completed on {formatDateTime(assessment.due_date)}
                                                            </div>
                                                        </div>
                                                        <div style={assessmentStatusPillStyle(false)}>
                                                            <FiCheckCircle size={12} />
                                                            Completed
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Assessments State */}
                                {upcomingAssessments.length === 0 && completedAssessments.length === 0 && (
                                    <div style={emptyStateStyle}>
                                        <div style={emptyIconStyle}>📝</div>
                                        <h4 style={emptyTitleStyle}>No assessments</h4>
                                        <p style={emptyMessageStyle}>
                                            You don't have any pending or completed assessments.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- ENHANCED STYLES (Matching JobsList) ---------- */

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
    animation: "slideIn 0.5s ease",
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

const highlightTextStyle = {
    color: "#4f46e5",
    fontWeight: 700,
    background: "linear-gradient(135deg, #4f46e5, #a855f7)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
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

const filterToggleButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderRadius: 10,
    border: "1px solid rgba(209, 213, 219, 0.7)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    ":hover": {
        borderColor: "#4f46e5",
        color: "#4f46e5",
        transform: "translateY(-2px)",
        boxShadow: "0 6px 16px rgba(79, 70, 229, 0.15)",
    },
};

const activeFilterBadgeStyle = {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
    boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)",
};

const compactSearchBarStyle = {
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    padding: 20,
    borderRadius: 14,
    marginBottom: 24,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.1)",
    animation: "fadeIn 0.4s ease",
};

const searchInputWrapperStyle = {
    position: "relative",
    marginBottom: 16,
};

const searchIconStyle = {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#8b5cf6",
};

const compactSearchInputStyle = {
    width: "100%",
    padding: "14px 52px 14px 44px",
    borderRadius: 10,
    border: "1px solid rgba(139, 92, 246, 0.3)",
    fontSize: 14,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.9)",
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.15)",
    },
    "::placeholder": {
        color: "#a78bfa",
    },
};

const clearSearchButtonStyle = {
    position: "absolute",
    right: 8,
    top: "50%",
    transform: "translateY(-50%)",
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: "rgba(209, 213, 219, 0.2)",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(209, 213, 219, 0.3)",
        color: "#374151",
    },
};

const quickFiltersStyle = {
    display: "flex",
    gap: 12,
};

const quickFilterItemStyle = {
    flex: 1,
};

const quickFilterSelectStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.6)",
    fontSize: 13,
    color: "#374151",
    background: "rgba(249, 250, 251, 0.8)",
    transition: "all 0.2s ease",
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        background: "#fff",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
    },
};

// Advanced Filters
const advancedFiltersStyle = {
    background: "linear-gradient(135deg, #ffffff, #faf5ff)",
    padding: 20,
    borderRadius: 14,
    marginBottom: 24,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 12px 40px rgba(139, 92, 246, 0.15)",
    animation: "fadeIn 0.3s ease",
    borderTop: "3px solid #8b5cf6",
};

const advancedFiltersHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
};

const advancedFiltersTitleStyle = {
    fontSize: 15,
    fontWeight: 700,
    color: "#7c3aed",
    margin: 0,
    display: "flex",
    alignItems: "center",
};

const closeFiltersButtonStyle = {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "1px solid rgba(229, 231, 235, 0.8)",
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

const advancedFiltersGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 20,
};

const advancedFilterItemStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const advancedFilterLabelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#7c3aed",
    letterSpacing: "0.03em",
    display: "flex",
    alignItems: "center",
    gap: 6,
};

const advancedFilterInputStyle = {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid rgba(139, 92, 246, 0.3)",
    fontSize: 13,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.9)",
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.15)",
    },
};

const advancedFilterSelectStyle = {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid rgba(139, 92, 246, 0.3)",
    fontSize: 13,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.9)",
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.15)",
    },
};

const advancedFilterActionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
};

const advancedClearButtonStyle = {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#6b7280",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f9fafb",
        borderColor: "#d1d5db",
        color: "#ef4444",
        transform: "translateY(-1px)",
    },
};

const advancedApplyButtonStyle = {
    padding: "10px 24px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(139, 92, 246, 0.6)",
    },
};

// Stats Container
const statsContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    marginBottom: 24,
    animation: "fadeIn 0.4s ease",
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
    width: 48,
    height: 48,
    borderRadius: 12,
    background: bgColor,
    color: color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
});

const statNumberStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    lineHeight: 1,
    marginBottom: 2,
};

const statLabelStyle = {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 500,
};

// Grid Container
const gridContainerStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    flex: 1,
    minHeight: 0,
};

const columnStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
};

const sectionHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
};

const sectionTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    display: "flex",
    alignItems: "center",
};

const sectionSubtitleStyle = {
    fontSize: 12,
    color: "#6b7280",
    margin: "4px 0 0 0",
};

const sectionCountStyle = {
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    color: "#4b5563",
    fontWeight: 600,
};

// Applications List
const applicationsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    flex: 1,
    overflowY: "auto",
    paddingRight: 4,
};

const applicationCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: "16px",
    borderRadius: 12,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.2s ease",
    animation: "fadeIn 0.4s ease",
    animationFillMode: "both",
    ":hover": {
        borderColor: "#8b5cf6",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(139, 92, 246, 0.1)",
    },
};

const applicationCardHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
};

const applicationTitleSectionStyle = {
    flex: 1,
    minWidth: 0,
};

const applicationTitleRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    marginBottom: 8,
};

const applicationTitleStyle = {
    fontWeight: 600,
    fontSize: 15,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 200,
};

const companyTagStyle = {
    fontSize: 11,
    color: "#6b7280",
    padding: "3px 8px",
    borderRadius: 999,
    background: "#f3f4f6",
    whiteSpace: "nowrap",
};

const applicationMetaStyle = {
    display: "flex",
    gap: 12,
    marginBottom: 6,
};

const metaItemStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: 12,
    color: "#6b7280",
};

const applicationDateStyle = {
    fontSize: 11,
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
};

// Status Pill
const statusPillStyle = (bg, color) => ({
    fontSize: "11px",
    padding: "4px 10px",
    borderRadius: "999px",
    background: bg,
    color: color,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "4px",
});

// Assessments
const assessmentSectionStyle = {
    marginBottom: 20,
};

const subsectionTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    margin: "0 0 12px 0",
    display: "flex",
    alignItems: "center",
    gap: 6,
};

const assessmentsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 12,
};

const assessmentCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: "16px",
    borderRadius: 12,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.2s ease",
    animation: "fadeIn 0.4s ease",
    animationFillMode: "both",
    ":hover": {
        borderColor: "#10b981",
        transform: "translateY(-2px)",
        boxShadow: "0 8px 25px rgba(16, 185, 129, 0.1)",
    },
};

const assessmentCardHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 8,
};

const assessmentTitleSectionStyle = {
    flex: 1,
    minWidth: 0,
};

const assessmentTitleRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
    marginBottom: 6,
};

const assessmentTitleStyle = {
    fontWeight: 600,
    fontSize: 14,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 180,
};

const assessmentJobTagStyle = {
    fontSize: 10,
    color: "#6b7280",
    padding: "2px 6px",
    borderRadius: 999,
    background: "#f3f4f6",
    whiteSpace: "nowrap",
};

const assessmentDueStyle = {
    fontSize: 11,
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
};

const assessmentDetailsStyle = {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid rgba(226, 232, 240, 0.5)",
};

const assessmentDetailRowStyle = {
    marginBottom: 4,
};

const assessmentLinkStyle = {
    color: "#2563eb",
    textDecoration: "underline",
    fontWeight: 500,
    transition: "all 0.2s ease",
    ":hover": {
        color: "#1d4ed8",
    },
};

// Loading States
const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    flex: 1,
};

const loadingSpinnerStyle = {
    width: 40,
    height: 40,
    border: "3px solid rgba(139, 92, 246, 0.1)",
    borderTop: "3px solid #8b5cf6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 12,
};

const loadingTextStyle = {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
};

// Error States
const errorStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    borderRadius: 12,
    border: "1px solid #fecaca",
    flex: 1,
};

const errorTextStyle = {
    color: "#dc2626",
    fontSize: 13,
    textAlign: "center",
    maxWidth: 300,
};

// Empty States
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
    flex: 1,
};

const emptyIconStyle = {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.8,
    background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
};

const emptyTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#7c3aed",
    marginBottom: 4,
};

const emptyMessageStyle = {
    fontSize: 12,
    color: "#8b5cf6",
    marginBottom: 16,
    maxWidth: 200,
    lineHeight: 1.5,
    opacity: 0.8,
};

// Pagination
const paginationContainerStyle = {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
};

// Auth Required
const authRequiredStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    background: "linear-gradient(135deg, #ffffff, #faf5ff)",
    borderRadius: 20,
    border: "1px dashed rgba(139, 92, 246, 0.4)",
    textAlign: "center",
    animation: "fadeIn 0.4s ease",
};

const authIconStyle = {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.8,
};

const authTitleStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#7c3aed",
    marginBottom: 8,
};

const authMessageStyle = {
    fontSize: 13,
    color: "#8b5cf6",
    maxWidth: 300,
    lineHeight: 1.6,
    opacity: 0.8,
};