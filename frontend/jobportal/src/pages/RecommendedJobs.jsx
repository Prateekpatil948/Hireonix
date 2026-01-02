import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import JobCard from "../components/JobCard";
import PaginationControls from "../components/PaginationControls";
import { FiSearch, FiFilter, FiX, FiGrid, FiList, FiStar, FiTrendingUp, FiBriefcase, FiMapPin } from "react-icons/fi";

const RecommendedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    // Filter states
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

    useEffect(() => {
        const loadRecommended = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await axiosClient.get("jobs/recommended/");
                setJobs(res.data);
                setPage(1);
            } catch (err) {
                console.error(
                    "Error loading recommended jobs:",
                    err.response?.data || err
                );
                setError("Could not load recommended jobs. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadRecommended();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [viewMode]);

    // Filtered jobs
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = filters.search === "" || 
            (job.title?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
            (job.company_name?.toLowerCase() || "").includes(filters.search.toLowerCase()) ||
            (job.description?.toLowerCase() || "").includes(filters.search.toLowerCase());
        
        const matchesLocation = filters.location === "" || 
            (job.location?.toLowerCase() || "").includes(filters.location.toLowerCase());
        
        const matchesJobType = filters.jobType === "" || 
            (job.job_type?.toLowerCase() || "") === filters.jobType.toLowerCase();
        
        return matchesSearch && matchesLocation && matchesJobType;
    });

    // Active filter count
    const activeFilterCount = Object.values(filters).filter(v => v.trim()).length;

    // Handle filter changes
    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const handleClear = () => {
        setFilters({
            search: "",
            location: "",
            jobType: "",
        });
        setPage(1);
    };

    // Pagination calculations
    const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE) || 1;
    const startIndex = (page - 1) * JOBS_PER_PAGE;
    const currentJobs = filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);

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
                            <span style={{ color: '#4f46e5' }}>Recommended</span>
                            <span style={{ color: '#7c3aed' }}> Jobs</span>
                        </h1>
                        <div style={subtitleContainerStyle}>
                            <span style={subtitleStyle}>
                                Matched to your <span style={highlightTextStyle}>skills</span> and <span style={highlightTextStyle}>profile</span>
                            </span>
                            <div style={trendingChipStyle}>
                                <div style={trendingDotStyle}></div>
                                <span>✨ AI-Powered Matching</span>
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
                            placeholder="Search recommended jobs by title, company, or description..."
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
                            <FiMapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} />
                            <input
                                style={quickFilterInputStyle}
                                name="location"
                                value={filters.location}
                                onChange={handleChange}
                                placeholder="Location"
                            />
                        </div>
                        <div style={quickFilterItemStyle}>
                            <FiBriefcase size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} />
                            <input
                                style={quickFilterInputStyle}
                                name="jobType"
                                value={filters.jobType}
                                onChange={handleChange}
                                placeholder="Job type"
                            />
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
                            <FiStar size={24} />
                        </div>
                        <div>
                            <div style={statNumberStyle}>{jobs.length}</div>
                            <div style={statLabelStyle}>Total Recommendations</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#fef3c7", "#d97706")}>
                            <FiTrendingUp size={24} />
                        </div>
                        <div>
                            <div style={statNumberStyle}>AI</div>
                            <div style={statLabelStyle}>Personalized Matching</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#dbeafe", "#1d4ed8")}>
                            <FiBriefcase size={24} />
                        </div>
                        <div>
                            <div style={statNumberStyle}>
                                {new Set(jobs.map(job => job.job_type)).size}
                            </div>
                            <div style={statLabelStyle}>Job Types</div>
                        </div>
                    </div>
                    
                    <div style={statCardStyle}>
                        <div style={statIconStyle("#d1fae5", "#059669")}>
                            <FiMapPin size={24} />
                        </div>
                        <div>
                            <div style={statNumberStyle}>
                                {new Set(jobs.map(job => job.location)).size}
                            </div>
                            <div style={statLabelStyle}>Locations</div>
                        </div>
                    </div>
                </div>

                {/* Results Header */}
                <div style={resultsHeaderStyle}>
                    <div style={resultsInfoStyle}>
                        <span style={resultsCountStyle}>
                            Showing <span style={highlightNumberStyle}>{Math.min(startIndex + 1, filteredJobs.length)}-{Math.min(startIndex + currentJobs.length, filteredJobs.length)}</span> of <span style={highlightNumberStyle}>{filteredJobs.length}</span> recommendations
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
                {loading && (
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
                        <div style={loadingHintStyle}>
                            <FiTrendingUp size={14} style={{ marginRight: 8 }} />
                            <span>Analyzing your profile for best matches</span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div style={errorContainerStyle}>
                        <div style={errorIconStyle}>⚠️</div>
                        <h4 style={errorTitleStyle}>Unable to load recommendations</h4>
                        <p style={errorTextStyle}>{error}</p>
                        <div style={errorActionsStyle}>
                            <button 
                                style={errorRetryButtonStyle}
                                onClick={() => window.location.reload()}
                            >
                                Try Again
                            </button>
                            <button 
                                style={errorProfileButtonStyle}
                                onClick={() => window.location.href = '/candidate/profile'}
                            >
                                Update Profile
                            </button>
                        </div>
                    </div>
                )}

                {/* Jobs Grid/List */}
                {!loading && !error && (
                    <div style={scrollableContentStyle}>
                        {filteredJobs.length === 0 ? (
                            <div style={emptyStateStyle}>
                                <div style={emptyIconStyle}>🔍</div>
                                <h3 style={emptyTitleStyle}>No recommendations found</h3>
                                <p style={emptyMessageStyle}>
                                    {activeFilterCount > 0 
                                        ? "Try adjusting your filters or search terms"
                                        : "Update your profile with skills and experience to get personalized job recommendations."}
                                </p>
                                {activeFilterCount > 0 ? (
                                    <button 
                                        style={emptyActionButtonStyle}
                                        onClick={handleClear}
                                    >
                                        Clear All Filters
                                    </button>
                                ) : (
                                    <div style={emptyActionsStyle}>
                                        <button 
                                            style={emptyActionButtonStyle}
                                            onClick={() => window.location.href = '/candidate/profile'}
                                        >
                                            Update Profile
                                        </button>
                                        <button 
                                            style={emptySecondaryButtonStyle}
                                            onClick={() => window.location.href = '/jobs'}
                                        >
                                            Browse All Jobs
                                        </button>
                                    </div>
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
                                            <JobCard 
                                                job={job} 
                                                viewMode={viewMode}
                                                showRecommendationBadge={true}
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                {filteredJobs.length > JOBS_PER_PAGE && (
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
    position: "relative",
};

const quickFilterInputStyle = {
    width: "100%",
    padding: "12px 16px 12px 40px",
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
    "::placeholder": {
        color: "#a78bfa",
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

const viewOptionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(249, 250, 251, 0.8)",
    padding: "4px",
    borderRadius: 10,
    border: "1px solid rgba(226, 232, 240, 0.8)",
};

const viewLabelStyle = {
    fontSize: 12,
    color: "#9ca3af",
    marginRight: 4,
    marginLeft: 8,
};

const viewOptionButtonStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    background: isActive ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "transparent",
    color: isActive ? "#fff" : "#6b7280",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: isActive ? "0 2px 8px rgba(139, 92, 246, 0.4)" : "none",
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

const loadingHintStyle = {
    marginTop: 20,
    padding: "8px 16px",
    borderRadius: 8,
    background: "rgba(139, 92, 246, 0.1)",
    color: "#7c3aed",
    fontSize: 13,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
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

const errorActionsStyle = {
    display: "flex",
    gap: 12,
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

const errorProfileButtonStyle = {
    padding: "10px 24px",
    borderRadius: 8,
    border: "1px solid #4f46e5",
    background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
    color: "#4f46e5",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#e0e7ff",
        transform: "translateY(-1px)",
        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
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
    gap: 20,
    paddingRight: 4,
    marginBottom: 24,
    animation: "fadeIn 0.5s ease",
};

// List View
const jobsListStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 16,
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

const emptyActionsStyle = {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
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

const emptySecondaryButtonStyle = {
    padding: "12px 28px",
    borderRadius: 8,
    border: "1px solid rgba(148, 163, 184, 0.4)",
    background: "linear-gradient(135deg, rgba(249, 250, 251, 0.8), rgba(243, 244, 246, 0.9))",
    color: "#4b5563",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
        background: "#f3f4f6",
        transform: "translateY(-2px)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
};

// Pagination
const paginationContainerStyle = {
    marginTop: "auto",
    paddingTop: 24,
    borderTop: "1px solid rgba(226, 232, 240, 0.7)",
    animation: "fadeIn 0.4s ease",
};

export default RecommendedJobs;