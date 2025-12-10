import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Logo.png";

// Icons
import {
  FiHome,
  FiBell,
  FiFileText,
  FiHeart,
  FiStar,
  FiBriefcase,
  FiPlusCircle,
  FiSettings,
  FiBarChart2,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

// --- Style Definitions ---

const COLORS = {
  primary: "#4f46e5",
  primaryLight: "#6366f1",
  textBase: "#111827",
  textSubtle: "#4b5563",
  border: "#e5e7eb",
  background: "#ffffff",
  chip: "#f3f4f6",
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

// Small helper: icon + label wrapper (keeps your styles)
const iconLabel = (IconComp, label) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    {IconComp && <IconComp size={15} />}
    <span>{label}</span>
  </span>
);

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

  // Dynamic links based on user role (DESKTOP)
  const candidateLinks = (
    <>
      <Link to="/candidate/dashboard" style={navLinkStyle}>
        {iconLabel(FiHome, "Dashboard")}
      </Link>
      <Link to="/candidate/applications" style={navLinkStyle}>
        {iconLabel(FiFileText, "Applications")}
      </Link>
      <Link to="/candidate/alerts" style={navLinkStyle}>
        {iconLabel(FiBell, "Job Alerts")}
      </Link>
      <Link to="/candidate/saved-jobs" style={navLinkStyle}>
        {iconLabel(FiHeart, "Saved")}
      </Link>
      <Link to="/candidate/recommended-jobs" style={navLinkStyle}>
        {iconLabel(FiStar, "Recommended")}
      </Link>
    </>
  );

  const recruiterLinks = (
    <>
      <Link to="/recruiter/dashboard" style={navLinkStyle}>
        {iconLabel(FiHome, "Dashboard")}
      </Link>
      <Link to="/recruiter/jobs" style={navLinkStyle}>
        {iconLabel(FiPlusCircle, "Add Job")}
      </Link>
      <Link to="/recruiter/manage-jobs" style={navLinkStyle}>
        {iconLabel(FiSettings, "Manage Jobs")}
      </Link>
      <Link to="/recruiter/analytics" style={navLinkStyle}>
        {iconLabel(FiBarChart2, "Analytics")}
      </Link>
      <Link to="/recruiter/company" style={navLinkStyle}>
        {iconLabel(FiBriefcase, "Company")}
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
                }
            `}
      </style>

      <nav className="navbar" style={navContainerStyle}>
        {/* LEFT SECTION: Logo + Jobs Link */}
        <div style={navGroupStyle}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <img src={logo} alt="Logo" style={{ width: 40 }} />
            <span style={gradientTextStyle}>HIREONIX</span>
          </Link>

          <div
            className="nav-links-desktop"
            style={{ display: "flex", gap: 10 }}
          >
            <Link to="/jobs" style={navLinkStyle}>
              {iconLabel(FiBriefcase, "Jobs")}
            </Link>
          </div>
        </div>

        {/* RIGHT SECTION: Desktop Links */}
        <div
          className="nav-links-desktop"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          {isAuthenticated ? (
            <>
              {role === "candidate" && candidateLinks}
              {role === "recruiter" && recruiterLinks}

              {/* Profile chip */}
              <Link to={profilePath} style={profileChipStyle}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FiUser size={15} />
                  <span>
                    {user?.username ? `Hi, ${user.username}` : "Profile"}
                  </span>
                </span>
              </Link>

              {/* Logout */}
              <button onClick={logout} style={buttonOutlineStyle}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FiLogOut size={15} />
                  <span>Logout</span>
                </span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={navLinkStyle}>
                Login
              </Link>
              <Link to="/register" style={buttonPrimaryStyle}>
                Register
              </Link>
            </>
          )}
        </div>

        {/* MOBILE TOGGLE BUTTON */}
        <button
          className="nav-mobile-toggle"
          style={{ ...mobileMenuButtonStyle, display: "none" }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          ☰
        </button>
      </nav>

      {/* MOBILE MENU PANEL */}
      {isMobileMenuOpen && (
        <div style={mobileMenuPanelStyle}>
          <div style={mobileMenuInnerStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: COLORS.textBase,
                }}
              >
                Menu
              </span>
              <button
                onClick={closeMobile}
                style={{
                  ...buttonOutlineStyle,
                  width: 28,
                  height: 28,
                  borderRadius: "999px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {isAuthenticated ? (
              <>
                {role === "candidate" && (
                  <>
                    <Link
                      to="/candidate/dashboard"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiHome, "Dashboard")}
                    </Link>
                    <Link
                      to="/candidate/applications"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiFileText, "Applications")}
                    </Link>
                    <Link
                      to="/candidate/alerts"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiBell, "Job Alerts")}
                    </Link>
                    <Link
                      to="/candidate/saved-jobs"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiHeart, "Saved")}
                    </Link>
                    <Link
                      to="/candidate/recommended-jobs"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiStar, "Recommended")}
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
                      {iconLabel(FiHome, "Dashboard")}
                    </Link>
                    <Link
                      to="/recruiter/jobs"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiPlusCircle, "Add Job")}
                    </Link>
                    <Link
                      to="/recruiter/manage-jobs"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiSettings, "Manage Jobs")}
                    </Link>
                    <Link
                      to="/recruiter/analytics"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiBarChart2, "Analytics")}
                    </Link>
                    <Link
                      to="/recruiter/company"
                      style={mobileNavLinkStyle}
                      onClick={closeMobile}
                    >
                      {iconLabel(FiBriefcase, "Company")}
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
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FiUser size={15} />
                    <span>
                      {user?.username ? `Hi, ${user.username}` : "Profile"}
                    </span>
                  </span>
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
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <FiLogOut size={15} />
                  <span>Logout</span>
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
                    background: "linear-gradient(135deg,#4f46e5,#6366f1)",
                    color: "#ffffff",
                    boxShadow: "0 8px 20px rgba(79,70,229,0.35)",
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
