import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiFileText,
  FiHeart,
  FiStar,
  FiBriefcase,
  FiPlusCircle,
  FiSettings,
  FiBarChart2,
  FiLogOut,
  FiChevronRight,
  FiUser,
  FiBell,
  FiChevronLeft,
  FiChevronDown,
} from "react-icons/fi";

const SideBar = () => {
  const { isAuthenticated, user, logout, unreadNotifications } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) return null;

  const role = user?.role;
  const isActive = (path) => pathname.startsWith(path);
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <aside style={sidebarStyle}>
      

      {/* Menu Sections */}
      <div style={{ padding: "20px 16px 0", flex: 1 }}>
        <MenuSection title="Menu">
          <SideLink 
            to="/jobs" 
            icon={FiBriefcase} 
            label="Browse Jobs" 
            active={isActive("/jobs")} 
          />
          
          {role === "candidate" && (
            <>
              <SideLink 
                to="/candidate/dashboard" 
                icon={FiHome} 
                label="Dashboard" 
                active={isActive("/candidate/dashboard")} 
              />
              <SideLink 
                to="/candidate/applications" 
                icon={FiFileText} 
                label="Applications" 
                active={isActive("/candidate/applications")} 
              />
              <SideLink 
                to="/candidate/saved-jobs" 
                icon={FiHeart} 
                label="Saved Jobs" 
                active={isActive("/candidate/saved-jobs")} 
              />
              <SideLink 
                to="/candidate/recommended-jobs" 
                icon={FiStar} 
                label="Top Matches" 
                active={isActive("/candidate/recommended-jobs")} 
              />
            </>
          )}

          {role === "recruiter" && (
            <>
              <SideLink 
                to="/recruiter/dashboard" 
                icon={FiHome} 
                label="Dashboard" 
                active={isActive("/recruiter/dashboard")} 
              />
              <SideLink 
                to="/recruiter/jobs" 
                icon={FiPlusCircle} 
                label="Post Job" 
                active={isActive("/recruiter/jobs")} 
              />
              <SideLink 
                to="/recruiter/manage-jobs" 
                icon={FiSettings} 
                label="Management" 
                active={isActive("/recruiter/manage-jobs")} 
              />
              <SideLink 
                to="/recruiter/analytics" 
                icon={FiBarChart2} 
                label="Analytics" 
                active={isActive("/recruiter/analytics")} 
              />
              <SideLink 
                to="/recruiter/company" 
                icon={FiBriefcase} 
                label="Company Profile" 
                active={isActive("/recruiter/company")} 
              />
            </>
          )}
        </MenuSection>
      </div>

      {/* Logout Button */}
      <div style={footerStyle}>
        <button onClick={logout} style={logoutButtonStyle}>
          <div style={logoutIconStyle}>
            <FiLogOut size={16} />
          </div>
          <span>Sign Out</span>
          <FiChevronLeft size={14} style={{ opacity: 0.6 }} />
        </button>
      </div>
    </aside>
  );
};

/* ---------- Sub-Components ---------- */

const MenuSection = ({ title, children }) => (
  <nav>
    <div style={sectionTitleStyle}>{title}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {children}
    </div>
  </nav>
);

const SideLink = ({ to, icon: Icon, label, active }) => (
  <Link to={to} style={getLinkStyle(active)}>
    <div style={iconContainerStyle(active)}>
      <Icon size={16} />
    </div>
    <span style={{ flex: 1 }}>{label}</span>
    {active && <FiChevronRight size={14} style={{ opacity: 0.7 }} />}
  </Link>
);

/* ---------- UPDATED STYLES ---------- */

const sidebarStyle = {
  width: 280,
  position: "fixed",
  top: 60, // Matches navbar height
  left: 0,
  height: "calc(100vh - 60px)",
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(249, 250, 251, 0.98))",
  backdropFilter: "blur(20px)",
  borderRight: "1px solid rgba(226, 232, 240, 0.8)",
  display: "flex",
  flexDirection: "column",
  zIndex: 90,
  boxShadow: "4px 0 30px rgba(15, 23, 42, 0.05)",
};

