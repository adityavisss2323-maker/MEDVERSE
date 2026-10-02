import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Mic, ChevronDown, HelpCircle, LogOut, Shield, User } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
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
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
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
          placeholder={t("header.searchPlaceholder")}
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
          <span>{t("header.explainMode")}</span>
        </button>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-button voice-button"
          title={t("header.voiceSoc")}
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

        {/* USER PROFILE & DROPDOWN MENU */}
        <div className="profile-wrapper" style={{ position: "relative" }}>
          <div className="user-profile" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="avatar">{user?.avatar || "SA"}</div>
            <div className="user-info">
              <strong>{user?.name || "SOC Analyst"}</strong>
              <span>{user?.department || "Emergency Operations"}</span>
            </div>
            <ChevronDown size={16} />
          </div>

          {isMenuOpen && (
            <div className="user-profile-dropdown" onClick={(e) => e.stopPropagation()}>
              <div className="dropdown-user-header">
                <strong>{user?.name}</strong>
                <span className="user-role-badge">{user?.role}</span>
                <small>{user?.email}</small>
              </div>
              <hr className="dropdown-divider" />
              <button
                className="dropdown-item logout-btn"
                onClick={handleLogout}
              >
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