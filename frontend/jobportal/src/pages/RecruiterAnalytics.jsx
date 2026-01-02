import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { 
  FiBriefcase, FiTrendingUp, FiUsers, FiCalendar, 
  FiBarChart2, FiPieChart, FiFilter, FiRefreshCw,
  FiCheckCircle, FiClock, FiXCircle, FiEye
} from "react-icons/fi";

const RecruiterAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosClient.get("recruiter/analytics/", {
        params: { timeframe: timeRange }
      });
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={loadingContainerStyle}>
        <div style={loadingSpinnerStyle}></div>
        <p style={loadingTextStyle}>
          Loading analytics dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorStateStyle}>
        <div style={errorIconStyle}>⚠️</div>
        <h4 style={errorTitleStyle}>Unable to Load Analytics</h4>
        <p style={errorMessageStyle}>{error}</p>
        <button 
          style={retryButtonStyle}
          onClick={fetchStats}
        >
          <FiRefreshCw size={14} style={{ marginRight: 6 }} />
          Try Again
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={emptyStateStyle}>
        <div style={emptyIconStyle}>📊</div>
        <h4 style={emptyTitleStyle}>No Analytics Data Available</h4>
        <p style={emptyMessageStyle}>
          Start posting jobs to see analytics and metrics.
        </p>
      </div>
    );
  }

  const {
    total_jobs = 0,
    active_jobs = 0,
    total_applications = 0,
    applications_today = 0,
    applications_last_7_days = 0,
    applications_last_30_days = 0,
    applications_by_status = {},
    applications_per_job = [],
    top_performing_jobs = [],
    conversion_rate = 0,
    avg_response_time = 0
  } = stats;

  // Calculate status percentages
  const statusData = [
    { status: "applied", count: applications_by_status.applied || 0, color: "#4f46e5", icon: "📋" },
    { status: "shortlisted", count: applications_by_status.shortlisted || 0, color: "#d97706", icon: "⭐" },
    { status: "interview", count: applications_by_status.interview || 0, color: "#2563eb", icon: "💼" },
    { status: "selected", count: applications_by_status.selected || 0, color: "#059669", icon: "🎉" },
    { status: "rejected", count: applications_by_status.rejected || 0, color: "#dc2626", icon: "❌" },
  ];

  const totalStatusCount = statusData.reduce((sum, item) => sum + item.count, 0);

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
      `}</style>

      <div style={contentContainerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>
              <span style={{ color: '#4f46e5' }}>Recruiter</span>
              <span style={{ color: '#7c3aed' }}> Analytics</span>
            </h1>
            <div style={subtitleContainerStyle}>
              <span style={subtitleStyle}>
                Tracking <span style={highlightTextStyle}>{total_jobs}</span> jobs & 
                <span style={highlightTextStyle}> {total_applications}</span> applications
              </span>
              <div style={trendingChipStyle}>
                <div style={trendingDotStyle}></div>
                <span>Real-time insights & metrics</span>
              </div>
            </div>
          </div>
          
          <div style={timeRangeSelectorStyle}>
            <span style={timeRangeLabelStyle}>
              <FiCalendar size={14} style={{ marginRight: 6 }} />
              Time Range:
            </span>
            <select
              style={timeRangeSelectStyle}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
            <button 
              style={refreshButtonStyle}
              onClick={fetchStats}
              title="Refresh data"
            >
              <FiRefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={statsContainerStyle}>
          <div style={statCardStyle}>
            <div style={statIconStyle("#eef2ff", "#4f46e5")}>
              <FiBriefcase size={24} />
            </div>
            <div style={statContentStyle}>
              <div style={statNumberStyle}>{total_jobs}</div>
              <div style={statLabelStyle}>Total Jobs</div>
              <div style={statSubtextStyle}>
                <span style={statTrendStyle(active_jobs > 0)}>
                  <FiTrendingUp size={12} />
                  {active_jobs} active
                </span>
              </div>
            </div>
          </div>
          
          <div style={statCardStyle}>
            <div style={statIconStyle("#fef3c7", "#d97706")}>
              <FiUsers size={24} />
            </div>
            <div style={statContentStyle}>
              <div style={statNumberStyle}>{total_applications}</div>
              <div style={statLabelStyle}>Total Applications</div>
              <div style={statSubtextStyle}>
                <span style={statTrendStyle(applications_today > 0)}>
                  <FiTrendingUp size={12} />
                  {applications_today} today
                </span>
              </div>
            </div>
          </div>
          
          <div style={statCardStyle}>
            <div style={statIconStyle("#dbeafe", "#2563eb")}>
              <FiBarChart2 size={24} />
            </div>
            <div style={statContentStyle}>
              <div style={statNumberStyle}>
                {applications_last_7_days}
              </div>
              <div style={statLabelStyle}>Last 7 Days</div>
              <div style={statSubtextStyle}>
                {applications_last_30_days} in last 30 days
              </div>
            </div>
          </div>
          
          <div style={statCardStyle}>
            <div style={statIconStyle("#d1fae5", "#059669")}>
              <FiPieChart size={24} />
            </div>
            <div style={statContentStyle}>
              <div style={statNumberStyle}>{conversion_rate}%</div>
              <div style={statLabelStyle}>Conversion Rate</div>
              <div style={statSubtextStyle}>
                Application to selection
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={gridContainerStyle}>
          {/* Left Column - Status Breakdown */}
          <div style={columnStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>
                <FiPieChart size={18} style={{ marginRight: 8, color: '#4f46e5' }} />
                Applications by Status
              </h3>
              <span style={sectionCountStyle}>
                {totalStatusCount} total
              </span>
            </div>

            <div style={statusGridStyle}>
              {statusData.map((item, index) => {
                const percentage = totalStatusCount > 0 
                  ? Math.round((item.count / totalStatusCount) * 100) 
                  : 0;
                
                return (
                  <div 
                    key={item.status} 
                    style={statusCardStyle(item.color)}
                    className="status-card"
                  >
                    <div style={statusHeaderStyle}>
                      <div style={statusIconStyle}>
                        {item.icon}
                      </div>
                      <div style={statusInfoStyle}>
                        <div style={statusCountStyle}>{item.count}</div>
                        <div style={statusLabelStyle}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </div>
                      </div>
                    </div>
                    <div style={progressContainerStyle}>
                      <div 
                        style={progressBarStyle(percentage, item.color)}
                      />
                    </div>
                    <div style={percentageStyle}>
                      {percentage}%
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Response Time Card */}
            <div style={responseTimeCardStyle}>
              <div style={responseTimeHeaderStyle}>
                <div style={responseTimeIconStyle}>
                  <FiClock size={20} />
                </div>
                <div>
                  <h4 style={responseTimeTitleStyle}>
                    Average Response Time
                  </h4>
                  <p style={responseTimeSubtitleStyle}>
                    Time to review applications
                  </p>
                </div>
              </div>
              <div style={responseTimeValueStyle}>
                {avg_response_time > 0 ? `${avg_response_time} hours` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Right Column - Top Jobs */}
          <div style={columnStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>
                <FiBriefcase size={18} style={{ marginRight: 8, color: '#10b981' }} />
                Top Performing Jobs
              </h3>
              <span style={sectionCountStyle}>
                {applications_per_job.length} jobs
              </span>
            </div>

            {applications_per_job.length === 0 ? (
              <div style={emptyStateSmallStyle}>
                <div style={emptyIconSmallStyle}>📁</div>
                <h4 style={emptyTitleSmallStyle}>No job applications yet</h4>
                <p style={emptyMessageSmallStyle}>
                  Applications will appear here once candidates start applying.
                </p>
              </div>
            ) : (
              <div style={jobsListStyle}>
                {applications_per_job.slice(0, 6).map((job, index) => {
                  const topJob = top_performing_jobs.find(tj => tj.job_id === job.job_id);
                  
                  return (
                    <div 
                      key={job.job_id} 
                      style={jobCardStyle}
                      className="job-card"
                    >
                      <div style={jobCardHeaderStyle}>
                        <div style={jobRankStyle(index + 1)}>
                          #{index + 1}
                        </div>
                        <div style={jobTitleSectionStyle}>
                          <div style={jobTitleStyle}>
                            {job.job_title || "Untitled Position"}
                          </div>
                          <div style={jobMetaStyle}>
                            <span style={jobMetaItemStyle}>
                              <FiUsers size={12} style={{ marginRight: 4 }} />
                              {job.applications_count} applications
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {topJob && (
                        <div style={jobPerformanceStyle}>
                          <div style={jobPerformanceItemStyle}>
                            <div style={jobPerformanceLabelStyle}>
                              Shortlisted
                            </div>
                            <div style={jobPerformanceValueStyle}>
                              {topJob.shortlisted || 0}
                            </div>
                          </div>
                          <div style={jobPerformanceItemStyle}>
                            <div style={jobPerformanceLabelStyle}>
                              Selected
                            </div>
                            <div style={jobPerformanceValueStyle}>
                              {topJob.selected || 0}
                            </div>
                          </div>
                          <div style={jobPerformanceItemStyle}>
                            <div style={jobPerformanceLabelStyle}>
                              Conversion
                            </div>
                            <div style={jobPerformanceValueStyle(
                              (topJob.selected || 0) > 0 ? '#059669' : '#6b7280'
                            )}>
                              {job.applications_count > 0 
                                ? Math.round(((topJob.selected || 0) / job.applications_count) * 100) 
                                : 0}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Insights Card */}
            <div style={insightsCardStyle}>
              <div style={insightsHeaderStyle}>
                <h4 style={insightsTitleStyle}>
                  <FiEye size={16} style={{ marginRight: 8 }} />
                  Key Insights
                </h4>
              </div>
              <div style={insightsListStyle}>
                <div style={insightItemStyle}>
                  <div style={insightDotStyle("#4f46e5")}></div>
                  <span>
                    <strong>{applications_today}</strong> new applications today
                  </span>
                </div>
                <div style={insightItemStyle}>
                  <div style={insightDotStyle("#10b981")}></div>
                  <span>
                    <strong>{active_jobs}</strong> active jobs posting
                  </span>
                </div>
                <div style={insightItemStyle}>
                  <div style={insightDotStyle("#d97706")}></div>
                  <span>
                    <strong>{applications_by_status.shortlisted || 0}</strong> candidates shortlisted
                  </span>
                </div>
                <div style={insightItemStyle}>
                  <div style={insightDotStyle("#db2777")}></div>
                  <span>
                    Conversion rate: <strong>{conversion_rate}%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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

const timeRangeSelectorStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "rgba(255, 255, 255, 0.9)",
  padding: "8px 16px",
  borderRadius: 12,
  border: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

const timeRangeLabelStyle = {
  fontSize: 13,
  color: "#6b7280",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
};

const timeRangeSelectStyle = {
  padding: "6px 12px",
  borderRadius: 8,
  border: "1px solid rgba(209, 213, 219, 0.6)",
  fontSize: 13,
  color: "#374151",
  background: "#fff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":focus": {
    outline: "none",
    borderColor: "#8b5cf6",
    boxShadow: "0 0 0 3px rgba(139, 92, 246, 0.1)",
  },
};

const refreshButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: 8,
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

const statsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 16,
  marginBottom: 24,
  animation: "fadeIn 0.4s ease 0.1s backwards",
};

const statCardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  padding: "20px",
  borderRadius: 14,
  border: "1px solid rgba(226, 232, 240, 0.8)",
  display: "flex",
  alignItems: "center",
  gap: 16,
  transition: "all 0.2s ease",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.04)",
  ":hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(139, 92, 246, 0.1)",
    borderColor: "#8b5cf6",
  },
};

const statIconStyle = (bgColor, color) => ({
  width: 56,
  height: 56,
  borderRadius: 14,
  background: bgColor,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const statContentStyle = {
  flex: 1,
};

const statNumberStyle = {
  fontSize: 28,
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1,
  marginBottom: 4,
};

const statLabelStyle = {
  fontSize: 13,
  color: "#6b7280",
  fontWeight: 500,
  marginBottom: 6,
};

const statSubtextStyle = {
  fontSize: 11,
  color: "#9ca3af",
};

const statTrendStyle = (positive) => ({
  display: "flex",
  alignItems: "center",
  gap: 4,
  color: positive ? "#10b981" : "#9ca3af",
  fontWeight: 500,
});

const gridContainerStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 24,
  flex: 1,
  minHeight: 0,
  animation: "fadeIn 0.4s ease 0.2s backwards",
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
  marginBottom: 20,
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

const sectionCountStyle = {
  fontSize: 12,
  padding: "4px 10px",
  borderRadius: 999,
  background: "#f3f4f6",
  color: "#4b5563",
  fontWeight: 600,
};

const statusGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 12,
  marginBottom: 24,
};

const statusCardStyle = (color) => ({
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  padding: "16px",
  borderRadius: 12,
  border: `1px solid ${color}20`,
  transition: "all 0.2s ease",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 8px 25px ${color}20`,
  },
});

const statusHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};

const statusIconStyle = {
  fontSize: 24,
};

const statusInfoStyle = {
  flex: 1,
};

const statusCountStyle = {
  fontSize: 20,
  fontWeight: 800,
  color: "#111827",
  lineHeight: 1,
};

const statusLabelStyle = {
  fontSize: 12,
  color: "#6b7280",
  fontWeight: 500,
  textTransform: "capitalize",
};

const progressContainerStyle = {
  height: 6,
  background: "#f3f4f6",
  borderRadius: 3,
  marginBottom: 8,
  overflow: "hidden",
};

const progressBarStyle = (percentage, color) => ({
  height: "100%",
  width: `${percentage}%`,
  background: `linear-gradient(90deg, ${color}, ${color}80)`,
  borderRadius: 3,
  transition: "width 0.6s ease",
});

const percentageStyle = {
  fontSize: 11,
  color: "#6b7280",
  fontWeight: 600,
  textAlign: "right",
};

const responseTimeCardStyle = {
  background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
  padding: "20px",
  borderRadius: 14,
  border: "1px solid rgba(186, 230, 253, 0.8)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const responseTimeHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const responseTimeIconStyle = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "rgba(14, 165, 233, 0.1)",
  color: "#0ea5e9",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const responseTimeTitleStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: "#0369a1",
  marginBottom: 2,
};

