// src/pages/CandidateAlerts.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const COLORS = {
  bg: "#f3f4f6",
  card: "rgba(255,255,255,0.96)",
  border: "#e5e7eb",
  primary: "#4f46e5",
  primarySoft: "rgba(79,70,229,0.08)",
  textMain: "#111827",
  textSubtle: "#6b7280",
  badge: "#ecfdf5",
  danger: "#fee2e2",
};

const cardStyle = {
  borderRadius: 18,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.card,
  boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
  padding: 18,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 10,
  border: `1px solid ${COLORS.border}`,
  fontSize: 13,
  outline: "none",
  backgroundColor: "#f9fafb",
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 500,
  color: COLORS.textSubtle,
  marginBottom: 4,
};

const pillButton = {
  borderRadius: 999,
  fontSize: 13,
  padding: "7px 14px",
  border: "none",
  cursor: "pointer",
};

const CandidateAlerts = () => {
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [appNotifications, setAppNotifications] = useState([]);

  const [form, setForm] = useState({
    keywords: "",
    location: "",
    job_type: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ------------- LOAD DATA -------------

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [alertsRes, notifRes, appNotifRes] = await Promise.all([
        fetchAlerts(),
        fetchJobNotifications(),
        fetchApplicationStatusNotifications(),
      ]);

      setAlerts(alertsRes.data || []);
      setNotifications(notifRes.data || []);
      setAppNotifications(appNotifRes.data || []);
    } catch (err) {
      console.error("Error loading alerts/notifications:", err);
      setError("Could not load alerts and notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ------------- FORM HANDLERS -------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    // name must be: keywords, location, job_type
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ keywords: "", location: "", job_type: "" });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.keywords.trim()) {
      setError("Please enter at least one keyword.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (editingId) {
        // update existing alert
        await updateAlert(editingId, {
          keywords: form.keywords,
          location: form.location,
          job_type: form.job_type,
        });
      } else {
        // create new alert
        await createAlert({
          keywords: form.keywords,
          location: form.location,
          job_type: form.job_type,
        });
      }

      await loadData();
      resetForm();
    } catch (err) {
      console.error(
        "Error saving alert (create/update):",
        err?.response?.data || err
      );

      // Show backend message if available
      const detail =
        err?.response?.data?.detail ||
        (typeof err?.response?.data === "string" ? err.response.data : "") ||
        "Could not save alert.";
      setError(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (alert) => {
    setEditingId(alert.id);
    setForm({
      keywords: alert.keywords || "",
      location: alert.location || "",
      job_type: alert.job_type || "",
    });
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Error deleting alert:", err?.response?.data || err);
      setError("Could not delete alert.");
    }
  };

  // ------------- NOTIFICATIONS -------------

  const handleMarkJobNotificationRead = async (id) => {
    try {
      await markJobNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Error marking job notification read:", err);
    }
  };

  const handleMarkAppNotificationRead = async (id) => {
    try {
      await markApplicationStatusNotificationRead(id);
      setAppNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Error marking application notification read:", err);
    }
  };

  // ------------- RENDER -------------

  const unreadJobs = notifications.filter((n) => !n.is_read).length;
  const unreadApps = appNotifications.filter((n) => !n.is_read).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #eef2ff, #f9fafb 45%, #f3f4f6)",
        padding: "20px 14px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 650,
                color: COLORS.textMain,
                marginBottom: 4,
              }}
            >
              Job Alerts & Notifications
            </h1>
            <p
              style={{
                fontSize: 13,
                color: COLORS.textSubtle,
                maxWidth: 520,
              }}
            >
              Create smart alerts to get notified when new jobs match your
              interests, and track updates on your applications in one place.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 999,
                background: COLORS.primarySoft,
                color: COLORS.primary,
                fontWeight: 500,
                whiteSpace: "nowrap",
              }}
            >
              Stay updated · No spam
            </span>
            {loading && (
              <span
                style={{
                  fontSize: 11,
                  color: COLORS.textSubtle,
                }}
              >
                Loading…
              </span>
            )}
          </div>
        </div>

        {error && (
          <div
            style={{
              borderRadius: 10,
              border: `1px solid #fecaca`,
              background: COLORS.danger,
              padding: "8px 10px",
              fontSize: 12,
              color: "#b91c1c",
            }}
          >
            {error}
          </div>
        )}

        {/* Main layout: left (alerts) / right (notifications) */}
        <div
          className="alerts-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
            gap: 16,
          }}
        >
          {/* LEFT: Alerts config */}
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
                gap: 10,
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: COLORS.textMain,
                    marginBottom: 2,
                  }}
                >
                  Manage Job Alerts
                </h2>
                <p
                  style={{
                    fontSize: 12,
                    color: COLORS.textSubtle,
                  }}
                >
                  Get notified when new jobs match your saved criteria.
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: COLORS.textSubtle,
                  padding: "4px 9px",
                  borderRadius: 999,
                  background: "#f3f4f6",
                }}
              >
                {alerts.length} active alert{alerts.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Alert form */}
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.3fr 1fr 1fr",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={labelStyle}>Keywords *</div>
                  <input
                    type="text"
                    name="keywords"
                    placeholder="e.g. React, Django, Backend"
                    value={form.keywords}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Location</div>
                  <input
                    type="text"
                    name="location"
                    placeholder="Any location"
                    value={form.location}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Job Type</div>
                  <input
                    type="text"
                    name="job_type"
                    placeholder="Full-time, Intern..."
                    value={form.job_type}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      ...pillButton,
                      background: "#f9fafb",
                      border: `1px solid ${COLORS.border}`,
                      color: COLORS.textSubtle,
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving || !form.keywords.trim()}
                  style={{
                    ...pillButton,
                    background: `linear-gradient(135deg, ${COLORS.primary}, #6366f1)`,
                    color: "white",
                    boxShadow: "0 10px 24px rgba(79,70,229,0.35)",
                    opacity: saving ? 0.85 : 1,
                  }}
                >
                  {editingId ? "Update Alert" : "Create Alert"}
                </button>
              </div>
            </form>

            {/* Existing alerts list */}
            <div style={{ marginTop: 16 }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 550,
                  color: COLORS.textMain,
                  marginBottom: 6,
                }}
              >
                Your Alerts
              </h3>

              {alerts.length === 0 ? (
                <p
                  style={{
                    fontSize: 12,
                    color: COLORS.textSubtle,
                  }}
                >
                  You haven&apos;t created any job alerts yet. Save at least one
                  to start receiving recommendations.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 260,
                    overflowY: "auto",
                  }}
                >
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${COLORS.border}`,
                        padding: "8px 10px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                        background: "#f9fafb",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: COLORS.textMain,
                            marginBottom: 2,
                          }}
                        >
                          {alert.keywords}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: COLORS.textSubtle,
                          }}
                        >
                          {alert.location ? alert.location : "Any location"} ·{" "}
                          {alert.job_type ? alert.job_type : "Any job type"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEdit(alert)}
                          style={{
                            ...pillButton,
                            background: "#eff6ff",
                            color: "#1d4ed8",
                            padding: "5px 10px",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(alert.id)}
                          style={{
                            ...pillButton,
                            background: "#fef2f2",
                            color: "#b91c1c",
                            padding: "5px 10px",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Notifications (Application updates FIRST) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {/* Application updates */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: COLORS.textMain,
                      marginBottom: 2,
                    }}
                  >
                    Application Updates
                  </h2>
                  <p
                    style={{
                      fontSize: 12,
                      color: COLORS.textSubtle,
                    }}
                  >
                    Status changes for your job applications.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: COLORS.textSubtle,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "#f3f4f6",
                  }}
                >
                  {unreadApps} unread
                </span>
              </div>

              {appNotifications.length === 0 ? (
                <p
                  style={{
                    fontSize: 12,
                    color: COLORS.textSubtle,
                  }}
                >
                  No application updates yet. When recruiters review your
                  applications and update their status, you&apos;ll see it here.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 200,
                    overflowY: "auto",
                  }}
                >
                  {appNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => navigate("/candidate/applications")}
                      style={{
                        borderRadius: 10,
                        border: `1px solid ${COLORS.border}`,
                        padding: "8px 10px",
                        background: n.is_read ? "#f9fafb" : "#fefce8",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: COLORS.textMain,
                          }}
                        >
                          {n.job_title}
                          {n.company_name && (
                            <span
                              style={{
                                fontSize: 11,
                                color: COLORS.textSubtle,
                              }}
                            >
                              {" "}
                              · {n.company_name}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: COLORS.textSubtle,
                            marginTop: 2,
                          }}
                        >
                          {n.message}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginTop: 2,
                          }}
                        >
                          Status: {n.status} ·{" "}
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // don't navigate when clicking button
                            handleMarkAppNotificationRead(n.id);
                          }}
                          style={{
                            ...pillButton,
                            background: "#fffbeb",
                            color: "#92400e",
                            padding: "4px 10px",
                            alignSelf: "center",
                          }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Job notifications */}
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: COLORS.textMain,
                      marginBottom: 2,
                    }}
                  >
                    Job Notifications
                  </h2>
                  <p
                    style={{
                      fontSize: 12,
                      color: COLORS.textSubtle,
                    }}
                  >
                    Jobs that matched your alerts.
                  </p>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: COLORS.textSubtle,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: "#f3f4f6",
                  }}
                >
                  {unreadJobs} unread
                </span>
              </div>

              {notifications.length === 0 ? (
                <p
                  style={{
                    fontSize: 12,
                    color: COLORS.textSubtle,
                  }}
                >
                  No matching job notifications yet. Once new jobs match your
                  alerts, they&apos;ll appear here.
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 170,
                    overflowY: "auto",
                  }}
                >
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => navigate(`/job/${n.job_id}`)}
                      style={{
                        borderRadius: 10,
                        border: `1px solid ${COLORS.border}`,
                        padding: "8px 10px",
                        background: n.is_read ? "#f9fafb" : COLORS.badge,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: COLORS.textMain,
                          }}
                        >
                          {n.job_title}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: COLORS.textSubtle,
                          }}
                        >
                          {n.company_name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#9ca3af",
                            marginTop: 2,
                          }}
                        >
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                      {!n.is_read && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation(); // don't navigate when clicking button
                            handleMarkJobNotificationRead(n.id);
                          }}
                          style={{
                            ...pillButton,
                            background: "#eef2ff",
                            color: "#3730a3",
                            padding: "4px 10px",
                            alignSelf: "center",
                          }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Small mobile tweaks */}
        <style>
          {`
            @media (max-width: 900px) {
              .alerts-grid {
                grid-template-columns: minmax(0, 1fr) !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default CandidateAlerts;
