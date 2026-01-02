import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/Logo.png";
import { FiBell, FiUser, FiChevronDown } from "react-icons/fi";

const Navbar = () => {
  const { isAuthenticated, user, unreadNotifications } = useAuth();

  return (
    <header style={headerStyle}>
      <nav style={navStyle}>
        {/* LOGO - Full Left Side */}
        <Link to="/" style={logoStyle}>
          <img src={logo} alt="Logo" style={{ width: 38 }} />
          <span style={logoText}>HIREONIX</span>
        </Link>

        {/* RIGHT SIDE - Full Right Side */}
        <div style={rightContainerStyle}>
          {!isAuthenticated ? (
            <div style={authButtonsStyle}>
              <Link to="/login" style={loginButtonStyle}>
                Login
              </Link>
              <Link to="/register" style={registerButtonStyle}>
                Register
              </Link>
            </div>
          ) : (
            <div style={userSectionStyle}>
              {/* 🔔 Notification Bell (candidate only) */}
              {user?.role === "candidate" && (
                <Link to="/candidate/alerts" style={notificationLinkStyle}>
                  <div style={notificationContainerStyle}>
                    <FiBell size={18} />
                    {unreadNotifications > 0 && (
                      <span style={notificationBadgeStyle}>
                        {unreadNotifications > 9 ? "9+" : unreadNotifications}
                      </span>
                    )}
                  </div>
                </Link>
              )}

              {/* Profile Button */}
              <Link
                to={
                  user?.role === "recruiter"
                    ? "/recruiter/profile"
                    : "/candidate/profile"
                }
                style={profileButtonStyle}
              >
                <div style={profileIconStyle}>
                  <FiUser size={16} />
                </div>
                <span style={profileTextStyle}>
                  {user?.username || "Profile"}
                </span>
                <FiChevronDown size={14} style={chevronStyle} />
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

/* ---------- ENHANCED STYLES ---------- */

const headerStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
  boxShadow: "0 4px 20px rgba(15, 23, 42, 0.08)",
};

const navStyle = {
  height: 64,
  padding: "0 32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const logoStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  textDecoration: "none",
  flexShrink: 0,
};

const logoText = {
  fontSize: 20,
  fontWeight: 800,
  letterSpacing: "-0.02em",
  background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const rightContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  flex: 1,
};

const authButtonsStyle = {
  display: "flex",
  alignItems: "center",
  gap: 20,
};

const loginButtonStyle = {
  padding: "10px 28px",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  color: "#6b7280",
  textDecoration: "none",
  transition: "all 0.3s ease",
  border: "1px solid rgba(209, 213, 219, 0.8)",
  background: "linear-gradient(135deg, #ffffff, #f9fafb)",
  ":hover": {
    color: "#4f46e5",
    borderColor: "#4f46e5",
    background: "rgba(79, 70, 229, 0.02)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.15)",
  },
};

const registerButtonStyle = {
  padding: "12px 32px",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 600,
  background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  color: "#fff",
  textDecoration: "none",
  transition: "all 0.3s ease",
  boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
  ":hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 12px 32px rgba(139, 92, 246, 0.6)",
    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
  },
};

const userSectionStyle = {
  display: "flex",
  alignItems: "center",
  gap: 20,
};

const notificationLinkStyle = {
  textDecoration: "none",
  position: "relative",
};

const notificationContainerStyle = {
  width: 48,
  height: 48,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(243, 244, 246, 0.9))",
  border: "1px solid rgba(229, 231, 235, 0.8)",
  color: "#6b7280",
  transition: "all 0.3s ease",
  cursor: "pointer",
  position: "relative",
  ":hover": {
    background: "linear-gradient(135deg, rgba(243, 244, 246, 0.9), rgba(229, 231, 235, 0.9))",
    borderColor: "rgba(209, 213, 219, 0.8)",
    color: "#4f46e5",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  },
};

const notificationBadgeStyle = {
  position: "absolute",
  top: -6,
  right: -6,
  minWidth: 22,
  height: 22,
  padding: "0 5px",
  borderRadius: "50%",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "#fff",
  fontSize: 11,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "3px solid rgba(255, 255, 255, 0.95)",
  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
};

const profileButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "10px 20px 10px 16px",
  borderRadius: 14,
  background: "linear-gradient(135deg, rgba(249, 250, 251, 0.9), rgba(243, 244, 246, 0.9))",
  border: "1px solid rgba(229, 231, 235, 0.8)",
  textDecoration: "none",
  transition: "all 0.3s ease",
  cursor: "pointer",
  ":hover": {
    background: "linear-gradient(135deg, rgba(243, 244, 246, 0.9), rgba(229, 231, 235, 0.9))",
    borderColor: "rgba(209, 213, 219, 0.8)",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  },
};

const profileIconStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 16,
  fontWeight: 700,
  flexShrink: 0,
};

const profileTextStyle = {
  fontSize: 15,
  fontWeight: 600,
  color: "#111827",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 140,
};

const chevronStyle = {
  color: "#9ca3af",
  marginLeft: 4,
  transition: "transform 0.2s ease",
};

export default Navbar;