import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import PaginationControls from "../components/PaginationControls";
import { FiSearch, FiFilter, FiX, FiClock, FiCheckCircle, FiAlertCircle, FiCalendar, FiBriefcase, FiMapPin, FiExternalLink, FiTrash2 } from "react-icons/fi";

const CandidateApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [withdrawingId, setWithdrawingId] = useState(null);
    const [error, setError] = useState("");

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        jobType: "",
    });

    // Test modal states
    const [showTestModal, setShowTestModal] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [testLocked, setTestLocked] = useState({});
    const [currentTime, setCurrentTime] = useState(new Date());

    const navigate = useNavigate();

    // Pagination state
    const [page, setPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get("applications/");
                setApplications(res.data);
                setPage(1);

                // Check which tests were already started
                const locked = {};
                res.data.forEach((app) => {
                    const key = `test_timer_${app.id}`;
                    const stored = localStorage.getItem(key);
                    if (stored) {
                        locked[app.id] = true;
                    }
                });
                setTestLocked(locked);
            } catch (err) {
                console.error("Error loading applications:", err);
                setError("Could not load your applications. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    // Update current time every second while modal is open
    useEffect(() => {
        if (!showTestModal) return;
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, [showTestModal]);

    // Block copy/paste/cut and keyboard shortcuts
    const handleBlockClipboard = (e) => {
        e.preventDefault();
    };

    const handleBlockShortcuts = (e) => {
        if ((e.ctrlKey || e.metaKey) &&
            ["c", "v", "x", "a"].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    };

    // Filter applications
    const filteredApplications = applications.filter(app => {
        const matchesSearch = filters.search === "" || 
            (app.job?.title?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
            (app.job?.company_name?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
            (app.cover_letter?.toLowerCase() || "").includes(filters.search.toLowerCase());
        
        const matchesStatus = filters.status === "" || 
            (app.status?.toLowerCase() || "") === filters.status.toLowerCase();
        
        const matchesJobType = filters.jobType === "" || 
            (app.job?.job_type?.toLowerCase() || "") === filters.jobType.toLowerCase();
        
        return matchesSearch && matchesStatus && matchesJobType;
    });

    // Active filter count
    const activeFilterCount = Object.values(filters).filter(v => v.trim()).length;

    // Status pill styling
    const renderStatusPill = (statusRaw) => {
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

    const handleWithdraw = async (applicationId) => {
        const confirmWithdraw = window.confirm(
            "Are you sure you want to withdraw this application? This action cannot be undone."
        );
        if (!confirmWithdraw) return;

        try {
            setWithdrawingId(applicationId);
            await axiosClient.delete(`applications/${applicationId}/`);

            setApplications((prev) =>
                prev.filter((app) => app.id !== applicationId)
            );

            setPage((prevPage) => {
                const remaining = applications.length - 1;
                const newTotalPages =
                    Math.ceil(remaining / ITEMS_PER_PAGE) || 1;
                return Math.min(prevPage, newTotalPages);
            });
        } catch (err) {
            console.error(
                "Error withdrawing application:",
                err.response?.data || err
            );
            alert("Could not withdraw application. Please try again.");
        } finally {
            setWithdrawingId(null);
        }
    };

    // When user clicks "Take Test" -> open popup
    const handleTakeTest = (applicationId) => {
        if (testLocked[applicationId]) return;
        setSelectedApplicationId(applicationId);
        setShowTestModal(true);
    };

    // Close popup without starting test
    const handleCloseTestModal = () => {
        setShowTestModal(false);
        setSelectedApplicationId(null);
    };

    // Start test: set 30 min limit + navigate + lock test
    const handleConfirmStartTest = () => {
        if (!selectedApplicationId) return;

        const expiresAt = Date.now() + 30 * 60 * 1000;

        try {
            localStorage.setItem(
                `test_timer_${selectedApplicationId}`,
                JSON.stringify({
                    applicationId: selectedApplicationId,
                    expiresAt,
                })
            );

            setTestLocked((prev) => ({
                ...prev,
                [selectedApplicationId]: true,
            }));
        } catch (e) {
            console.error("Failed to save test timer", e);
        }

        setShowTestModal(false);
        navigate(`/candidate/test/${selectedApplicationId}`);
    };

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
        setPage(1);
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const currentApplications = filteredApplications.slice(
        startIndex,
        startIndex + ITEMS_PER_PAGE
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
                            <span style={{ color: '#4f46e5' }}>My</span>
                            <span style={{ color: '#7c3aed' }}> Applications</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Track <span style={highlightTextStyle}>{applications.length}</span> job applications
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>⚡ Take tests to boost your chances</span>
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
                            placeholder="Search applications by job title, company, or cover letter..."
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

                {/* Advanced Filters */}
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
                        <div style={statIconStyle("#dbeafe", "#1d4ed8")}>
                            💼
                        </div>
                        <div>
                            <div style={statNumberStyle}>
                                {applications.filter(app => app.status === 'interview').length}
                            </div>
                            <div style={statLabelStyle}>Interview</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#d1fae5", "#059669")}>
                            ✅
                        </div>
                        <div>
                            <div style={statNumberStyle}>
                                {applications.filter(app => app.test?.completed_at).length}
                            </div>
                            <div style={statLabelStyle}>Tests Completed</div>
                        </div>
                    </div>
                </div>

                {/* Results Header */}
                <div style={resultsHeaderStyle}>
                    <div style={resultsInfoStyle}>
                        <span style={resultsCountStyle}>
                            Showing <span style={highlightNumberStyle}>{Math.min(startIndex + 1, filteredApplications.length)}-{Math.min(startIndex + currentApplications.length, filteredApplications.length)}</span> of <span style={highlightNumberStyle}>{filteredApplications.length}</span> applications
                        </span>
                        {activeFilterCount > 0 && (
                            <div style={activeFiltersChipStyle}>
                                <span>{activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''}</span>
                                <button 
                                    style={clearChipButtonStyle}
                                    onClick={handleClear}
                                >
                                    <FiX size={12} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div style={loadingContainerStyle}>
                        <div style={loadingSpinnerStyle}></div>
                        <p style={loadingTextStyle}>
                            <span style={{ color: '#4f46e5' }}>Loading</span> your applications...
                        </p>
                        <div style={loadingDotsStyle}>
                            <span style={{ animationDelay: '0s' }}>.</span>
                            <span style={{ animationDelay: '0.2s' }}>.</span>
                            <span style={{ animationDelay: '0.4s' }}>.</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div style={errorContainerStyle}>
                        <div style={errorIconStyle}>⚠️</div>
                        <h4 style={errorTitleStyle}>Oops! Something went wrong</h4>
                        <p style={errorTextStyle}>{error}</p>
                        <button 
                            style={errorRetryButtonStyle}
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Applications List */}
                {!loading && !error && (
                    <div style={scrollableContentStyle}>
                        {filteredApplications.length === 0 ? (
                            <div style={emptyStateStyle}>
                                <div style={emptyIconStyle}>📁</div>
                                <h3 style={emptyTitleStyle}>No applications found</h3>
                                <p style={emptyMessageStyle}>
                                    {activeFilterCount > 0 
                                        ? "Try adjusting your filters or search terms"
                                        : "You haven't applied to any jobs yet. Browse jobs and apply to get started."}
                                </p>
                                {activeFilterCount > 0 && (
                                    <button 
                                        style={emptyActionButtonStyle}
                                        onClick={handleClear}
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div style={applicationsGridStyle}>
                                    {currentApplications.map((app, index) => {
                                        const isLocked = !!testLocked[app.id];
                                        const isDisabled = !app.test || app.test.completed_at || isLocked;

                                        return (
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
                                                        <div style={applicationDateStyle}>
                                                            <FiCalendar size={12} style={{ marginRight: 4 }} />
                                                            Applied on {app.applied_at
                                                                ? new Date(app.applied_at).toLocaleDateString()
                                                                : "-"}
                                                        </div>
                                                    </div>
                                                    {renderStatusPill(app.status)}
                                                </div>

                                                {app.cover_letter && (
                                                    <div style={coverLetterStyle}>
                                                        <strong style={coverLetterLabelStyle}>Cover Letter:</strong>
                                                        <p style={coverLetterTextStyle}>
                                                            {app.cover_letter.length > 200 
                                                                ? `${app.cover_letter.substring(0, 200)}...` 
                                                                : app.cover_letter}
                                                        </p>
                                                    </div>
                                                )}

                                                <div style={applicationActionsStyle}>
                                                    <button
                                                        type="button"
                                                        disabled={isDisabled}
                                                        onClick={() => handleTakeTest(app.id)}
                                                        style={testButtonStyle(isDisabled)}
                                                    >
                                                        <FiClock size={14} style={{ marginRight: 6 }} />
                                                        {app.test?.completed_at
                                                            ? "Test Completed"
                                                            : isLocked
                                                                ? "Test Expired"
                                                                : "Take Test"}
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleWithdraw(app.id)}
                                                        disabled={withdrawingId === app.id}
                                                        style={withdrawButtonStyle}
                                                    >
                                                        <FiTrash2 size={14} style={{ marginRight: 6 }} />
                                                        {withdrawingId === app.id ? "Withdrawing..." : "Withdraw"}
                                                    </button>

                                                    {app.job && (
                                                        <button
                                                            type="button"
                                                            onClick={() => navigate(`/jobs/${app.job.id}`)}
                                                            style={viewJobButtonStyle}
                                                        >
                                                            <FiExternalLink size={14} style={{ marginRight: 6 }} />
                                                            View Job
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {filteredApplications.length > ITEMS_PER_PAGE && (
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
                )}
            </div>

            {/* Test Start Popup */}
            {showTestModal && (
                <div
                    style={modalOverlayStyle}
                >
                    <div
                        style={modalContentStyle}
                        tabIndex={0}
                        onCopy={handleBlockClipboard}
                        onPaste={handleBlockClipboard}
                        onCut={handleBlockClipboard}
                        onKeyDown={handleBlockShortcuts}
                    >
                        <h3 style={modalTitleStyle}>
                            <FiClock size={20} style={{ marginRight: 10, color: '#4f46e5' }} />
                            Starting the Test
                        </h3>

                        <div style={modalTimeInfoStyle}>
                            Current time: <strong>{currentTime.toLocaleTimeString()}</strong>
                        </div>

                        <div style={modalTimeLimitStyle}>
                            Test time limit: <strong>30:00 minutes</strong> from the moment you click <strong>Start Now</strong>.
                        </div>

                        <div style={modalWarningBoxStyle}>
                            <FiAlertCircle size={16} style={{ marginRight: 8, color: '#d97706' }} />
                            <div>
                                <strong>Important Guidelines:</strong>
                                <ul style={modalGuidelinesListStyle}>
                                    <li>Do not switch tabs or refresh the page</li>
                                    <li>Copy/paste functionality is disabled</li>
                                    <li>Timer starts immediately upon clicking "Start Now"</li>
                                    <li>Test will auto-submit when time expires</li>
                                </ul>
                            </div>
                        </div>

                        <div style={modalActionsStyle}>
                            <button
                                type="button"
                                onClick={handleCloseTestModal}
                                style={modalCancelButtonStyle}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmStartTest}
                                style={modalStartButtonStyle}
                            >
                                Start Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

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
    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
    color: "#92400e",
    fontSize: 11,
    fontWeight: 600,
    border: "1px solid rgba(251, 191, 36, 0.3)",
};

const trendingDotStyle = {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#f59e0b",
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

// Results Header
const resultsHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
    animation: "fadeIn 0.4s ease",
};

const resultsInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
};

const resultsCountStyle = {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
};

const highlightNumberStyle = {
    color: "#7c3aed",
    fontWeight: 700,
    background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
};

const activeFiltersChipStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 8,
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontSize: 12,
    fontWeight: 600,
    border: "1px solid rgba(139, 92, 246, 0.2)",
};

const clearChipButtonStyle = {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: "none",
    background: "rgba(139, 92, 246, 0.2)",
    color: "#7c3aed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 10,
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(139, 92, 246, 0.3)",
        transform: "scale(1.1)",
    },
};

// Loading State
const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    flex: 1,
};

const loadingSpinnerStyle = {
    width: 48,
    height: 48,
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
    marginBottom: 8,
};

const loadingDotsStyle = {
    display: "flex",
    gap: 2,
    "& span": {
        fontSize: 20,
        color: "#8b5cf6",
        animation: "pulse 1.5s infinite",
    },
};

// Error State
const errorContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #fff5f5, #fef2f2)",
    borderRadius: 14,
    border: "1px solid #fecaca",
    marginTop: 20,
    animation: "fadeIn 0.4s ease",
    flex: 1,
};

const errorIconStyle = {
    fontSize: 40,
    marginBottom: 16,
    color: "#ef4444",
};

const errorTitleStyle = {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
};

const errorTextStyle = {
    color: "#b91c1c",
    fontSize: 13,
    marginBottom: 20,
    textAlign: "center",
    maxWidth: 300,
};

const errorRetryButtonStyle = {
    padding: "10px 24px",
    borderRadius: 8,
    border: "1px solid #dc2626",
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    color: "#dc2626",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#fee2e2",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px rgba(220, 38, 38, 0.1)",
    },
};

// Scrollable Content
const scrollableContentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
};

// Applications Grid
const applicationsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(500px, 1fr))",
    gap: 20,
    paddingRight: 4,
    marginBottom: 24,
    animation: "fadeIn 0.5s ease",
};

// Application Card
const applicationCardStyle = {
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    padding: "20px",
    borderRadius: 14,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.2s ease",
    animation: "fadeIn 0.4s ease",
    animationFillMode: "both",
    ":hover": {
        borderColor: "#8b5cf6",
        transform: "translateY(-2px)",
        boxShadow: "0 12px 32px rgba(139, 92, 246, 0.15)",
    },
};

const applicationCardHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 16,
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
    fontSize: 16,
    color: "#111827",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 280,
};

const companyTagStyle = {
    fontSize: 12,
    color: "#6b7280",
    padding: "4px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    whiteSpace: "nowrap",
    fontWeight: 500,
};

const applicationMetaStyle = {
    display: "flex",
    gap: 16,
    marginBottom: 8,
};

const metaItemStyle = {
    display: "flex",
    alignItems: "center",
    fontSize: 13,
    color: "#6b7280",
};

const applicationDateStyle = {
    fontSize: 12,
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
};

// Status Pill
const statusPillStyle = (bg, color) => ({
    fontSize: "12px",
    padding: "6px 12px",
    borderRadius: "999px",
    background: bg,
    color: color,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "6px",
});

// Cover Letter
const coverLetterStyle = {
    marginBottom: 16,
    padding: "12px",
    background: "rgba(249, 250, 251, 0.8)",
    borderRadius: 8,
    border: "1px solid rgba(229, 231, 235, 0.6)",
};

const coverLetterLabelStyle = {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
    display: "block",
};

const coverLetterTextStyle = {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 1.5,
    margin: 0,
    fontStyle: "italic",
};

// Application Actions
const applicationActionsStyle = {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
};

const testButtonStyle = (isDisabled) => ({
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: isDisabled ? "#9ca3af" : "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "white",
    fontSize: 13,
    fontWeight: 600,
    cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease",
    opacity: isDisabled ? 0.7 : 1,
    ":hover": isDisabled ? {} : {
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.4)",
    },
});

const withdrawButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#ef4444",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#fee2e2",
        borderColor: "#fecaca",
        color: "#dc2626",
        transform: "translateY(-2px)",
    },
};

const viewJobButtonStyle = {
    display: "flex",
    alignItems: "center",
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #bfdbfe",
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#dbeafe",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
    },
};

// Empty State
const emptyStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #ffffff, #faf5ff)",
    borderRadius: 14,
    border: "1px dashed rgba(139, 92, 246, 0.4)",
    textAlign: "center",
    flex: 1,
    animation: "fadeIn 0.4s ease",
};

const emptyIconStyle = {
    fontSize: 56,
    marginBottom: 20,
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
    fontSize: 14,
    color: "#8b5cf6",
    marginBottom: 24,
    maxWidth: 300,
    lineHeight: 1.5,
    opacity: 0.8,
};

const emptyActionButtonStyle = {
    padding: "12px 28px",
    borderRadius: 8,
    border: "1px solid rgba(139, 92, 246, 0.4)",
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "rgba(139, 92, 246, 0.2)",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
    },
};

// Pagination
const paginationContainerStyle = {
    marginTop: "auto",
    paddingTop: 24,
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
    animation: "fadeIn 0.4s ease",
};

// Modal Styles
const modalOverlayStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(4px)",
    animation: "fadeIn 0.3s ease",
};

const modalContentStyle = {
    width: "100%",
    maxWidth: 460,
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    borderRadius: 20,
    boxShadow: "0 32px 96px rgba(15, 23, 42, 0.5)",
    border: "1px solid rgba(148, 163, 184, 0.3)",
    padding: "24px",
    animation: "fadeIn 0.4s ease",
};

const modalTitleStyle = {
    margin: 0,
    marginBottom: 16,
    fontSize: 20,
    fontWeight: 700,
    color: "#111827",
    display: "flex",
    alignItems: "center",
};

const modalTimeInfoStyle = {
    marginBottom: 8,
    fontSize: 13,
    color: "#6b7280",
    padding: "8px 12px",
    background: "#f3f4f6",
    borderRadius: 8,
};

const modalTimeLimitStyle = {
    marginBottom: 16,
    fontSize: 14,
    color: "#1d4ed8",
    padding: "8px 12px",
    background: "#eff6ff",
    borderRadius: 8,
    border: "1px solid #bfdbfe",
};

const modalWarningBoxStyle = {
    display: "flex",
    gap: 12,
    marginBottom: 24,
    padding: "16px",
    background: "#fef3c7",
    borderRadius: 12,
    border: "1px solid #fde68a",
};

const modalGuidelinesListStyle = {
    margin: "8px 0 0 0",
    paddingLeft: 20,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 1.6,
};

const modalActionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
};

const modalCancelButtonStyle = {
    padding: "10px 20px",
    fontSize: 14,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    color: "#4b5563",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        borderColor: "#d1d5db",
    },
};

const modalStartButtonStyle = {
    padding: "10px 24px",
    fontSize: 14,
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s ease",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 8px 24px rgba(79, 70, 229, 0.4)",
    },
};

export default CandidateApplications;