const responseTimeSubtitleStyle = {
  fontSize: 12,
  color: "#0c4a6e",
  opacity: 0.8,
};

const responseTimeValueStyle = {
  fontSize: 24,
  fontWeight: 800,
  color: "#0369a1",
};

const jobsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  flex: 1,
  overflowY: "auto",
  marginBottom: 20,
};

const jobCardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  padding: "16px",
  borderRadius: 12,
  border: "1px solid rgba(226, 232, 240, 0.8)",
  transition: "all 0.2s ease",
  ":hover": {
    borderColor: "#10b981",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.1)",
  },
};

const jobCardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginBottom: 12,
};

const jobRankStyle = (rank) => ({
  width: 32,
  height: 32,
  borderRadius: "50%",
  background: rank <= 3 
    ? "linear-gradient(135deg, #fef3c7, #fde68a)" 
    : "#f3f4f6",
  color: rank <= 3 ? "#92400e" : "#6b7280",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 13,
  fontWeight: 700,
  flexShrink: 0,
});

const jobTitleSectionStyle = {
  flex: 1,
  minWidth: 0,
};

const jobTitleStyle = {
  fontWeight: 600,
  fontSize: 14,
  color: "#111827",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  marginBottom: 4,
};

const jobMetaStyle = {
  display: "flex",
  gap: 8,
};

