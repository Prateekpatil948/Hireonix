// src/pages/JobsList.jsx
import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import JobCard from "../components/JobCard";
import { getSavedJobs } from "../api/jobs";
import { useAuth } from "../context/AuthContext";
import PaginationControls from "../components/PaginationControls";
import { FiSearch, FiMapPin, FiBriefcase, FiFilter, FiX, FiGrid, FiList } from "react-icons/fi";

const JobsList = () => {
    const { isAuthenticated, user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

    const [filters, setFilters] = useState({
        search: "",
        location: "",
        jobType: "",
    });

    // Pagination
    const [page, setPage] = useState(1);
    const JOBS_PER_PAGE = viewMode === "grid" ? 6 : 8;

    const fetchJobs = async (opts = {}) => {
        const { withLoading = true } = opts;
        if (withLoading) setLoading(true);
        setError("");

        try {
            const params = {};

            if (filters.search.trim()) params.search = filters.search.trim();
            if (filters.location.trim()) params.location = filters.location.trim();
            if (filters.jobType.trim()) params.job_type = filters.jobType.trim();

            // 1) Get all jobs
            const jobsRes = await axiosClient.get("jobs/", { params });
            let jobsData = jobsRes.data;

            // 2) If candidate logged in, mark already-saved jobs
            const isCandidate = isAuthenticated && user?.role === "candidate";

            if (isCandidate) {
                const savedRes = await getSavedJobs();
                const savedJobIds = new Set(
                    savedRes.data
                        .map((item) => item.job?.id)
                        .filter((id) => id !== undefined && id !== null)
                );

                jobsData = jobsData.map((job) => ({
                    ...job,
                    is_saved: savedJobIds.has(job.id),
                }));
            }

            setJobs(jobsData);
            setPage(1); // reset to first page whenever jobs are re-fetched
        } catch (err) {
            console.error("Error loading jobs:", err.response?.data || err);
            setError("Could not load jobs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Reset to page 1 when view mode changes
        setPage(1);
    }, [viewMode]);

    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetchJobs();
        setShowFilters(false);
    };

    const handleClear = () => {
        setFilters({
            search: "",
            location: "",
            jobType: "",
        });
        setPage(1);
        fetchJobs({ withLoading: true });
        setShowFilters(false);
    };

    // Pagination calculations
    const totalPages = Math.ceil(jobs.length / JOBS_PER_PAGE) || 1;
    const startIndex = (page - 1) * JOBS_PER_PAGE;
    const currentJobs = jobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

    const activeFilterCount = Object.values(filters).filter(v => v.trim()).length;

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
                            <span style={{ color: '#4f46e5' }}>Job</span>
                            <span style={{ color: '#7c3aed' }}> Listings</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Discover <span style={highlightTextStyle}>{jobs.length}</span> opportunities
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>🔥 Trending today</span>
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
                <form onSubmit={handleSubmit} style={compactSearchBarStyle}>
                    <div style={searchInputWrapperStyle}>
                        <FiSearch size={18} style={searchIconStyle} />
                        <input
                            style={compactSearchInputStyle}
                            name="search"
                            value={filters.search}
                            onChange={handleChange}
                            placeholder="Job title, keywords, or company"
                        />
                        <button type="submit" style={compactSearchButtonStyle}>
                            <FiSearch size={16} />
                        </button>
                    </div>
                    
                    <div style={quickFiltersStyle}>
                        <div style={quickFilterItemStyle}>
                            <FiMapPin size={14} style={{ color: '#ef4444' }} />
                            <input
                                style={quickFilterInputStyle}
                                name="location"
                                value={filters.location}
                                onChange={handleChange}
                                placeholder="Location"
                            />
                        </div>
                        <div style={quickFilterItemStyle}>
                            <FiBriefcase size={14} style={{ color: '#10b981' }} />
                            <input
                                style={quickFilterInputStyle}
                                name="jobType"
                                value={filters.jobType}
                                onChange={handleChange}
                                placeholder="Job type"
                            />
                        </div>
                    </div>
                </form>

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
                        
                        <div style={advancedFiltersGridStyle}>
                            <div style={advancedFilterItemStyle}>
                                <label style={advancedFilterLabelStyle}>
                                    <span style={{ color: '#4f46e5' }}>🔍</span> Job Title
                                </label>
                                <input
                                    style={advancedFilterInputStyle}
                                    name="search"
                                    value={filters.search}
                                    onChange={handleChange}
                                    placeholder="React Developer, UX Designer..."
                                />
                            </div>
                            
                            <div style={advancedFilterItemStyle}>
                                <label style={advancedFilterLabelStyle}>
                                    <span style={{ color: '#ef4444' }}>📍</span> Location
                                </label>
                                <input
                                    style={advancedFilterInputStyle}
                                    name="location"
                                    value={filters.location}
                                    onChange={handleChange}
                                    placeholder="City, State, or Remote"
                                />
                            </div>
                            
                            <div style={advancedFilterItemStyle}>
                                <label style={advancedFilterLabelStyle}>
                                    <span style={{ color: '#10b981' }}>💼</span> Job Type
                                </label>
                                <input
                                    style={advancedFilterInputStyle}
                                    name="jobType"
                                    value={filters.jobType}
                                    onChange={handleChange}
                                    placeholder="Full-time, Contract, Internship"
                                />
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
                                onClick={handleSubmit}
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Results Header */}
                <div style={resultsHeaderStyle}>
                    <div style={resultsInfoStyle}>
                        <span style={resultsCountStyle}>
                            Showing <span style={highlightNumberStyle}>{Math.min(startIndex + 1, jobs.length)}-{Math.min(startIndex + currentJobs.length, jobs.length)}</span> of <span style={highlightNumberStyle}>{jobs.length}</span> jobs
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
                    
                    <div style={viewOptionsStyle}>
                        <span style={viewLabelStyle}>View:</span>
                        <button 
                            style={viewOptionButtonStyle(viewMode === "grid")}
                            onClick={() => setViewMode("grid")}
                        >
                            <FiGrid size={14} />
                            Grid
                        </button>
                        <button 
                            style={viewOptionButtonStyle(viewMode === "list")}
                            onClick={() => setViewMode("list")}
                        >
                            <FiList size={14} />
                            List
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && !error && (
                    <div style={loadingContainerStyle}>
                        <div style={loadingSpinnerStyle}></div>
                        <p style={loadingTextStyle}>
                            <span style={{ color: '#4f46e5' }}>Finding</span> your perfect matches...
                        </p>
                        <div style={loadingDotsStyle}>
                            <span style={{ animationDelay: '0s' }}>.</span>
                            <span style={{ animationDelay: '0.2s' }}>.</span>
                            <span style={{ animationDelay: '0.4s' }}>.</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div style={errorContainerStyle}>
                        <div style={errorIconStyle}>⚠️</div>
                        <h4 style={errorTitleStyle}>Oops! Something went wrong</h4>
                        <p style={errorTextStyle}>{error}</p>
                        <button 
                            style={errorRetryButtonStyle}
                            onClick={() => fetchJobs()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Jobs Grid/List */}
                {!loading && !error && (
                    <div style={scrollableContentStyle}>
                        {jobs.length === 0 ? (
                            <div style={emptyStateStyle}>
                                <div style={emptyIconStyle}>🔍</div>
                                <h3 style={emptyTitleStyle}>No jobs found</h3>
                                <p style={emptyMessageStyle}>
                                    {activeFilterCount > 0 
                                        ? "Try adjusting your filters or search terms"
                                        : "No jobs available at the moment. Check back soon!"}
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
                                <div style={viewMode === "grid" ? jobsGridStyle : jobsListStyle}>
                                    {currentJobs.map((job, index) => (
                                        <div 
                                            key={job.id} 
                                            style={{
                                                ...jobCardWrapperStyle,
                                                animationDelay: `${index * 0.05}s`,
                                                ...(viewMode === "list" && jobCardListWrapperStyle)
                                            }}
                                        >
                                            <JobCard job={job} viewMode={viewMode} />
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Pagination */}
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
                )}
            </div>
        </div>
    );
};

/* ---------- UPDATED STYLES FOR NAVBAR & SIDEBAR LAYOUT ---------- */

const pageContainerStyle = {
    position: "fixed",
    top: 60, // Navbar height
    left: 280, // Sidebar width (updated to match new sidebar)
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
    borderRadius: 12,
    border: "1px solid rgba(209, 213, 219, 0.7)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#374151",
    fontSize: 14,
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
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    boxShadow: "0 2px 6px rgba(239, 68, 68, 0.3)",
};

const compactSearchBarStyle = {
    background: "linear-gradient(135deg, #ffffff, #f8fafc)",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 8px 32px rgba(99, 102, 241, 0.08)",
    animation: "fadeIn 0.4s ease",
};

const searchInputWrapperStyle = {
    position: "relative",
    marginBottom: 20,
};

const searchIconStyle = {
    position: "absolute",
    left: 18,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#8b5cf6",
    opacity: 0.8,
};

const compactSearchInputStyle = {
    width: "100%",
    padding: "16px 60px 16px 52px",
    borderRadius: 12,
    border: "1px solid rgba(139, 92, 246, 0.25)",
    fontSize: 15,
    color: "#111827",
    transition: "all 0.3s ease",
    background: "rgba(255, 255, 255, 0.9)",
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 4px rgba(139, 92, 246, 0.15)",
        background: "#fff",
    },
    "::placeholder": {
        color: "#a78bfa",
        opacity: 0.8,
    },
};

const compactSearchButtonStyle = {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 14px rgba(139, 92, 246, 0.4)",
    ":hover": {
        transform: "translateY(-50%) scale(1.05)",
        boxShadow: "0 8px 20px rgba(139, 92, 246, 0.6)",
    },
};

const quickFiltersStyle = {
    display: "flex",
    gap: 16,
    alignItems: "center",
};

const quickFilterItemStyle = {
    flex: 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
};

const quickFilterInputStyle = {
    width: "100%",
    padding: "14px 20px 14px 44px",
    borderRadius: 10,
    border: "1px solid rgba(209, 213, 219, 0.6)",
    fontSize: 14,
    color: "#374151",
    background: "rgba(249, 250, 251, 0.8)",
    transition: "all 0.2s ease",
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        background: "#fff",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
    },
    "::placeholder": {
        color: "#a78bfa",
        opacity: 0.8,
    },
};

// Advanced Filters
const advancedFiltersStyle = {
    background: "linear-gradient(135deg, #ffffff, #faf5ff)",
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 12px 40px rgba(139, 92, 246, 0.12)",
    animation: "fadeIn 0.3s ease",
    borderTop: "3px solid #8b5cf6",
};

const advancedFiltersHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
};

const advancedFiltersTitleStyle = {
    fontSize: 16,
    fontWeight: 700,
    color: "#7c3aed",
    margin: 0,
    display: "flex",
    alignItems: "center",
};

const closeFiltersButtonStyle = {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(229, 231, 235, 0.8)",
    background: "linear-gradient(135deg, #f9fafb, #f3f4f6)",
    color: "#8b5cf6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
        background: "#f3f4f6",
        color: "#7c3aed",
        transform: "rotate(90deg)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    },
};

const advancedFiltersGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    marginBottom: 24,
};

const advancedFilterItemStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
};

const advancedFilterLabelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#7c3aed",
    letterSpacing: "0.03em",
    display: "flex",
    alignItems: "center",
    gap: 8,
};

const advancedFilterInputStyle = {
    padding: "14px 18px",
    borderRadius: 10,
    border: "1px solid rgba(139, 92, 246, 0.25)",
    fontSize: 14,
    color: "#111827",
    transition: "all 0.3s ease",
    background: "rgba(255, 255, 255, 0.9)",
    ":focus": {
        outline: "none",
        borderColor: "#8b5cf6",
        boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.15)",
        background: "#fff",
    },
    "::placeholder": {
        color: "#a78bfa",
        opacity: 0.7,
    },
};

const advancedFilterActionsStyle = {
    display: "flex",
    justifyContent: "flex-end",
    gap: 16,
    paddingTop: 16,
    borderTop: "1px solid rgba(226, 232, 240, 0.6)",
};

const advancedClearButtonStyle = {
    padding: "12px 24px",
    borderRadius: 10,
    border: "1px solid rgba(209, 213, 219, 0.8)",
    background: "linear-gradient(135deg, #ffffff, #f9fafb)",
    color: "#6b7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
        background: "#f9fafb",
        borderColor: "#d1d5db",
        color: "#ef4444",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(209, 213, 219, 0.3)",
    },
};

