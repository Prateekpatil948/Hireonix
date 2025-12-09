import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Logo.png";

// --- Style Definitions for Compactness and Readability ---

const COLORS = {
    primary: "#4f46e5", // Indigo-600
    primaryLight: "#6366f1", // Indigo-500
    textBase: "#111827", // Gray-900
    textSubtle: "#4b5563", // Gray-600
    border: "#e5e7eb", // Gray-200
    background: "#ffffff",
    chip: "#f3f4f6", // Gray-100
};

const headerStyle = {
    position: "sticky",
    top: 0,
    zIndex: 40,
    backgroundColor: "rgba(255,255,255,0.94)",
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${COLORS.border}`,
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
};

const navContainerStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
};

const navGroupStyle = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    minWidth: 0,
};

const logoContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
};

const logoIconStyle = {
    width: 40,
    height: 40,
    borderRadius: "999px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    boxShadow: "0 4px 14px rgba(15,23,42,0.12)",
};

// Gradient Text Style (for 'Hireonix' effect)
const gradientTextStyle = {
    fontSize: 18,
    fontWeight: 600,
    backgroundImage: "linear-gradient(to right, #1d4ed8, #a855f7)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
    display: "flex",
    letterSpacing: "0.04em",
};

const navLinkStyle = {
    fontSize: 14,
    color: COLORS.textSubtle,
    textDecoration: "none",
    padding: "6px 10px",
    borderRadius: "999px",
    transition: "background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease",
};

const profileChipStyle = {
    padding: "6px 12px",
    backgroundColor: COLORS.chip,
    borderRadius: "999px",
    fontSize: 13,
    textDecoration: "none",
    color: COLORS.textBase,
    maxWidth: 150,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
};

const buttonOutlineStyle = {
    fontSize: 13,
    padding: "6px 12px",
    borderRadius: "999px",
    border: `1px solid #d1d5db`,
    backgroundColor: COLORS.background,
    color: "#374151",
    cursor: "pointer",
    transition: "background 0.15s ease, box-shadow 0.15s ease",
};

const buttonPrimaryStyle = {
    fontSize: 14,
    padding: "7px 14px",
    borderRadius: "999px",
    textDecoration: "none",
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
    color: COLORS.background,
    border: "none",
    boxShadow: `0 10px 24px rgba(79,70,229,0.35)`,
};

const mobileMenuButtonStyle = {
    width: 36,
    height: 36,
    borderRadius: "999px",
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
};

const mobileMenuPanelStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "8px 16px 12px",
};

const mobileMenuInnerStyle = {
    borderRadius: "18px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    boxShadow: "0 16px 40px rgba(15,23,42,0.12)",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
};

const mobileNavLinkStyle = {
    ...navLinkStyle,
    display: "block",
    padding: "8px 10px",
};

