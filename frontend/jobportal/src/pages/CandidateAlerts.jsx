import { useEffect, useState } from "react";
import {
    fetchAlerts,
    createAlert,
    deleteAlert,
    fetchNotifications,
    markNotificationRead,
} from "../api/alerts";

const CandidateAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingAlert, setSavingAlert] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        keywords: "",
        location: "",
        job_type: "",
    });

    const loadData = async () => {
        setLoading(true);
        setError("");
        try {
            const [alertsRes, notifRes] = await Promise.all([
                fetchAlerts(),
                fetchNotifications(),
            ]);
            setAlerts(alertsRes.data);
            setNotifications(notifRes.data);
        } catch (err) {
            console.error("Error loading alerts/notifs:", err.response?.data || err);
            setError("Could not load job alerts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAlertChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreateAlert = async (e) => {
        e.preventDefault();
        setSavingAlert(true);
        setError("");
        setMessage("");

        try {
            if (!form.keywords.trim()) {
                setError("Please enter at least one keyword.");
                setSavingAlert(false);
                return;
            }

            await createAlert({
                keywords: form.keywords,
                location: form.location,
                job_type: form.job_type,
            });

            setForm({ keywords: "", location: "", job_type: "" });
            setMessage("Job alert created!");
            loadData();
        } catch (err) {
            console.error("Error creating alert:", err.response?.data || err);
            setError("Could not create job alert.");
        } finally {
            setSavingAlert(false);
        }
    };

    const handleDeleteAlert = async (id) => {
        if (!window.confirm("Delete this alert?")) return;
        try {
            await deleteAlert(id);
            setAlerts((prev) => prev.filter((a) => a.id !== id));
        } catch (err) {
            console.error("Error deleting alert:", err.response?.data || err);
            setError("Could not delete alert.");
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (err) {
            console.error("Error marking notification read:", err.response?.data || err);
        }
    };

    if (loading) return <p>Loading job alerts...</p>;

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="page-placeholder">
            <div className="card" style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "center",
                    }}
                >
                    <div>
                        <h2 className="jobs-title">Job Alerts & Notifications</h2>
                        <p className="jobs-subtitle">
                            Create alerts based on your interests and see new matching jobs
                            here.
                        </p>
                    </div>
                    <div
                        style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            background: unreadCount ? "#fee2e2" : "#e5e7eb",
                            color: unreadCount ? "#b91c1c" : "#4b5563",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {unreadCount} unread notification
                        {unreadCount === 1 ? "" : "s"}
                    </div>
                </div>

                {error && (
                    <p style={{ color: "red", fontSize: 13, marginTop: 4 }}>{error}</p>
                )}
                {message && (
                    <p style={{ color: "green", fontSize: 13, marginTop: 4 }}>
                        {message}
                    </p>
                )}

                {/* Create alert form */}
                <div
                    style={{
                        marginTop: 16,
                        padding: 12,
                        borderRadius: 10,
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <h3 style={{ fontSize: 15, marginBottom: 8 }}>Create a Job Alert</h3>
                    <form
                        onSubmit={handleCreateAlert}
                        style={{ display: "grid", gap: 10, gridTemplateColumns: "2fr 1fr 1fr auto" }}
                    >
                        <div>
                            <label className="form-label">Keywords *</label>
                            <input
                                className="input"
                                name="keywords"
                                value={form.keywords}
                                onChange={handleAlertChange}
                                placeholder="e.g. React, Django, Backend"
                            />
                        </div>
                        <div>
                            <label className="form-label">Location</label>
                            <input
                                className="input"
                                name="location"
                                value={form.location}
                                onChange={handleAlertChange}
                                placeholder="e.g. Bangalore"
                            />
                        </div>
                        <div>
                            <label className="form-label">Job Type</label>
                            <input
                                className="input"
                                name="job_type"
                                value={form.job_type}
                                onChange={handleAlertChange}
                                placeholder="e.g. Full-time"
                            />
                        </div>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-end",
                            }}
                        >
                            <button
                                className="btn btn-primary"
                                type="submit"
                                disabled={savingAlert}
                            >
                                {savingAlert ? "Creating..." : "Add Alert"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Existing alerts */}
                <div style={{ marginTop: 16 }}>
                    <h3 style={{ fontSize: 15, marginBottom: 6 }}>My Alerts</h3>
                    {alerts.length === 0 ? (
                        <p style={{ fontSize: 13, color: "#6b7280" }}>
                            You have no alerts yet. Create one above to get notified when a
                            matching job is posted.
                        </p>
                    ) : (
                        <ul
                            style={{
                                listStyle: "none",
                                paddingLeft: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {alerts.map((alert) => (
                                <li
                                    key={alert.id}
                                    style={{
                                        borderRadius: 8,
                                        border: "1px solid #e5e7eb",
                                        padding: "8px 10px",
                                        background: "#ffffff",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 8,
                                        alignItems: "center",
                                    }}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 500 }}>
                                            {alert.keywords}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                                            {alert.location && <>Location: {alert.location} • </>}
                                            {alert.job_type && <>Type: {alert.job_type} • </>}
                                            {alert.is_active ? "Active" : "Inactive"}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-outline"
                                        type="button"
                                        onClick={() => handleDeleteAlert(alert.id)}
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Notifications */}
                <div style={{ marginTop: 20 }}>
                    <h3 style={{ fontSize: 15, marginBottom: 6 }}>Job Notifications</h3>
                    {notifications.length === 0 ? (
                        <p style={{ fontSize: 13, color: "#6b7280" }}>
                            No notifications yet. When recruiters post a job that matches your
                            alerts, it will appear here.
                        </p>
                    ) : (
                        <ul
                            style={{
                                listStyle: "none",
                                paddingLeft: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                            }}
                        >
                            {notifications.map((n) => (
                                <li
                                    key={n.id}
                                    style={{
                                        borderRadius: 8,
                                        border: "1px solid #e5e7eb",
                                        padding: "8px 10px",
                                        background: n.is_read ? "#f9fafb" : "#eef2ff",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 8,
                                            alignItems: "center",
                                        }}
                                    >
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 500 }}>
                                                {n.job?.title}
                                                {n.job?.company_name && (
                                                    <span
                                                        style={{ fontSize: 12, color: "#6b7280" }}
                                                    >
                                                        {" "}
                                                        • {n.job.company_name}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                                                {n.job?.location} • {n.job?.job_type}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: 11,
                                                    color: "#9ca3af",
                                                    marginTop: 2,
                                                }}
                                            >
                                                New job matching your alert •{" "}
                                                {new Date(n.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                        {!n.is_read && (
                                            <button
                                                className="btn btn-outline"
                                                type="button"
                                                onClick={() => handleMarkRead(n.id)}
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateAlerts;
