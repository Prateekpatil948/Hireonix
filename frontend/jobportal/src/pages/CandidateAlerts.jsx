// src/pages/CandidateAlerts.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  fetchAlerts,
  createAlert,
  updateAlert,
  deleteAlert,
  fetchJobNotifications,
  markJobNotificationRead,
  fetchApplicationStatusNotifications,
  markApplicationStatusNotificationRead,
} from "../api/alerts";
import { FiSearch, FiFilter, FiX, FiBell, FiCheckCircle, FiAlertCircle, FiBriefcase, FiMapPin, FiClock, FiTrash2, FiExternalLink, FiEye, FiEyeOff } from "react-icons/fi";

const CandidateAlerts = () => {
  const navigate = useNavigate();
  const { setUnreadNotifications } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [appNotifications, setAppNotifications] = useState([]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    keywords: "",
    location: "",
    job_type: "",
  });

  // Alert form state
  const [form, setForm] = useState({
    keywords: "",
    location: "",
    job_type: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAllJobMatches, setShowAllJobMatches] = useState(false);
  const [showAllAppUpdates, setShowAllAppUpdates] = useState(false);

  // Active filter count
  const activeFilterCount = Object.values(filters).filter(v => v.trim()).length;

  /* ---------- UNREAD COUNT ---------- */
  const syncUnreadCount = (jobs, apps) => {
    setUnreadNotifications(
      jobs.filter((n) => !n.is_read).length +
        apps.filter((n) => !n.is_read).length
    );
  };

  /* ---------- LOAD DATA ---------- */
  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [a, j, ap] = await Promise.all([
        fetchAlerts(),
        fetchJobNotifications(),
        fetchApplicationStatusNotifications(),
      ]);

      setAlerts(a.data || []);
      setNotifications(j.data || []);
      setAppNotifications(ap.data || []);

      syncUnreadCount(j.data || [], ap.data || []);
    } catch {
      setError("Could not load alerts & notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---------- FORM HANDLERS ---------- */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFilterChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleClearFilters = () => {
    setFilters({ keywords: "", location: "", job_type: "" });
  };

  const resetForm = () => {
    setForm({ keywords: "", location: "", job_type: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.keywords.trim()) return;

    setSaving(true);
    try {
      editingId
        ? await updateAlert(editingId, form)
        : await createAlert(form);
      await loadData();
      resetForm();
    } catch (err) {
      console.error("Error saving alert:", err);
      setError("Could not save alert. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditAlert = (alert) => {
    setForm({
      keywords: alert.keywords || "",
      location: alert.location || "",
      job_type: alert.job_type || "",
    });
    setEditingId(alert.id);
  };

  const handleDeleteAlert = async (id) => {
    if (window.confirm("Are you sure you want to delete this alert?")) {
      try {
        await deleteAlert(id);
        await loadData();
      } catch (err) {
        console.error("Error deleting alert:", err);
        setError("Could not delete alert. Please try again.");
      }
    }
  };

  /* ---------- MARK READ ---------- */
  const markJobRead = async (id) => {
    try {
      await markJobNotificationRead(id);
      loadData();
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const markAppRead = async (id) => {
    try {
      await markApplicationStatusNotificationRead(id);
      loadData();
    } catch (err) {
      console.error("Error marking notification read:", err);
    }
  };

  const markAllJobRead = async () => {
    try {
      const unreadJobs = notifications.filter(n => !n.is_read);
      for (const job of unreadJobs) {
        await markJobNotificationRead(job.id);
      }
      loadData();
    } catch (err) {
      console.error("Error marking all job notifications read:", err);
    }
  };

  const markAllAppRead = async () => {
    try {
      const unreadApps = appNotifications.filter(n => !n.is_read);
      for (const app of unreadApps) {
        await markApplicationStatusNotificationRead(app.id);
      }
      loadData();
    } catch (err) {
      console.error("Error marking all app notifications read:", err);
    }
  };

  /* ---------- FILTERED DATA ---------- */
  const filteredAlerts = alerts.filter(alert => {
    const matchesKeywords = filters.keywords === "" || 
      (alert.keywords?.toLowerCase() || "").includes(filters.keywords.toLowerCase());
    
    const matchesLocation = filters.location === "" || 
      (alert.location?.toLowerCase() || "").includes(filters.location.toLowerCase());
    
    const matchesJobType = filters.job_type === "" || 
      (alert.job_type?.toLowerCase() || "") === filters.job_type.toLowerCase();
    
    return matchesKeywords && matchesLocation && matchesJobType;
  });

  const unreadJobNotifications = notifications.filter(n => !n.is_read);
  const unreadAppNotifications = appNotifications.filter(n => !n.is_read);

  // Limit displayed notifications
  const displayedJobMatches = showAllJobMatches ? notifications : notifications.slice(0, 3);
  const displayedAppUpdates = showAllAppUpdates ? appNotifications : appNotifications.slice(0, 3);

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
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      <div style={contentContainerStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>
              <span style={{ color: '#4f46e5' }}>Alerts &</span>
              <span style={{ color: '#7c3aed' }}> Notifications</span>
            </h1>
            <div style={subtitleContainerStyle}>
              <span style={subtitleStyle}>
                Stay updated with <span style={highlightTextStyle}>job matches</span> and <span style={highlightTextStyle}>application status</span>
              </span>
              <div style={trendingChipStyle}>
                <div style={trendingDotStyle}></div>
                <span>🔔 {unreadJobNotifications.length + unreadAppNotifications.length} unread</span>
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
              name="keywords"
              value={filters.keywords}
              onChange={handleFilterChange}
              placeholder="Search alerts by keywords, location, or job type..."
            />
            {filters.keywords && (
              <button 
                type="button"
                style={clearSearchButtonStyle}
                onClick={() => setFilters({...filters, keywords: ""})}
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
                onChange={handleFilterChange}
                placeholder="Location"
              />
            </div>
            <div style={quickFilterItemStyle}>
              <FiBriefcase size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#10b981' }} />
              <input
                style={quickFilterInputStyle}
                name="job_type"
                value={filters.job_type}
                onChange={handleFilterChange}
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
                Alert Filters
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
                  <span style={{ color: '#4f46e5' }}>🔍</span> Keywords
                </label>
                <input
                  style={advancedFilterInputStyle}
                  name="keywords"
                  value={filters.keywords}
                  onChange={handleFilterChange}
                  placeholder="Search keywords..."
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
                  onChange={handleFilterChange}
                  placeholder="City, State, or Remote"
                />
              </div>
              
              <div style={advancedFilterItemStyle}>
                <label style={advancedFilterLabelStyle}>
                  <span style={{ color: '#10b981' }}>💼</span> Job Type
                </label>
                <input
                  style={advancedFilterInputStyle}
                  name="job_type"
                  value={filters.job_type}
                  onChange={handleFilterChange}
                  placeholder="Full-time, Contract, Internship"
                />
              </div>
            </div>
            
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
              <FiBell size={24} />
            </div>
            <div>
              <div style={statNumberStyle}>{alerts.length}</div>
              <div style={statLabelStyle}>Active Alerts</div>
            </div>
          </div>
          
          <div style={statCardStyle}>
            <div style={statIconStyle("#fef3c7", "#d97706")}>
              <FiBriefcase size={24} />
            </div>
            <div>
              <div style={statNumberStyle}>{notifications.length}</div>
              <div style={statLabelStyle}>Job Matches</div>
            </div>
          </div>
          
          <div style={statCardStyle}>
            <div style={statIconStyle("#dbeafe", "#1d4ed8")}>
              <FiCheckCircle size={24} />
            </div>
            <div>
              <div style={statNumberStyle}>{appNotifications.length}</div>
              <div style={statLabelStyle}>App Updates</div>
            </div>
          </div>
          
          <div style={statCardStyle}>
            <div style={statIconStyle("#fee2e2", "#dc2626")}>
              <FiAlertCircle size={24} />
            </div>
            <div>
              <div style={statNumberStyle}>
                {unreadJobNotifications.length + unreadAppNotifications.length}
              </div>
              <div style={statLabelStyle}>Unread</div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={errorContainerStyle}>
            <FiAlertCircle size={20} style={{ marginRight: 12, color: '#dc2626' }} />
            <span style={errorTextStyle}>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={loadingContainerStyle}>
            <div style={loadingSpinnerStyle}></div>
            <p style={loadingTextStyle}>
              <span style={{ color: '#4f46e5' }}>Loading</span> your alerts and notifications...
            </p>
            <div style={loadingDotsStyle}>
              <span style={{ animationDelay: '0s' }}>.</span>
              <span style={{ animationDelay: '0.2s' }}>.</span>
              <span style={{ animationDelay: '0.4s' }}>.</span>
            </div>
          </div>
        )}

        {/* Main Content - Compact Layout */}
        {!loading && (
          <div style={compactMainContainerStyle}>
            {/* Left Column - Job Alerts Creation & List */}
            <div style={leftColumnStyle}>
              <div style={sectionCardStyle}>
                <div style={sectionHeaderStyle}>
                  <h3 style={sectionTitleStyle}>
                    <FiBell size={18} style={{ marginRight: 8, color: '#4f46e5' }} />
                    Job Alerts
                  </h3>
                  <span style={sectionCountStyle}>
                    {filteredAlerts.length}
                  </span>
                </div>
                <p style={sectionSubtitleStyle}>
                  Set up alerts to get notified about new matching jobs
                </p>

                {/* Compact Alert Form */}
                <form onSubmit={handleSubmit} style={compactAlertFormStyle}>
                  <div style={compactFormRowStyle}>
                    <input
                      style={compactFormInputStyle}
                      name="keywords"
                      value={form.keywords}
                      onChange={handleChange}
                      placeholder="Keywords (e.g., React Developer)"
                      required
                    />
                    <div style={compactFormActionsStyle}>
                      <button
                        type="submit"
                        disabled={saving || !form.keywords.trim()}
                        style={compactSubmitButtonStyle}
                      >
                        {saving ? (
                          <div style={{ 
                            width: 16, 
                            height: 16, 
                            border: '2px solid rgba(255,255,255,0.3)', 
                            borderTop: '2px solid white', 
                            borderRadius: '50%', 
                            animation: 'spin 0.8s linear infinite',
                          }} />
                        ) : editingId ? 'Update' : 'Create'}
                      </button>
                      {editingId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          style={compactCancelButtonStyle}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div style={compactSecondaryInputsStyle}>
                    <input
                      style={compactSecondaryInputStyle}
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="Location (optional)"
                    />
                    <input
                      style={compactSecondaryInputStyle}
                      name="job_type"
                      value={form.job_type}
                      onChange={handleChange}
                      placeholder="Job type (optional)"
                    />
                  </div>
                </form>

                {/* Compact Alerts List */}
                <div style={compactAlertsListStyle}>
                  {filteredAlerts.length === 0 ? (
                    <div style={emptyCompactAlertsStyle}>
                      <FiBell size={24} style={{ color: '#9ca3af', marginBottom: 8 }} />
                      <p style={emptyCompactAlertsTextStyle}>
                        {activeFilterCount > 0 
                          ? "No alerts match your filters"
                          : "No alerts yet. Create one!"}
                      </p>
                    </div>
                  ) : (
                    filteredAlerts.slice(0, 4).map((alert) => (
                      <div key={alert.id} style={compactAlertCardStyle}>
                        <div style={compactAlertContentStyle}>
                          <div style={compactAlertKeywordsStyle}>
                            {alert.keywords}
                          </div>
                          <div style={compactAlertMetaStyle}>
                            {alert.location && (
                              <span style={compactAlertMetaItemStyle}>
                                <FiMapPin size={10} /> {alert.location}
                              </span>
                            )}
                            {alert.job_type && (
                              <span style={compactAlertMetaItemStyle}>
                                <FiBriefcase size={10} /> {alert.job_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={compactAlertActionsStyle}>
                          <button
                            onClick={() => handleEditAlert(alert)}
                            style={compactAlertEditButtonStyle}
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAlert(alert.id)}
                            style={compactAlertDeleteButtonStyle}
                            title="Delete"
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  {filteredAlerts.length > 4 && (
                    <div style={viewMoreContainerStyle}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>
                        +{filteredAlerts.length - 4} more alerts
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Notifications */}
            <div style={rightColumnStyle}>
              {/* Application Updates Card */}
              <div style={notificationCardStyle}>
                <div style={notificationCardHeaderStyle}>
                  <div style={notificationTitleContainerStyle}>
                    <h4 style={notificationTitleStyle}>
                      <FiCheckCircle size={16} style={{ marginRight: 8, color: '#10b981' }} />
                      Application Updates
                    </h4>
                    {unreadAppNotifications.length > 0 && (
                      <span style={unreadBadgeStyle}>
                        {unreadAppNotifications.length}
                      </span>
                    )}
                  </div>
                  {unreadAppNotifications.length > 0 && (
                    <button
                      onClick={markAllAppRead}
                      style={markAllReadButtonStyle}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={compactNotificationsListStyle}>
                  {appNotifications.length === 0 ? (
                    <div style={emptyCompactNotificationsStyle}>
                      <FiCheckCircle size={24} style={{ color: '#9ca3af', marginBottom: 8 }} />
                      <p style={emptyCompactNotificationsTextStyle}>
                        No application updates yet
                      </p>
                    </div>
                  ) : (
                    <>
                      {displayedAppUpdates.map((notification) => (
                        <div
                          key={notification.id}
                          style={compactNotificationItemStyle(!notification.is_read)}
                          onClick={() => navigate("/candidate/applications")}
                        >
                          <div style={compactNotificationContentStyle}>
                            <div style={compactNotificationTextStyle}>
                              {notification.message}
                            </div>
                            <div style={compactNotificationTimeStyle}>
                              {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAppRead(notification.id);
                              }}
                              style={compactMarkReadButtonStyle}
                              title="Mark as read"
                            >
                              <FiEye size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                      {appNotifications.length > 3 && (
                        <button
                          onClick={() => setShowAllAppUpdates(!showAllAppUpdates)}
                          style={viewMoreButtonStyle}
                        >
                          {showAllAppUpdates ? (
                            <>
                              <FiEyeOff size={12} style={{ marginRight: 6 }} />
                              Show less
                            </>
                          ) : (
                            <>
                              <FiEye size={12} style={{ marginRight: 6 }} />
                              View all ({appNotifications.length})
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Job Matches Card */}
              <div style={notificationCardStyle}>
                <div style={notificationCardHeaderStyle}>
                  <div style={notificationTitleContainerStyle}>
                    <h4 style={notificationTitleStyle}>
                      <FiBriefcase size={16} style={{ marginRight: 8, color: '#f59e0b' }} />
                      Job Matches
                    </h4>
                    {unreadJobNotifications.length > 0 && (
                      <span style={unreadBadgeStyle}>
                        {unreadJobNotifications.length}
                      </span>
                    )}
                  </div>
                  {unreadJobNotifications.length > 0 && (
                    <button
                      onClick={markAllJobRead}
                      style={markAllReadButtonStyle}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={compactNotificationsListStyle}>
                  {notifications.length === 0 ? (
                    <div style={emptyCompactNotificationsStyle}>
                      <FiBriefcase size={24} style={{ color: '#9ca3af', marginBottom: 8 }} />
                      <p style={emptyCompactNotificationsTextStyle}>
                        No job matches yet
                      </p>
                    </div>
                  ) : (
                    <>
                      {displayedJobMatches.map((notification) => (
                        <div
                          key={notification.id}
                          style={compactNotificationItemStyle(!notification.is_read)}
                          onClick={() => navigate(`/job/${notification.job_id}`)}
                        >
                          <div style={compactNotificationContentStyle}>
                            <div style={compactNotificationTextStyle}>
                              {notification.job_title}
                            </div>
                            <div style={compactNotificationTimeStyle}>
                              {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <div style={compactNotificationActionsStyle}>
                            {!notification.is_read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markJobRead(notification.id);
                                }}
                                style={compactMarkReadButtonStyle}
                                title="Mark as read"
                              >
                                <FiEye size={12} />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/job/${notification.job_id}`);
                              }}
                              style={compactViewJobButtonStyle}
                              title="View job"
                            >
                              <FiExternalLink size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {notifications.length > 3 && (
                        <button
                          onClick={() => setShowAllJobMatches(!showAllJobMatches)}
                          style={viewMoreButtonStyle}
                        >
                          {showAllJobMatches ? (
                            <>
                              <FiEyeOff size={12} style={{ marginRight: 6 }} />
                              Show less
                            </>
                          ) : (
                            <>
                              <FiEye size={12} style={{ marginRight: 6 }} />
                              View all ({notifications.length})
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- COMPACT STYLES ---------- */

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
  animation: "bounce 2s infinite",
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

// Advanced Filters (same as before)
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

// Stats Container (more compact)
const statsContainerStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
  marginBottom: 24,
  animation: "fadeIn 0.4s ease",
};

const statCardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  padding: "12px",
  borderRadius: 10,
  border: "1px solid rgba(226, 232, 240, 0.8)",
  display: "flex",
  alignItems: "center",
  gap: 10,
  transition: "all 0.2s ease",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    borderColor: "#8b5cf6",
  },
};

const statIconStyle = (bgColor, color) => ({
  width: 40,
  height: 40,
  borderRadius: 10,
  background: bgColor,
  color: color,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const statNumberStyle = {
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
  lineHeight: 1,
  marginBottom: 2,
};

const statLabelStyle = {
  fontSize: 11,
  color: "#6b7280",
  fontWeight: 500,
};

// Error Container
const errorContainerStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
  border: "1px solid #fecaca",
  color: "#b91c1c",
  fontSize: 12,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  marginBottom: 16,
  animation: "fadeIn 0.3s ease",
};

const errorTextStyle = {
  color: "#dc2626",
};

// Loading State
const loadingContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "60px 20px",
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
  marginBottom: 8,
};

const loadingDotsStyle = {
  display: "flex",
  gap: 2,
  "& span": {
    fontSize: 18,
    color: "#8b5cf6",
    animation: "pulse 1.5s infinite",
  },
};

// Compact Main Layout
const compactMainContainerStyle = {
  display: "grid",
  gridTemplateColumns: "1.2fr 1fr",
  gap: 20,
  flex: 1,
  minHeight: 0,
  maxHeight: "calc(100vh - 300px)",
};

const leftColumnStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
};

const rightColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  minHeight: 0,
};

// Section Card
const sectionCardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  borderRadius: 14,
  border: "1px solid rgba(226, 232, 240, 0.8)",
  padding: 16,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const sectionTitleStyle = {
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
  margin: 0,
  display: "flex",
  alignItems: "center",
};

const sectionSubtitleStyle = {
  fontSize: 11,
  color: "#6b7280",
  margin: "0 0 12px 0",
  lineHeight: 1.4,
};

const sectionCountStyle = {
  fontSize: 11,
  padding: "3px 8px",
  borderRadius: 999,
  background: "#f3f4f6",
  color: "#4b5563",
  fontWeight: 600,
  minWidth: 24,
  textAlign: "center",
};

// Compact Alert Form
const compactAlertFormStyle = {
  marginBottom: 16,
};

const compactFormRowStyle = {
  display: "flex",
  gap: 8,
  marginBottom: 8,
};

const compactFormInputStyle = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(209, 213, 219, 0.8)",
  fontSize: 12,
  color: "#111827",
  transition: "all 0.2s ease",
  background: "rgba(255, 255, 255, 0.9)",
  outline: "none",
  ":focus": {
    borderColor: "#8b5cf6",
    boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.15)",
    background: "#fff",
  },
  "::placeholder": {
    color: "#9ca3af",
  },
};

const compactFormActionsStyle = {
  display: "flex",
  gap: 6,
};

const compactSubmitButtonStyle = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "none",
  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  color: "#fff",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  minWidth: 80,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
  ":hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
  },
  ":disabled": {
    opacity: 0.7,
    cursor: "not-allowed",
    transform: "none",
    boxShadow: "none",
  },
};

const compactCancelButtonStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid rgba(209, 213, 219, 0.8)",
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  color: "#6b7280",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    background: "#f3f4f6",
    borderColor: "#d1d5db",
    transform: "translateY(-1px)",
  },
};

const compactSecondaryInputsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const compactSecondaryInputStyle = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid rgba(209, 213, 219, 0.6)",
  fontSize: 11,
  color: "#111827",
  transition: "all 0.2s ease",
  background: "rgba(249, 250, 251, 0.8)",
  outline: "none",
  ":focus": {
    borderColor: "#8b5cf6",
    boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.1)",
    background: "#fff",
  },
  "::placeholder": {
    color: "#9ca3af",
  },
};

// Compact Alerts List
const compactAlertsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  flex: 1,
  overflowY: "auto",
  paddingRight: 2,
};

const emptyCompactAlertsStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  textAlign: "center",
  flex: 1,
};

const emptyCompactAlertsTextStyle = {
  fontSize: 12,
  color: "#9ca3af",
  lineHeight: 1.4,
  maxWidth: 200,
};

const compactAlertCardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  padding: "10px",
  borderRadius: 8,
  border: "1px solid rgba(226, 232, 240, 0.8)",
  transition: "all 0.2s ease",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  ":hover": {
    borderColor: "#8b5cf6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
  },
};

const compactAlertContentStyle = {
  flex: 1,
  minWidth: 0,
};

const compactAlertKeywordsStyle = {
  fontWeight: 600,
  fontSize: 12,
  color: "#111827",
  marginBottom: 2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const compactAlertMetaStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  fontSize: 10,
  color: "#6b7280",
};

const compactAlertMetaItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 3,
};

const compactAlertActionsStyle = {
  display: "flex",
  gap: 4,
  flexShrink: 0,
};

const compactAlertEditButtonStyle = {
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid rgba(139, 92, 246, 0.2)",
  background: "rgba(139, 92, 246, 0.1)",
  color: "#7c3aed",
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    background: "rgba(139, 92, 246, 0.2)",
    transform: "translateY(-1px)",
  },
};

const compactAlertDeleteButtonStyle = {
  padding: "4px",
  borderRadius: 6,
  border: "1px solid rgba(239, 68, 68, 0.2)",
  background: "rgba(239, 68, 68, 0.1)",
  color: "#dc2626",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    background: "rgba(239, 68, 68, 0.2)",
    transform: "translateY(-1px)",
  },
};

const viewMoreContainerStyle = {
  padding: "8px",
  textAlign: "center",
  borderTop: "1px dashed rgba(226, 232, 240, 0.8)",
  marginTop: 4,
};

// Notifications Card
const notificationCardStyle = {
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  borderRadius: 14,
  border: "1px solid rgba(226, 232, 240, 0.8)",
  padding: 16,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
  overflow: "hidden",
};

const notificationCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid rgba(226, 232, 240, 0.7)",
};

const notificationTitleContainerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const notificationTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#111827",
  margin: 0,
  display: "flex",
  alignItems: "center",
};

const unreadBadgeStyle = {
  fontSize: 10,
  padding: "2px 6px",
  borderRadius: 999,
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "#fff",
  fontWeight: 700,
  minWidth: 18,
  textAlign: "center",
  animation: "pulse 2s infinite",
};

const markAllReadButtonStyle = {
  padding: "4px 8px",
  borderRadius: 6,
  border: "1px solid rgba(16, 185, 129, 0.2)",
  background: "rgba(16, 185, 129, 0.1)",
  color: "#059669",
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    background: "rgba(16, 185, 129, 0.2)",
    transform: "translateY(-1px)",
  },
};

// Compact Notifications List
const compactNotificationsListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  flex: 1,
  overflowY: "auto",
  paddingRight: 2,
};

const emptyCompactNotificationsStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  textAlign: "center",
  flex: 1,
};

const emptyCompactNotificationsTextStyle = {
  fontSize: 12,
  color: "#9ca3af",
  lineHeight: 1.4,
  maxWidth: 200,
};

const compactNotificationItemStyle = (isUnread) => ({
  background: isUnread 
    ? "linear-gradient(135deg, #fef3c7, #fde68a)" 
    : "linear-gradient(135deg, #ffffff, #f9fafb)",
  padding: "8px",
  borderRadius: 8,
  border: isUnread 
    ? "1px solid rgba(251, 191, 36, 0.3)" 
    : "1px solid rgba(226, 232, 240, 0.8)",
  transition: "all 0.2s ease",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  ":hover": {
    borderColor: "#8b5cf6",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
  },
});

const compactNotificationContentStyle = {
  flex: 1,
  minWidth: 0,
};

const compactNotificationTextStyle = {
  fontSize: 11,
  color: "#374151",
  fontWeight: 500,
  marginBottom: 2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const compactNotificationTimeStyle = {
  fontSize: 9,
  color: "#9ca3af",
};

const compactNotificationActionsStyle = {
  display: "flex",
  gap: 4,
  flexShrink: 0,
};

const compactMarkReadButtonStyle = {
  padding: "4px",
  borderRadius: 6,
  border: "1px solid rgba(16, 185, 129, 0.2)",
  background: "rgba(16, 185, 129, 0.1)",
  color: "#059669",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    background: "rgba(16, 185, 129, 0.2)",
    transform: "translateY(-1px)",
  },
};

const compactViewJobButtonStyle = {
  padding: "4px",
  borderRadius: 6,
  border: "1px solid rgba(37, 99, 235, 0.2)",
  background: "rgba(37, 99, 235, 0.1)",
  color: "#1d4ed8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.2s ease",
  ":hover": {
    background: "rgba(37, 99, 235, 0.2)",
    transform: "translateY(-1px)",
  },
};

const viewMoreButtonStyle = {
  padding: "6px",
  borderRadius: 6,
  border: "1px solid rgba(148, 163, 184, 0.3)",
  background: "rgba(249, 250, 251, 0.8)",
  color: "#6b7280",
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
  marginTop: 4,
  ":hover": {
    background: "#f3f4f6",
    transform: "translateY(-1px)",
  },
};

// Responsive styles
const mediaQueries = `
  @media (max-width: 1024px) {
    ${JSON.stringify(compactMainContainerStyle)} {
      grid-template-columns: 1fr;
      max-height: none;
    }
    
    ${JSON.stringify(statsContainerStyle)} {
      grid-template-columns: repeat(2, 1fr);
    }
    
    ${JSON.stringify(advancedFiltersGridStyle)} {
      grid-template-columns: 1fr;
    }
    
    ${JSON.stringify(contentContainerStyle)} {
      padding: 20px;
    }
  }
  
  @media (max-width: 768px) {
    ${JSON.stringify(pageContainerStyle)} {
      left: 0;
      top: 0;
    }
    
    ${JSON.stringify(statsContainerStyle)} {
      grid-template-columns: 1fr;
    }
    
    ${JSON.stringify(headerStyle)} {
      flex-direction: column;
      gap: 12px;
    }
    
    ${JSON.stringify(compactSecondaryInputsStyle)} {
      grid-template-columns: 1fr;
    }
  }
`;

// Add media queries to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = mediaQueries;
document.head.appendChild(styleSheet);

export default CandidateAlerts;