// --- Component Definition ---

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const role = user?.role; // "candidate" or "recruiter"
    const profilePath =
        role === "candidate"
            ? "/candidate/profile"
            : role === "recruiter"
                ? "/recruiter/profile"
                : "/";

    const closeMobile = () => setIsMobileMenuOpen(false);

    // Dynamic links based on user role
    const candidateLinks = (
        <>
            <Link to="/candidate/dashboard" style={navLinkStyle}>
                Dashboard
            </Link>
            <Link to="/candidate/applications" style={navLinkStyle}>
                Applications
            </Link>
            <Link to="/candidate/saved-jobs" style={navLinkStyle}>
                Saved
            </Link>
            <Link to="/candidate/recommended-jobs" style={navLinkStyle}>
                Recommended
            </Link>
        </>
    );

    const recruiterLinks = (
        <>
            <Link to="/recruiter/dashboard" style={navLinkStyle}>
                Dashboard
            </Link>
            <Link to="/recruiter/jobs" style={navLinkStyle}>
                Add Job
            </Link>
            <Link to="/recruiter/manage-jobs" style={navLinkStyle}>
                Manage Jobs
            </Link>
            <Link to="/recruiter/analytics" style={navLinkStyle}>
                Analytics
            </Link>
            <Link to="/recruiter/company" style={navLinkStyle}>
                Company
            </Link>
        </>
    );

    // --- HOVER STYLES (inline enhancer) ---
    const enhanceNavLink = (style) => ({
        ...style,
        cursor: "pointer",
    });

    return (
        <header style={headerStyle}>
            {/* Tiny CSS for responsive behavior */}
            <style>
                {`
                @media (max-width: 768px) {
                    .nav-links-desktop {
                        display: none !important;
                    }
                    .nav-mobile-toggle {
                        display: flex !important;
                    }
                }
                @media (min-width: 769px) {
                    .nav-links-desktop {
                        display: flex !important;
                    }
                    .nav-mobile-toggle {
                        display: none !important;
                    }
                }
                .navbar a:hover {
                    background: rgba(79,70,229,0.06);
                    color: #111827 !important;
                    box-shadow: 0 4px 10px rgba(15,23,42,0.06);
                }
                .navbar button:hover {
                    background: #f9fafb;
                    box-shadow: 0 4px 10px rgba(15,23,42,0.08);
                }
            `}
            </style>

            <nav className="navbar" style={navContainerStyle}>
                {/* LEFT: logo + main links */}
                <div className="nav-left" style={navGroupStyle}>
                    <Link to="/" style={logoContainerStyle}>
                        <div style={logoIconStyle}>
                            <img
                                src={logo}
                                alt="Logo"
                                style={{
                                    width: "78%",
                                    height: "78%",
                                    objectFit: "contain",
                                    display: "block",
                                }}
                            />
                        </div>
                        {/* HIREONIX gradient text */}
                        <span style={gradientTextStyle}>
                            <span style={{ fontWeight: 795 }}>HIRE</span>
                            <span style={{ fontWeight: 450 }}>ONIX</span>
                        </span>
                    </Link>

                    {/* Common jobs link (visible to all) - desktop */}
                    <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {(!isAuthenticated || role) && (
                            <Link to="/jobs" style={enhanceNavLink(navLinkStyle)}>
                                Jobs
                            </Link>
                        )}
                    </div>
                </div>

                {/* RIGHT: user-specific links / Auth buttons (desktop) */}
                <div
                    className="nav-right nav-links-desktop"
                    style={{ ...navGroupStyle, gap: "8px", justifyContent: "flex-end" }}
                >
                    {isAuthenticated ? (
                        <>
                            {role === "candidate" && candidateLinks}
                            {role === "recruiter" && recruiterLinks}

                            {/* Hi, username chip */}
                            <Link to={profilePath} style={profileChipStyle}>
                                {user?.username ? `Hi, ${user.username}` : "Profile"}
                            </Link>

                            <button
                                onClick={logout}
                                className="btn btn-outline"
                                style={buttonOutlineStyle}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={enhanceNavLink(navLinkStyle)}>
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="btn btn-primary"
                                style={buttonPrimaryStyle}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                {/* MOBILE: hamburger button */}
                <button
                    type="button"
                    className="nav-mobile-toggle"
                    style={mobileMenuButtonStyle}
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                    aria-label="Toggle navigation"
                >
                    <div
                        style={{
                            width: 18,
                            height: 14,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                        }}
                    >
                        <span
                            style={{
                                height: 2,
                                borderRadius: 999,
                                background: "#111827",
                                transform: isMobileMenuOpen ? "rotate(45deg) translateY(5px)" : "none",
                                transformOrigin: "center",
                                transition: "transform 0.18s ease",
                            }}
                        />
                        <span
                            style={{
                                height: 2,
                                borderRadius: 999,
                                background: "#111827",
                                opacity: isMobileMenuOpen ? 0 : 1,
                                transition: "opacity 0.18s ease",
                            }}
                        />
                        <span
                            style={{
                                height: 2,
                                borderRadius: 999,
                                background: "#111827",
                                transform: isMobileMenuOpen ? "rotate(-45deg) translateY(-5px)" : "none",
                                transformOrigin: "center",
                                transition: "transform 0.18s ease",
                            }}
                        />
                    </div>
                </button>
            </nav>

            {/* MOBILE MENU PANEL */}
            {isMobileMenuOpen && (
                <div style={mobileMenuPanelStyle}>
                    <div style={mobileMenuInnerStyle}>
                        {/* Jobs link */}
                        {(!isAuthenticated || role) && (
                            <Link
                                to="/jobs"
                                style={mobileNavLinkStyle}
                                onClick={closeMobile}
                            >
                                Jobs
                            </Link>
                        )}

                        {isAuthenticated ? (
                            <>
                                {role === "candidate" && (
                                    <>
                                        <Link
                                            to="/candidate/dashboard"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/candidate/applications"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Applications
                                        </Link>
                                        <Link
                                            to="/candidate/saved-jobs"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Saved Jobs
                                        </Link>
                                        <Link
                                            to="/candidate/recommended-jobs"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Recommended
                                        </Link>
                                    </>
                                )}

                                {role === "recruiter" && (
                                    <>
                                        <Link
                                            to="/recruiter/dashboard"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/recruiter/jobs"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Add Job
                                        </Link>
                                        <Link
                                            to="/recruiter/manage-jobs"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Manage Jobs
                                        </Link>
                                        <Link
                                            to="/recruiter/analytics"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Analytics
                                        </Link>
                                        <Link
                                            to="/recruiter/company"
                                            style={mobileNavLinkStyle}
                                            onClick={closeMobile}
                                        >
                                            Company
                                        </Link>
                                    </>
                                )}

                                <Link
                                    to={profilePath}
                                    style={{
                                        ...mobileNavLinkStyle,
                                        fontWeight: 500,
                                    }}
                                    onClick={closeMobile}
                                >
                                    {user?.username ? `Hi, ${user.username}` : "Profile"}
                                </Link>

                                <button
                                    onClick={() => {
                                        closeMobile();
                                        logout();
                                    }}
                                    style={{
                                        ...buttonOutlineStyle,
                                        width: "100%",
                                        marginTop: 4,
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    style={mobileNavLinkStyle}
                                    onClick={closeMobile}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    style={{
                                        ...mobileNavLinkStyle,
                                        background:
                                            "linear-gradient(135deg,#4f46e5,#6366f1)",
                                        color: "#ffffff",
                                        boxShadow:
                                            "0 8px 20px rgba(79,70,229,0.35)",
                                        textAlign: "center",
                                        marginTop: 2,
                                    }}
                                    onClick={closeMobile}
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
