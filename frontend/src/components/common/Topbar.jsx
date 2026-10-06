import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Mic,
  ChevronDown,
  HelpCircle,
  LogOut,
  User,
  Shield,
  Lock,
  Laptop,
  History,
  ShieldCheck
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { usePermissions } from "../../hooks/usePermissions";
import { ModeSelector } from "./ModeSelector";

function Topbar() {
  const {
    searchQuery,
    setSearchQuery,
    setIsCommandPaletteOpen,
    setIsVoiceSocOpen,
    setIsNotificationOpen,
    explainMode,
    setExplainMode,
  } = useApp();

  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { isManagementAuthorized } = usePermissions();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNav = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="topbar">
      <div
        className="search-box"
        onClick={() => setIsCommandPaletteOpen(true)}
        title="Click or press Cmd+K to open Command Palette"
      >
        <Search size={18} />
        <input
          type="text"
          placeholder={t("header.searchPlaceholder") || "Search SOC assets, alerts, incidents..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={(e) => {
            e.stopPropagation();
            setIsCommandPaletteOpen(true);
          }}
        />
        <span className="search-shortcut">⌘ K</span>
      </div>

      <div className="topbar-center">
        <ModeSelector />

        <button
          className={`explain-mode-toggle ${explainMode ? "active" : ""}`}
          onClick={() => setExplainMode(!explainMode)}
          title="Toggle Global Explain Mode to show simple guided help cards"
        >
          <HelpCircle size={15} />
          <span>{t("header.explainMode") || "Explain Mode"}</span>
        </button>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-button voice-button"
          title={t("header.voiceSoc") || "Voice SOC"}
          onClick={() => setIsVoiceSocOpen(true)}
        >
          <Mic size={18} />
        </button>

        <button
          className="icon-button notification-button"
          title="Notifications"
          onClick={() => setIsNotificationOpen(true)}
        >
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        {/* USER PROFILE & ENTERPRISE DROPDOWN MENU */}
        <div className="profile-wrapper" style={{ position: "relative" }}>
          <div className="user-profile" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="avatar">{user?.avatar || "SJ"}</div>
            <div className="user-info">
              <strong>{user?.name || "Dr. Sarah Jenkins"}</strong>
              <span>{user?.role || "SOC Lead Analyst"}</span>
            </div>
            <ChevronDown size={16} />
          </div>

          {isMenuOpen && (
            <div
              className="user-profile-dropdown enterprise-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dropdown-user-header">
                <strong>{user?.name || "Dr. Sarah Jenkins"}</strong>
                <span className="user-role-badge">{user?.role || "SOC Lead Analyst"}</span>
                <small>{user?.email || "sarah.jenkins@medverse.hospital"}</small>
              </div>

              <hr className="dropdown-divider" />

              <div className="dropdown-menu-list">
                <button
                  className="dropdown-item"
                  onClick={() => handleNav("/profile")}
                >
                  <User size={15} />
                  <span>My Profile</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => handleNav("/profile")}
                >
                  <Lock size={15} />
                  <span>Security & Passwords</span>
                </button>

                <button
                  className="dropdown-item"
                  onClick={() => handleNav("/profile")}
                >
                  <Laptop size={15} />
                  <span>Device Management</span>
                </button>

                {isManagementAuthorized() && (
                  <button
                    className="dropdown-item highlight"
                    onClick={() => handleNav("/authorization")}
                  >
                    <ShieldCheck size={15} />
                    <span>Authorized Access</span>
                  </button>
                )}

                <button
                  className="dropdown-item"
                  onClick={() => handleNav("/profile")}
                >
                  <History size={15} />
                  <span>Activity Audit Log</span>
                </button>
              </div>

              <hr className="dropdown-divider" />

              <button className="dropdown-item logout-btn" onClick={handleLogout}>
                <LogOut size={15} />
                <span>Sign Out of SOC</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;