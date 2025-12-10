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

  // ---------- Loading state ----------
  if (loading) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #f9fafb 100%)",
          padding: "16px",
        }}
      >
        <div
          style={{
            padding: "14px 20px",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.94)",
            boxShadow: "0 12px 40px rgba(15,23,42,0.16)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "999px",
              border: "2px solid #4f46e5",
              borderTopColor: "transparent",
              animation: "spin 0.8s linear infinite",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: "14px", color: "#4b5563" }}>
            Loading analytics…
          </span>

          <style>
            {`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}
          </style>
        </div>
      </div>
    );
  }

  // ---------- Error state ----------
  if (error) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #fee2e2 0%, #fef2f2 40%, #f9fafb 100%)",
          padding: "16px",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "100%",
            background: "rgba(255,255,255,0.96)",
            padding: "20px 20px 18px",
            borderRadius: "20px",
            boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
            border: "1px solid #fecaca",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              marginBottom: "6px",
              color: "#b91c1c",
            }}
          >
            Something went wrong
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 40%, #f9fafb 100%)",
          padding: "16px",
        }}
      >
        <div
          style={{
            maxWidth: "420px",
            width: "100%",
            background: "rgba(255,255,255,0.96)",
            padding: "20px 20px 18px",
            borderRadius: "20px",
            boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
            border: "1px solid #e5e7eb",
            fontSize: "14px",
            color: "#6b7280",
          }}
        >
          No analytics data available yet. Post a job and receive some
          applications to see stats here.
        </div>
      </div>
    );
  }

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
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background:
          "linear-gradient(135deg, #eef2ff 0%, #f5f3ff 25%, #ecfeff 60%, #f9fafb 100%)",
        padding: "24px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderRadius: "26px",
          boxShadow: "0 22px 60px rgba(15,23,42,0.18)",
          border: "1px solid rgba(148,163,184,0.25)",
          padding: "22px 22px 20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "18px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1
              style={{
                marginBottom: "4px",
                fontSize: "20px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Recruiter Analytics
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                maxWidth: "520px",
              }}
            >
              See how your job postings are performing — jobs created, total
              applications, and which roles get the most interest.
            </p>
          </div>

          <div
            style={{
              fontSize: "11px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: "#eef2ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <span>📊</span>
            <span>Live stats from your jobs</span>
          </div>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            marginBottom: "1.6rem",
          }}
        >
          <SummaryCard
            label="Total Jobs"
            value={total_jobs}
            icon="📌"
            accent="#4f46e5"
          />
          <SummaryCard
            label="Active Jobs"
            value={active_jobs}
            icon="✅"
            accent="#22c55e"
          />
          <SummaryCard
            label="Total Applications"
            value={total_applications}
            icon="📥"
            accent="#0ea5e9"
          />
          <SummaryCard
            label="Applications Today"
            value={applications_today}
            icon="📅"
            accent="#f97316"
          />
          <SummaryCard
            label="Last 7 Days"
            value={applications_last_7_days}
            icon="⏱️"
            accent="#eab308"
          />
        </div>

        {/* Bottom grid: status + per job */}
        <div
          style={{
            display: "grid",
            gap: "1.4rem",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 1.2fr)",
          }}
        >
          {/* By status */}
          <div
            style={{
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
              background:
                "radial-gradient(circle at top left, rgba(59,130,246,0.05), transparent 60%) #ffffff",
              padding: "14px 14px 12px",
            }}
          >
            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Applications by Status
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Track how candidates move through your pipeline.
              </span>
            </div>

            {Object.keys(applications_by_status).length === 0 ? (
              <EmptyState text="No applications yet. Once candidates apply, you’ll see the breakdown here." />
            ) : (
              <div
                style={{
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead
                    style={{
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "8px 10px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Status
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "8px 10px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(applications_by_status).map(
                      ([status, count]) => (
                        <tr
                          key={status}
                          style={{
                            borderBottom: "1px solid #f3f4f6",
                          }}
                        >
                          <td
                            style={{
                              padding: "7px 10px",
                              textTransform: "capitalize",
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {status.replace("_", " ")}
                          </td>
                          <td
                            style={{
                              padding: "7px 10px",
                              textAlign: "right",
                              color: "#374151",
                            }}
                          >
                            {count}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Per job */}
          <div
            style={{
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
              background:
                "radial-gradient(circle at top left, rgba(16,185,129,0.04), transparent 60%) #ffffff",
              padding: "14px 14px 12px",
            }}
          >
            <div
              style={{
                marginBottom: "10px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <h3
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#111827",
                }}
              >
                Applications per Job
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                See which roles are attracting the most candidates.
              </span>
            </div>

            {applications_per_job.length === 0 ? (
              <EmptyState text="No applications for your jobs yet. Share your job posts to get more reach." />
            ) : (
              <div
                style={{
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  background: "#ffffff",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px",
                  }}
                >
                  <thead
                    style={{
                      backgroundColor: "#f9fafb",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "8px 10px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Job Title
                      </th>
                      <th
                        style={{
                          textAlign: "right",
                          padding: "8px 10px",
                          color: "#6b7280",
                          fontWeight: 500,
                        }}
                      >
                        Applications
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications_per_job.map((job) => (
                      <tr
                        key={job.job_id}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        <td
                          style={{
                            padding: "7px 10px",
                            color: "#111827",
                          }}
                        >
                          {job.job_title}
                        </td>
                        <td
                          style={{
                            padding: "7px 10px",
                            textAlign: "right",
                            color: "#374151",
                          }}
                        >
                          {job.applications_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* small responsive tweak */}
        <style>
          {`
            @media (max-width: 768px) {
              .analytics-bottom-grid {
                grid-template-columns: minmax(0, 1fr) !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

/**
 * Small reusable summary card
 */
const SummaryCard = ({ label, value, icon, accent }) => {
  return (
    <div
      style={{
        borderRadius: "14px",
        padding: "12px 14px",
        border: "1px solid #e5e7eb",
        background:
          "radial-gradient(circle at top left, rgba(59,130,246,0.06), transparent 55%) #ffffff",
        boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "2px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "#6b7280",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "16px",
            borderRadius: "999px",
            padding: "3px 8px",
            backgroundColor: "#eff6ff",
            color: accent || "#2563eb",
          }}
        >
          {icon}
        </span>
      </div>
      <span
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: "#111827",
        }}
      >
        {value}
      </span>
    </div>
  );
};

/**
 * Reusable empty state
 */
const EmptyState = ({ text }) => (
  <div
    style={{
      padding: "12px 12px",
      borderRadius: "12px",
      border: "1px dashed #d1d5db",
      background: "#f9fafb",
      fontSize: "13px",
      color: "#6b7280",
    }}
  >
    {text}
  </div>
);

export default RecruiterAnalytics;