const advancedApplyButtonStyle = {
    padding: "12px 28px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 6px 20px rgba(139, 92, 246, 0.4)",
    ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 10px 28px rgba(139, 92, 246, 0.6)",
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    },
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
    flexWrap: "wrap",
    gap: 12,
};

const resultsInfoStyle = {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap",
};

const resultsCountStyle = {
    fontSize: 14,
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
    gap: 8,
    padding: "8px 14px",
    borderRadius: 10,
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontSize: 13,
    fontWeight: 600,
    border: "1px solid rgba(139, 92, 246, 0.25)",
    boxShadow: "0 2px 8px rgba(139, 92, 246, 0.1)",
};

const clearChipButtonStyle = {
    width: 18,
    height: 18,
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

const viewOptionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(249, 250, 251, 0.8)",
    padding: "6px",
    borderRadius: 12,
    border: "1px solid rgba(226, 232, 240, 0.8)",
};

const viewLabelStyle = {
    fontSize: 13,
    color: "#9ca3af",
    marginRight: 6,
    marginLeft: 10,
};

const viewOptionButtonStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 18px",
    borderRadius: 10,
    border: "none",
    background: isActive ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "transparent",
    color: isActive ? "#fff" : "#6b7280",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: isActive ? "0 4px 12px rgba(139, 92, 246, 0.4)" : "none",
    ":hover": {
        background: isActive ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(209, 213, 219, 0.2)",
        transform: "translateY(-1px)",
    },
});

