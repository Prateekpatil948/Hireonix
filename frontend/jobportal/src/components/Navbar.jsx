import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const role = user?.role; // "candidate" or "recruiter"

    // Decide where "Hi, username" goes
    const profilePath =
        role === "candidate"
            ? "/candidate/profile"
            : role === "recruiter"
                ? "/recruiter/profile"
                : "/";

    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 40,
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e5e7eb",
            }}
        >
            <nav
                className="navbar"
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
            >
                {/* LEFT: logo + main links */}
                <div
                    className="nav-left"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        minWidth: 0,
                    }}
                >
                    {/* Brand */}
                    <Link
                        to="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            textDecoration: "none",
                        }}
                    >
                        <div
                            style={{
                                width: 28,
                                height: 28,
                                borderRadius: "999px",
                                background:
                                    "radial-gradient(circle at 0 0,#4f46e5,#6366f1 50%,#0ea5e9 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#ffffff",
                            }}
                        >
                            JP
                        </div>
                        <span
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#111827",
                            }}
                        >
                            JobPortal
                        </span>
                    </Link>

                    {/* Common jobs link */}
                    {(!isAuthenticated ||
                        role === "candidate" ||
                        role === "recruiter") && (
                            <Link
                                to="/jobs"
                                className="nav-link"
                                style={{
                                    fontSize: 14,
                                    color: "#4b5563",
                                    textDecoration: "none",
                                    padding: "4px 8px",
                                    borderRadius: "999px",
                                }}
                            >
                                Jobs
                            </Link>
                        )}
                </div>

                {/* RIGHT: user-specific links */}
                <div
                    className="nav-right"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        justifyContent: "flex-end",
                    }}
                >
                    {isAuthenticated ? (
                        <>
                            {role === "candidate" && (
                                <>
                                    <Link
                                        to="/candidate/dashboard"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/candidate/applications"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Applications
                                    </Link>
                                    <Link
                                        to="/candidate/saved-jobs"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Saved
                                    </Link>
                                    <Link
                                        to="/candidate/recommended-jobs"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Recommended
                                    </Link>
                                </>
                            )}

                            {role === "recruiter" && (
                                <>
                                    <Link
                                        to="/recruiter/dashboard"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/recruiter/jobs"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Add Job
                                    </Link>
                                    <Link
                                        to="/recruiter/manage-jobs"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Manage Jobs
                                    </Link>
                                    <Link
                                        to="/recruiter/analytics"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Analytics
                                    </Link>
                                    <Link
                                        to="/recruiter/company"
                                        className="nav-link"
                                        style={navLinkStyle}
                                    >
                                        Company
                                    </Link>
                                </>
                            )}

                            {/* Hi, username chip */}
                            <Link
                                to={profilePath}
                                style={{
                                    padding: "4px 10px",
                                    backgroundColor: "#f3f4f6",
                                    borderRadius: "999px",
                                    fontSize: 13,
                                    textDecoration: "none",
                                    color: "#111827",
                                    maxWidth: 150,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user?.username
                                    ? `Hi, ${user.username}`
                                    : "Profile"}
                            </Link>

                            <button
                                onClick={logout}
                                className="btn btn-outline"
                                style={{
                                    fontSize: 13,
                                    padding: "6px 12px",
                                    borderRadius: "999px",
                                    border: "1px solid #d1d5db",
                                    backgroundColor: "#ffffff",
                                    color: "#374151",
                                    cursor: "pointer",
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="nav-link"
                                style={navLinkStyle}
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-primary"
                                style={{
                                    fontSize: 14,
                                    padding: "6px 14px",
                                    borderRadius: "999px",
                                    textDecoration: "none",
                                    background:
                                        "linear-gradient(135deg,#4f46e5,#6366f1)",
                                    color: "#ffffff",
                                    border: "none",
                                    boxShadow:
                                        "0 8px 20px rgba(79,70,229,0.35)",
                                }}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

const navLinkStyle = {
    fontSize: 14,
    color: "#4b5563",
    textDecoration: "none",
    padding: "4px 8px",
    borderRadius: "999px",
};

export default Navbar;
