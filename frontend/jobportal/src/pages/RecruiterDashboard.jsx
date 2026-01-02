import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import PaginationControls from "../components/PaginationControls";
import RecruiterTestResult from "../components/RecruiterTestResult";
import { FiSearch, FiFilter, FiX, FiDownload, FiUser, FiCalendar, FiMapPin, FiBriefcase, FiClock, FiAlertCircle, FiCheckCircle, FiEye } from "react-icons/fi";

const RecruiterDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState({
        search: "",
        job: "",
        status: "",
    });

    const [activeProfile, setActiveProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);
    const [interviews, setInterviews] = useState([]);
    const [interviewsLoading, setInterviewsLoading] = useState(false);

    // Modal state
    const [interviewModalApp, setInterviewModalApp] = useState(null);
    const [interviewForm, setInterviewForm] = useState({
        date: "",
        time: "",
        mode: "online",
        location: "",
        notes: "",
    });

    // Test performance modal state
    const [performanceModalAppId, setPerformanceModalAppId] = useState(null);

    // Pagination for applications
    const [page, setPage] = useState(1);
    const APPS_PER_PAGE = 5;

    const [showFilters, setShowFilters] = useState(false);
    const activeFilterCount = Object.values(filters).filter(v => v.trim()).length;

    const fetchApplications = async () => {
        setLoading(true);
        setError("");

        try {
            const params = {};

            if (filters.search.trim()) params.search = filters.search.trim();
            if (filters.job.trim()) params.job = filters.job.trim();
            if (filters.status.trim()) params.status = filters.status.trim();

            const res = await axiosClient.get("recruiter/applications/", { params });
            setApplications(res.data);
            setPage(1);
        } catch (err) {
            console.error("Error loading applications:", err.response?.data || err);
            setError("Could not load applications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleApplyFilters = (e) => {
        e.preventDefault();
        fetchApplications();
    };

    const handleClearFilters = () => {
        setFilters({
            search: "",
            job: "",
            status: "",
        });
        setShowFilters(false);
        fetchApplications();
    };

    const renderStatusPill = (status) => {
        const statusMap = {
            applied: { bg: "#eef2ff", color: "#4f46e5", icon: "📋", label: "Applied" },
            shortlisted: { bg: "#fef3c7", color: "#d97706", icon: "⭐", label: "Shortlisted" },
            selected: { bg: "#d1fae5", color: "#047857", icon: "🎉", label: "Selected" },
            rejected: { bg: "#fee2e2", color: "#dc2626", icon: "❌", label: "Rejected" },
            interview: { bg: "#dbeafe", color: "#1d4ed8", icon: "💼", label: "Interview" },
        };

        const config = statusMap[status?.toLowerCase()] || statusMap.applied;

        return (
            <span style={statusPillStyle(config.bg, config.color)}>
                {config.icon} {config.label}
            </span>
        );
    };

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await axiosClient.patch(`applications/${applicationId}/`, {
                status: newStatus,
            });

            setApplications((prev) =>
                prev.map((app) =>
                    app.id === applicationId ? { ...app, status: newStatus } : app
                )
            );

            if (activeProfile && activeProfile.application_id === applicationId) {
                setActiveProfile({ ...activeProfile, status: newStatus });
            }
        } catch (err) {
            console.error("Error updating status:", err.response?.data || err);
            alert("Could not update application status.");
        }
    };

    const handleDownloadResume = async (applicationId) => {
        if (!applicationId) {
            alert("Cannot download resume right now.");
            return;
        }

        try {
            const response = await axiosClient.get(
                `applications/${applicationId}/download-resume/`,
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            const contentDisposition = response.headers["content-disposition"];
            let fileName = "resume.pdf";
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match && match[1]) {
                    fileName = match[1];
                }
            }

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading resume:", err.response?.data || err);
            alert(
                "Could not download resume. Maybe the candidate has not uploaded it yet."
            );
        }
    };

    const fetchInterviews = async (applicationId) => {
        if (!applicationId) return;

        setInterviewsLoading(true);
        try {
            const res = await axiosClient.get(
                `applications/${applicationId}/interviews/`
            );
            setInterviews(res.data || []);
        } catch (err) {
            console.error("Error loading interviews:", err.response?.data || err);
        } finally {
            setInterviewsLoading(false);
        }
    };

    const openScheduleInterview = async (app) => {
        if (!app) return;

        setInterviewModalApp(app);
        setInterviewForm({
            date: "",
            time: "",
            mode: "online",
            location: "",
            notes: "",
        });
        setInterviews([]);
        fetchInterviews(app.id);
    };

    const closeScheduleInterview = () => {
        setInterviewModalApp(null);
    };

    const handleInterviewInputChange = (e) => {
        const { name, value } = e.target;
        setInterviewForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateInterview = async (e) => {
        e.preventDefault();

        if (!interviewModalApp) {
            alert("No application selected.");
            return;
        }

        const { date, time, mode, location, notes } = interviewForm;

        if (!date || !time) {
            alert("Please choose both date and time.");
            return;
        }

        const scheduled_at = `${date}T${time}`;

        try {
            const res = await axiosClient.post(
                `applications/${interviewModalApp.id}/interviews/`,
                {
                    scheduled_at,
                    mode,
                    location,
                    notes,
                }
            );

            setInterviews((prev) => [res.data, ...(prev || [])]);

            setInterviewForm({
                date: "",
                time: "",
                mode: "online",
                location: "",
                notes: "",
            });
        } catch (err) {
            console.error("Error scheduling interview:", err.response?.data || err);
            alert("Could not schedule interview. Please try again.");
        }
    };

    const openCandidateProfile = async (application) => {
        const candidateId =
            application.candidate ||
            application.candidate_id ||
            application.candidate_profile;

        if (!candidateId) {
            alert("Candidate information is missing on this application.");
            return;
        }

        setProfileLoading(true);
        setActiveProfile(null);
        setInterviews([]);

        try {
            const res = await axiosClient.get(
                `recruiter/candidates/${candidateId}/`
            );
            setActiveProfile({
                ...res.data,
                jobTitle: application.job?.title,
                companyName: application.job?.company_name,
                status: application.status,
                application_id: application.id,
            });

            fetchInterviews(application.id);
        } catch (err) {
            console.error("Error loading candidate profile:", err.response?.data || err);
            alert("Could not load candidate profile.");
        } finally {
            setProfileLoading(false);
        }
    };

    // Pagination calculations for applications
    const totalPages = Math.ceil(applications.length / APPS_PER_PAGE) || 1;
    const startIndex = (page - 1) * APPS_PER_PAGE;
    const currentApplications = applications.slice(
        startIndex,
        startIndex + APPS_PER_PAGE
    );

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
                            <span style={{ color: '#4f46e5' }}>Recruiter</span>
                            <span style={{ color: '#7c3aed' }}> Dashboard</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Managing <span style={highlightTextStyle}>{applications.length}</span> applications & 
                                <span style={highlightTextStyle}> {interviews.length}</span> interviews
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>👋 Welcome to your hiring dashboard!</span>
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
                            onChange={handleFilterChange}
                            placeholder="Search candidates by name or email..."
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
                                name="job"
                                value={filters.job}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Jobs</option>
                                {Array.from(new Set(applications.map(app => app.job?.title).filter(Boolean))).map(title => (
                                    <option key={title} value={title}>{title}</option>
                                ))}
                            </select>
                        </div>
                        <div style={quickFilterItemStyle}>
                            <select
                                style={quickFilterSelectStyle}
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All Status</option>
                                <option value="applied">Applied</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="selected">Selected</option>
                                <option value="rejected">Rejected</option>
                                <option value="interview">Interview</option>
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
                                Advanced Filters
                            </h3>
                            <button 
                                style={closeFiltersButtonStyle}
                                onClick={() => setShowFilters(false)}
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleApplyFilters} style={advancedFiltersGridStyle}>
                            <div style={advancedFilterItemStyle}>
                                <label style={advancedFilterLabelStyle}>
                                    <span style={{ color: '#4f46e5' }}>🔍</span> Search
                                </label>
                                <input
                                    style={advancedFilterInputStyle}
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Candidate name, email, keywords..."
                                />
                            </div>
                            
                            <div style={advancedFilterItemStyle}>
                                <label style={advancedFilterLabelStyle}>
                                    <span style={{ color: '#10b981' }}>💼</span> Job Title
                                </label>
                                <input
                                    style={advancedFilterInputStyle}
                                    name="job"
                                    value={filters.job}
                                    onChange={handleFilterChange}
                                    placeholder="e.g. React Developer"
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
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Status</option>
                                    <option value="applied">Applied</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="interview">Interview</option>
                                    <option value="selected">Selected</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </form>
                        
                        <div style={advancedFilterActionsStyle}>
                            <button
                                style={advancedClearButtonStyle}
                                type="button"
                                onClick={handleClearFilters}
                            >
                                Clear All
                            </button>
                            <button 
                                style={advancedApplyButtonStyle} 
                                type="submit"
                                onClick={handleApplyFilters}
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
                            <div style={statNumberStyle}>{applications.length}</div>
                            <div style={statLabelStyle}>Total Applications</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#fef3c7", "#d97706")}>
                            ⭐
                        </div>
                        <div>
                            <div style={statNumberStyle}>
                                {applications.filter(app => app.status === 'shortlisted').length}
                            </div>
                            <div style={statLabelStyle}>Shortlisted</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#fce7f3", "#db2777")}>
                            💼
                        </div>
                        <div>
                            <div style={statNumberStyle}>
                                {applications.filter(app => app.status === 'interview').length}
                            </div>
                            <div style={statLabelStyle}>Interviews</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#d1fae5", "#059669")}>
                            ✅
                        </div>
                        <div>
                            <div style={statNumberStyle}>
                                {applications.filter(app => app.status === 'selected').length}
                            </div>
                            <div style={statLabelStyle}>Selected</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={gridContainerStyle}>
                    {/* Left Column - Applications List */}
                    <div style={columnStyle}>
                        <div style={sectionHeaderStyle}>
                            <div>
                                <h3 style={sectionTitleStyle}>
                                    <FiBriefcase size={18} style={{ marginRight: 8, color: '#4f46e5' }} />
                                    Applications
                                </h3>
                                <p style={sectionSubtitleStyle}>
                                    Review and manage candidate applications
                                </p>
                            </div>
                            {applications.length > 0 && (
                                <span style={sectionCountStyle}>
                                    {applications.length}
                                </span>
                            )}
                        </div>

                        {/* Loading State */}
                        {loading ? (
                            <div style={loadingContainerStyle}>
                                <div style={loadingSpinnerStyle}></div>
                                <p style={loadingTextStyle}>
                                    Loading applications...
                                </p>
                            </div>
                        ) : error ? (
                            <div style={errorStateStyle}>
                                <FiAlertCircle size={24} style={{ color: '#ef4444', marginBottom: 12 }} />
                                <p style={errorTextStyle}>{error}</p>
                            </div>
                        ) : applications.length === 0 ? (
                            <div style={emptyStateStyle}>
                                <div style={emptyIconStyle}>📁</div>
                                <h4 style={emptyTitleStyle}>No applications found</h4>
                                <p style={emptyMessageStyle}>
                                    {activeFilterCount > 0 
                                        ? "Try adjusting your filters"
                                        : "No applications have been submitted yet."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div style={applicationsListStyle}>
                                    {currentApplications.map((app, index) => (
                                        <div 
                                            key={app.id} 
                                            style={{
                                                ...applicationCardStyle,
                                                animationDelay: `${index * 0.05}s`,
                                            }}
                                        >
                                            <div style={applicationCardHeaderStyle}>
                                                <div style={applicationTitleSectionStyle}>
                                                    <div style={applicationTitleRowStyle}>
                                                        <span style={applicationTitleStyle}>
                                                            {app.job?.title || "Untitled Position"}
                                                        </span>
                                                        {app.job?.company_name && (
                                                            <span style={companyTagStyle}>
                                                                {app.job.company_name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={applicationMetaStyle}>
                                                        {app.job?.location && (
                                                            <span style={metaItemStyle}>
                                                                <FiMapPin size={12} style={{ marginRight: 4 }} />
                                                                {app.job.location}
                                                            </span>
                                                        )}
                                                        {app.job?.job_type && (
                                                            <span style={metaItemStyle}>
                                                                <FiBriefcase size={12} style={{ marginRight: 4 }} />
                                                                {app.job.job_type}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={applicationMetaStyle}>
                                                        <span style={metaItemStyle}>
                                                            <FiUser size={12} style={{ marginRight: 4 }} />
                                                            {app.candidate_username || "Unknown Candidate"}
                                                        </span>
                                                        <span style={metaItemStyle}>
                                                            <FiCalendar size={12} style={{ marginRight: 4 }} />
                                                            {new Date(app.applied_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={statusAndActionsStyle}>
                                                    {renderStatusPill(app.status)}
                                                    <div style={actionButtonsStyle}>
                                                        <button
                                                            type="button"
                                                            style={actionButtonStyle}
                                                            onClick={() => openCandidateProfile(app)}
                                                        >
                                                            <FiEye size={14} />
                                                            <span>View</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            style={actionButtonStyle}
                                                            onClick={() => handleDownloadResume(app.id)}
                                                        >
                                                            <FiDownload size={14} />
                                                            <span>Resume</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            style={actionButtonStyle}
                                                            onClick={() => openScheduleInterview(app)}
                                                        >
                                                            <FiCalendar size={14} />
                                                            <span>Interview</span>
                                                        </button>
                                                    </div>
                                                    <select
                                                        style={statusSelectStyle}
                                                        value={app.status}
                                                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                                                    >
                                                        <option value="applied">Applied</option>
                                                        <option value="shortlisted">Shortlisted</option>
                                                        <option value="interview">Interview</option>
                                                        <option value="selected">Selected</option>
                                                        <option value="rejected">Rejected</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {applications.length > APPS_PER_PAGE && (
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

                    {/* Right Column - Candidate Profile */}
                    <div style={columnStyle}>
                        <div style={sectionHeaderStyle}>
                            <div>
                                <h3 style={sectionTitleStyle}>
                                    <FiUser size={18} style={{ marginRight: 8, color: '#10b981' }} />
                                    Candidate Profile
                                </h3>
                                <p style={sectionSubtitleStyle}>
                                    Quick view of the selected applicant
                                </p>
                            </div>
                        </div>

                        {/* Profile Loading */}
                        {profileLoading ? (
                            <div style={loadingContainerStyle}>
                                <div style={loadingSpinnerStyle}></div>
                                <p style={loadingTextStyle}>
                                    Loading candidate profile...
                                </p>
                            </div>
                        ) : !activeProfile ? (
                            <div style={emptyStateStyle}>
                                <div style={emptyIconStyle}>👤</div>
                                <h4 style={emptyTitleStyle}>No candidate selected</h4>
                                <p style={emptyMessageStyle}>
                                    Select an application and click "View" to see candidate details.
                                </p>
                            </div>
                        ) : (
                            <div style={profileCardStyle}>
                                <div style={profileHeaderStyle}>
                                    <div style={profileTitleSectionStyle}>
                                        <div style={profileNameStyle}>
                                            {activeProfile.user?.username || activeProfile.username || "Unknown Candidate"}
                                        </div>
                                        <div style={profileMetaStyle}>
                                            {activeProfile.jobTitle && (
                                                <span style={profileMetaItemStyle}>
                                                    <FiBriefcase size={12} />
                                                    {activeProfile.jobTitle}
                                                </span>
                                            )}
                                            {activeProfile.companyName && (
                                                <span style={profileMetaItemStyle}>
                                                    @ {activeProfile.companyName}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {activeProfile.status && (
                                        <div style={profileStatusStyle}>
                                            {renderStatusPill(activeProfile.status)}
                                        </div>
                                    )}
                                </div>

                                <div style={profileDetailsStyle}>
                                    <div style={profileDetailSectionStyle}>
                                        <h4 style={subsectionTitleStyle}>
                                            <span style={{ color: '#4f46e5' }}>📊</span> Experience & Skills
                                        </h4>
                                        <div style={detailCardStyle}>
                                            <div style={detailRowStyle}>
                                                <strong>Experience:</strong> {activeProfile.experience || 0} year(s)
                                            </div>
                                            <div style={detailRowStyle}>
                                                <strong>Skills:</strong> {activeProfile.skills?.trim() ? activeProfile.skills : "Not specified"}
                                            </div>
                                            {activeProfile.bio?.trim() && (
                                                <div style={detailRowStyle}>
                                                    <strong>Bio:</strong> <span style={{ fontSize: 12 }}>{activeProfile.bio}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={profileDetailSectionStyle}>
                                        <h4 style={subsectionTitleStyle}>
                                            <span style={{ color: '#10b981' }}>📄</span> Resume
                                        </h4>
                                        <div style={detailCardStyle}>
                                            {activeProfile.resume ? (
                                                <button
                                                    type="button"
                                                    style={downloadResumeButtonStyle}
                                                    onClick={() => handleDownloadResume(activeProfile.application_id)}
                                                >
                                                    <FiDownload size={16} />
                                                    <span>Download Resume</span>
                                                </button>
                                            ) : (
                                                <div style={noResumeStyle}>
                                                    <FiAlertCircle size={14} style={{ marginRight: 6 }} />
                                                    No resume uploaded
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Test Performance Section */}
                                    {activeProfile.application_id && (
                                        <div style={profileDetailSectionStyle}>
                                            <h4 style={subsectionTitleStyle}>
                                                <span style={{ color: '#d97706' }}>📊</span> Test Performance
                                            </h4>
                                            <div style={performanceCardStyle}>
                                                <div style={performanceInfoStyle}>
                                                    <div style={performanceScoreStyle}>
                                                        {activeProfile.test_score != null 
                                                            ? `${activeProfile.test_score}${activeProfile.test_total ? ` / ${activeProfile.test_total}` : ''}`
                                                            : activeProfile.test_percentage != null
                                                                ? `${activeProfile.test_percentage}%`
                                                                : "View detailed results"
                                                        }
                                                    </div>
                                                    <div style={performanceLabelStyle}>
                                                        MCQ Test Score
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    style={performanceButtonStyle}
                                                    onClick={() => setPerformanceModalAppId(activeProfile.application_id)}
                                                >
                                                    See Performance
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Interviews Section */}
                                    <div style={profileDetailSectionStyle}>
                                        <h4 style={subsectionTitleStyle}>
                                            <span style={{ color: '#db2777' }}>📅</span> Interviews
                                        </h4>
                                        <div style={interviewsListStyle}>
                                            {interviewsLoading ? (
                                                <div style={loadingSmallStyle}>
                                                    <div style={loadingSpinnerSmallStyle}></div>
                                                    <span>Loading interviews...</span>
                                                </div>
                                            ) : interviews.length === 0 ? (
                                                <div style={noInterviewsStyle}>
                                                    <FiCalendar size={14} style={{ marginRight: 6 }} />
                                                    No interviews scheduled
                                                </div>
                                            ) : (
                                                interviews.slice(0, 3).map((iv, index) => (
                                                    <div key={iv.id} style={interviewItemStyle}>
                                                        <div style={interviewHeaderStyle}>
                                                            <span style={interviewDateStyle}>
                                                                {iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : "No time"}
                                                            </span>
                                                            <span style={interviewModeStyle(iv.mode)}>
                                                                {iv.mode || "online"}
                                                            </span>
                                                        </div>
                                                        {iv.location && (
                                                            <div style={interviewLocationStyle}>
                                                                <FiMapPin size={12} style={{ marginRight: 4 }} />
                                                                {iv.location}
                                                            </div>
                                                        )}
                                                        {iv.notes && (
                                                            <div style={interviewNotesStyle}>
                                                                <FiBriefcase size={12} style={{ marginRight: 4 }} />
                                                                {iv.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Schedule Interview Modal */}
            {interviewModalApp && (
                <div style={modalOverlayStyle}>
                    <div style={modalCardStyle}>
                        <div style={modalHeaderStyle}>
                            <div>
                                <h3 style={modalTitleStyle}>
                                    <span style={modalIconStyle}>📅</span>
                                    Schedule Interview
                                </h3>
                                <p style={modalSubtitleStyle}>
                                    {interviewModalApp.job?.title || "Job"} • {interviewModalApp.candidate_username || "Candidate"}
                                </p>
                            </div>
                            <button style={modalCloseButtonStyle} onClick={closeScheduleInterview}>
                                <FiX size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateInterview} style={interviewFormStyle}>
                            <div style={formGridStyle}>
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        style={formInputStyle}
                                        value={interviewForm.date}
                                        onChange={handleInterviewInputChange}
                                        required
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>Time</label>
                                    <input
                                        type="time"
                                        name="time"
                                        style={formInputStyle}
                                        value={interviewForm.time}
                                        onChange={handleInterviewInputChange}
                                        required
                                    />
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>Mode</label>
                                    <select
                                        name="mode"
                                        style={formInputStyle}
                                        value={interviewForm.mode}
                                        onChange={handleInterviewInputChange}
                                    >
                                        <option value="online">Online</option>
                                        <option value="onsite">Onsite</option>
                                        <option value="phone">Phone</option>
                                    </select>
                                </div>
                                <div style={formGroupStyle}>
                                    <label style={formLabelStyle}>Location/Link</label>
                                    <input
                                        name="location"
                                        style={formInputStyle}
                                        placeholder="Meeting link or address"
                                        value={interviewForm.location}
                                        onChange={handleInterviewInputChange}
                                    />
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={formLabelStyle}>Notes</label>
                                    <textarea
                                        name="notes"
                                        style={formTextareaStyle}
                                        placeholder="Optional notes for the candidate"
                                        value={interviewForm.notes}
                                        onChange={handleInterviewInputChange}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div style={modalActionsStyle}>
                                <button
                                    type="button"
                                    style={modalCancelButtonStyle}
                                    onClick={closeScheduleInterview}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={modalSubmitButtonStyle}
                                >
                                    Schedule Interview
                                </button>
                            </div>
                        </form>

                        {/* Interviews List */}
                        <div style={interviewsModalSectionStyle}>
                            <h4 style={subsectionTitleStyle}>
                                <FiCalendar size={14} style={{ marginRight: 8 }} />
                                Upcoming Interviews ({interviews.length})
                            </h4>
                            {interviewsLoading ? (
                                <div style={loadingSmallStyle}>
                                    <div style={loadingSpinnerSmallStyle}></div>
                                    Loading...
                                </div>
                            ) : interviews.length === 0 ? (
                                <div style={noInterviewsModalStyle}>
                                    No interviews scheduled yet
                                </div>
                            ) : (
                                <div style={interviewsModalListStyle}>
                                    {interviews.map((iv) => (
                                        <div key={iv.id} style={interviewModalItemStyle}>
                                            <div style={interviewModalHeaderStyle}>
                                                <span style={interviewModalDateStyle}>
                                                    {iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : "No time"}
                                                </span>
                                                <span style={interviewModalStatusStyle(iv.status)}>
                                                    {iv.status || "scheduled"}
                                                </span>
                                            </div>
                                            {iv.location && (
                                                <div style={interviewModalDetailStyle}>
                                                    <FiMapPin size={12} /> {iv.location}
                                                </div>
                                            )}
                                            {iv.notes && (
                                                <div style={interviewModalDetailStyle}>
                                                    <FiBriefcase size={12} /> {iv.notes}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Test Performance Modal */}
            {performanceModalAppId && (
                <div style={modalOverlayStyle}>
                    <div style={modalCardWideStyle}>
                        <div style={modalHeaderStyle}>
                            <div>
                                <h3 style={modalTitleStyle}>
                                    <span style={{...modalIconStyle, background: '#fee2e2'}}>📊</span>
                                    Test Performance
                                </h3>
                                <p style={modalSubtitleStyle}>
                                    Detailed MCQ test results for this application
                                </p>
                            </div>
                            <button 
                                style={modalCloseButtonStyle} 
                                onClick={() => setPerformanceModalAppId(null)}
                            >
                                <FiX size={18} />
                            </button>
                        </div>
                        <RecruiterTestResult applicationId={performanceModalAppId} />
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------- STYLES ---------- */

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
    flexWrap: "wrap",
};

const metaItemStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: 12,
    color: "#6b7280",
};

const statusAndActionsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
    minWidth: 180,
};

const actionButtonsStyle = {
    display: "flex",
    gap: 6,
};

const actionButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.7)",
    background: "#fff",
    color: "#374151",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        borderColor: "#8b5cf6",
        color: "#4f46e5",
    },
};

const statusSelectStyle = {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid rgba(209, 213, 219, 0.7)",
    fontSize: 11,
    color: "#374151",
    background: "#fff",
    minWidth: 120,
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.1)",
    },
};

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

const profileCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 12,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    padding: 16,
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
};

const profileHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
};

const profileTitleSectionStyle = {
    flex: 1,
};

const profileNameStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
};

const profileMetaStyle = {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap",
};

const profileMetaItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    color: "#6b7280",
    padding: "2px 8px",
    borderRadius: 999,
    background: "#f3f4f6",
};

const profileStatusStyle = {
    flexShrink: 0,
};

const profileDetailsStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
};

const profileDetailSectionStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const detailCardStyle = {
    background: "#f9fafb",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
};

const detailRowStyle = {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6,
    lineHeight: 1.5,
};

const downloadResumeButtonStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    borderRadius: 10,
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

const noResumeStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: 12,
    color: "#9ca3af",
    padding: "8px 12px",
    background: "#f9fafb",
    borderRadius: 8,
    border: "1px dashed #d1d5db",
};

const performanceCardStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    border: "1px solid rgba(251, 191, 36, 0.3)",
};

const performanceInfoStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 2,
};

const performanceScoreStyle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#92400e",
};

const performanceLabelStyle = {
    fontSize: 11,
    color: "#b45309",
};

const performanceButtonStyle = {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid rgba(146, 64, 14, 0.3)",
    background: "#fff",
    color: "#92400e",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#fef3c7",
        borderColor: "#92400e",
    },
};

const interviewsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const interviewItemStyle = {
    padding: 10,
    borderRadius: 10,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
};

const interviewHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
};

const interviewDateStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#111827",
};

const interviewModeStyle = (mode) => ({
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 999,
    background: mode === "online" ? "#eef2ff" : mode === "onsite" ? "#fef3c7" : "#f3f4f6",
    color: mode === "online" ? "#4f46e5" : mode === "onsite" ? "#d97706" : "#6b7280",
    textTransform: "uppercase",
    fontWeight: 600,
});

const interviewLocationStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
};

const interviewNotesStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: 11,
    color: "#4b5563",
    fontStyle: "italic",
};

const noInterviewsStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    fontSize: 12,
    color: "#9ca3af",
    background: "#f9fafb",
    borderRadius: 10,
    border: "1px dashed #d1d5db",
};

const loadingSmallStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    color: "#6b7280",
    fontSize: 12,
};

const loadingSpinnerSmallStyle = {
    width: 16,
    height: 16,
    border: "2px solid rgba(139, 92, 246, 0.1)",
    borderTop: "2px solid #8b5cf6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
};

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

const paginationContainerStyle = {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
};

const subsectionTitleStyle = {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: 6,
};

/* ---------- MODAL STYLES ---------- */

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
    maxWidth: 600,
    maxHeight: "85vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 25px 50px rgba(15, 23, 42, 0.3)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    animation: "fadeIn 0.3s ease",
};

const modalCardWideStyle = {
    ...modalCardStyle,
    maxWidth: 800,
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
    fontSize: 20,
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

const interviewFormStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
};

const formGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
};

const formGroupStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const formLabelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
};

const formInputStyle = {
    padding: "12px 16px",
    borderRadius: 10,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    fontSize: 14,
    color: "#111827",
    transition: "all 0.2s ease",
    background: "rgba(255, 255, 255, 0.9)",
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.15)",
    },
};

const formTextareaStyle = {
    ...formInputStyle,
    resize: "vertical",
    minHeight: 80,
    fontFamily: "inherit",
};

const modalActionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
};

const modalCancelButtonStyle = {
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f9fafb",
        borderColor: "#d1d5db",
        color: "#374151",
    },
};

const modalSubmitButtonStyle = {
    padding: "12px 28px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 12px 32px rgba(139, 92, 246, 0.6)",
    },
};

const interviewsModalSectionStyle = {
    marginTop: 24,
    paddingTop: 20,
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
};

const noInterviewsModalStyle = {
    padding: 20,
    textAlign: "center",
    fontSize: 13,
    color: "#9ca3af",
    background: "#f9fafb",
    borderRadius: 10,
    border: "1px dashed #d1d5db",
};

const interviewsModalListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 8,
};

const interviewModalItemStyle = {
    padding: 12,
    borderRadius: 10,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
};

const interviewModalHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
};

const interviewModalDateStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#111827",
};

const interviewModalStatusStyle = (status) => ({
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 999,
    background: status === "completed" ? "#d1fae5" : status === "cancelled" ? "#fee2e2" : "#fef3c7",
    color: status === "completed" ? "#047857" : status === "cancelled" ? "#dc2626" : "#d97706",
    textTransform: "uppercase",
    fontWeight: 600,
});

const interviewModalDetailStyle = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
};

export default RecruiterDashboard;