const jobMetaItemStyle = {
  display: "flex",
  alignItems: "center",
  fontSize: 11,
  color: "#6b7280",
};

const jobPerformanceStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 8,
  paddingTop: 12,
  borderTop: "1px solid rgba(226, 232, 240, 0.5)",
};

const jobPerformanceItemStyle = {
  textAlign: "center",
};

const jobPerformanceLabelStyle = {
  fontSize: 10,
  color: "#6b7280",
  marginBottom: 2,
  textTransform: "uppercase",
  fontWeight: 600,
  letterSpacing: "0.05em",
};

const jobPerformanceValueStyle = (color = "#111827") => ({
  fontSize: 14,
  fontWeight: 700,
  color: color,
});

const emptyStateSmallStyle = {
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

const emptyIconSmallStyle = {
  fontSize: 24,
  marginBottom: 12,
  opacity: 0.8,
  background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

const emptyTitleSmallStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#7c3aed",
  marginBottom: 4,
};

const emptyMessageSmallStyle = {
  fontSize: 11,
  color: "#8b5cf6",
  maxWidth: 200,
  lineHeight: 1.5,
  opacity: 0.8,
};

const insightsCardStyle = {
  background: "linear-gradient(135deg, #faf5ff, #f3e8ff)",
  padding: "20px",
  borderRadius: 14,
  border: "1px solid rgba(216, 180, 254, 0.5)",
};

const insightsHeaderStyle = {
  marginBottom: 16,
};

const insightsTitleStyle = {
  fontSize: 16,
  fontWeight: 700,
  color: "#7c3aed",
  margin: 0,
  display: "flex",
  alignItems: "center",
};

const insightsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const insightItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontSize: 13,
  color: "#111827",
};

const insightDotStyle = (color) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: color,
  flexShrink: 0,
});

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

const errorStateStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "80px 20px",
  background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
  borderRadius: 20,
  border: "1px solid rgba(254, 202, 202, 0.8)",
  textAlign: "center",
  animation: "fadeIn 0.4s ease",
};

const errorIconStyle = {
  fontSize: 48,
  marginBottom: 16,
  opacity: 0.8,
};

const errorTitleStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: "#dc2626",
  marginBottom: 8,
};

const errorMessageStyle = {
  fontSize: 13,
  color: "#b91c1c",
  maxWidth: 300,
  lineHeight: 1.6,
  opacity: 0.8,
  marginBottom: 16,
};

const retryButtonStyle = {
  padding: "10px 24px",
  borderRadius: 10,
  border: "1px solid rgba(220, 38, 38, 0.3)",
  background: "linear-gradient(135deg, #ffffff, #fef2f2)",
  color: "#dc2626",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ":hover": {
    background: "#fee2e2",
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
  },
};

const emptyStateStyle = {
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
  lineHeight: 1.6,
  opacity: 0.8,
};

export default RecruiterAnalytics;