// Loading State
const loadingContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    flex: 1,
    minHeight: 400,
};

const loadingSpinnerStyle = {
    width: 52,
    height: 52,
    border: "3px solid rgba(139, 92, 246, 0.1)",
    borderTop: "3px solid #8b5cf6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginBottom: 20,
};

const loadingTextStyle = {
    fontSize: 15,
    color: "#6b7280",
    fontWeight: 500,
    marginBottom: 12,
};

const loadingDotsStyle = {
    display: "flex",
    gap: 4,
    "& span": {
        fontSize: 24,
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
    borderRadius: 16,
    border: "1px solid #fecaca",
    marginTop: 20,
    animation: "fadeIn 0.4s ease",
    minHeight: 300,
};

const errorIconStyle = {
    fontSize: 48,
    marginBottom: 20,
    color: "#ef4444",
    opacity: 0.8,
};

const errorTitleStyle = {
    color: "#dc2626",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
};

const errorTextStyle = {
    color: "#b91c1c",
    fontSize: 14,
    marginBottom: 24,
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 1.5,
};

const errorRetryButtonStyle = {
    padding: "12px 28px",
    borderRadius: 10,
    border: "1px solid #dc2626",
    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
    color: "#dc2626",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
        background: "#fee2e2",
        transform: "translateY(-2px)",
        boxShadow: "0 6px 16px rgba(220, 38, 38, 0.1)",
    },
};

// Scrollable Content
const scrollableContentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
};

// Grid View
const jobsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    gap: 24,
    paddingRight: 4,
    marginBottom: 24,
    animation: "fadeIn 0.5s ease",
};

// List View
const jobsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    paddingRight: 4,
    marginBottom: 24,
    animation: "fadeIn 0.5s ease",
};

const jobCardWrapperStyle = {
    animation: "fadeIn 0.4s ease",
    animationFillMode: "both",
};

const jobCardListWrapperStyle = {
    width: "100%",
};

// Empty State
const emptyStateStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    background: "linear-gradient(135deg, #ffffff, #faf5ff)",
    borderRadius: 16,
    border: "1px dashed rgba(139, 92, 246, 0.4)",
    textAlign: "center",
    flex: 1,
    animation: "fadeIn 0.4s ease",
    minHeight: 400,
};

const emptyIconStyle = {
    fontSize: 64,
    marginBottom: 24,
    opacity: 0.8,
    background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
};

const emptyTitleStyle = {
    fontSize: 20,
    fontWeight: 700,
    color: "#7c3aed",
    marginBottom: 12,
};

const emptyMessageStyle = {
    fontSize: 15,
    color: "#8b5cf6",
    marginBottom: 28,
    maxWidth: 320,
    lineHeight: 1.5,
    opacity: 0.8,
};

const emptyActionButtonStyle = {
    padding: "14px 32px",
    borderRadius: 10,
    border: "1px solid rgba(139, 92, 246, 0.4)",
    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.15))",
    color: "#7c3aed",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s ease",
    ":hover": {
        background: "rgba(139, 92, 246, 0.2)",
        transform: "translateY(-2px)",
        boxShadow: "0 6px 16px rgba(139, 92, 246, 0.2)",
    },
};

// Pagination
const paginationContainerStyle = {
    marginTop: "auto",
    paddingTop: 24,
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
    animation: "fadeIn 0.4s ease",
};

export default JobsList;        