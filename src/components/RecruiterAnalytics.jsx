import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

const RecruiterAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axiosClient.get("recruiter/analytics/");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!stats) return <p>No data available.</p>;

  const {
    total_jobs,
    active_jobs,
    total_applications,
    applications_today,
    applications_last_7_days,
    applications_by_status = {},
    applications_per_job = [],
  } = stats;

  return (
    <div>
      <h2>Recruiter Analytics</h2>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          marginBottom: "2rem",
        }}
      >
        <div className="analytics-card">
          <h3>Total Jobs</h3>
          <p>{total_jobs}</p>
        </div>
        <div className="analytics-card">
          <h3>Active Jobs</h3>
          <p>{active_jobs}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Applications</h3>
          <p>{total_applications}</p>
        </div>
        <div className="analytics-card">
          <h3>Applications Today</h3>
          <p>{applications_today}</p>
        </div>
        <div className="analytics-card">
          <h3>Last 7 Days</h3>
          <p>{applications_last_7_days}</p>
        </div>
      </div>

      {/* By status */}
      <div style={{ marginBottom: "2rem" }}>
        <h3>Applications by Status</h3>
        {Object.keys(applications_by_status).length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(applications_by_status).map(([status, count]) => (
                <tr key={status}>
                  <td style={{ textTransform: "capitalize" }}>{status}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Per job */}
      <div>
        <h3>Applications per Job</h3>
        {applications_per_job.length === 0 ? (
          <p>No applications for your jobs yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Applications</th>
              </tr>
            </thead>
            <tbody>
              {applications_per_job.map((job) => (
                <tr key={job.job_id}>
                  <td>{job.job_title}</td>
                  <td>{job.applications_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default RecruiterAnalytics;