// UPDATED Profile Header
const profileHeaderStyle = {
  padding: "24px 20px 20px",
  margin: "0 16px 16px",
  background: "linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(139, 92, 246, 0.05))",
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  gap: 14,
  border: "1px solid rgba(79, 70, 229, 0.15)",
  position: "relative",
  overflow: "hidden",
  "::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "linear-gradient(90deg, #4f46e5, #8b5cf6)",
  },
};

// UPDATED Avatar
const avatarStyle = {
  width: 44,
  height: 44,
  borderRadius: 12,
  background: "linear-gradient(135deg, #4f46e5, #8b5cf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontSize: 18,
  fontWeight: 700,
  flexShrink: 0,
  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)",
};

// UPDATED User Name
const userNameStyle = {
  fontWeight: 700,
  fontSize: 15,
  color: "#111827",
  marginBottom: 4,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// UPDATED Role Badge
const roleBadgeStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6b7280",
  background: "rgba(255, 255, 255, 0.9)",
  padding: "4px 10px",
  borderRadius: 20,
  border: "1px solid rgba(209, 213, 219, 0.8)",
  display: "inline-block",
  letterSpacing: "0.03em",
};

// UPDATED Notification Badge
const notificationBadgeStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "6px 10px",
  borderRadius: 20,
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "#fff",
  fontSize: 11,
  fontWeight: 800,
  boxShadow: "0 3px 10px rgba(239, 68, 68, 0.3)",
  border: "2px solid rgba(255, 255, 255, 0.9)",
  position: "absolute",
  top: 16,
  right: 16,
};

const sectionTitleStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#9ca3af",
  marginBottom: 16,
  paddingLeft: 8,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

const getLinkStyle = (active) => ({
  padding: "12px 14px",
  borderRadius: 12,
  display: "flex",
  alignItems: "center",
  gap: 14,
  fontSize: 14,
  textDecoration: "none",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  fontWeight: active ? 700 : 500,
  color: active ? "#4f46e5" : "#4b5563",
  background: active 
    ? "linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(139, 92, 246, 0.05))" 
    : "transparent",
  border: active 
    ? "1px solid rgba(79, 70, 229, 0.2)" 
    : "1px solid transparent",
  marginBottom: 4,
  position: "relative",
  overflow: "hidden",
  ":hover": {
    background: active 
      ? "linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(139, 92, 246, 0.08))" 
      : "rgba(79, 70, 229, 0.05)",
    color: active ? "#4f46e5" : "#374151",
    transform: "translateX(6px)",
    borderColor: active 
      ? "rgba(79, 70, 229, 0.25)" 
      : "rgba(209, 213, 219, 0.5)",
  },
  "::before": active ? {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: 4,
    height: 24,
    background: "linear-gradient(180deg, #4f46e5, #8b5cf6)",
    borderRadius: "0 4px 4px 0",
  } : {},
});

const iconContainerStyle = (active) => ({
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: active 
    ? "rgba(79, 70, 229, 0.15)" 
    : "rgba(243, 244, 246, 0.9)",
  color: active ? "#4f46e5" : "#6b7280",
  transition: "all 0.3s ease",
  border: active 
    ? "1px solid rgba(79, 70, 229, 0.2)" 
    : "1px solid rgba(229, 231, 235, 0.8)",
});

const footerStyle = {
  marginTop: "auto",
  padding: "20px 16px",
  borderTop: "1px solid rgba(226, 232, 240, 0.7)",
  background: "rgba(249, 250, 251, 0.5)",
};

const logoutButtonStyle = {
  width: "100%",
  padding: "14px 18px",
  borderRadius: 12,
  border: "1px solid rgba(229, 231, 235, 0.8)",
  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(249, 250, 251, 0.9))",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  fontSize: 14,
  fontWeight: 600,
  color: "#6b7280",
  cursor: "pointer",
  transition: "all 0.3s ease",
  ":hover": {
    background: "linear-gradient(135deg, rgba(254, 242, 242, 0.9), rgba(254, 226, 226, 0.9))",
    color: "#dc2626",
    borderColor: "#fecaca",
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(220, 38, 38, 0.1)",
  },
};

const logoutIconStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(243, 244, 246, 0.9)",
  color: "#6b7280",
  transition: "all 0.3s ease",
  border: "1px solid rgba(229, 231, 235, 0.8)",
};

export default SideBar; 