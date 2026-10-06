import { useState } from "react";
import {
  User,
  Shield,
  Laptop,
  History,
  Lock,
  Mail,
  Building,
  Briefcase,
  Phone,
  FileSpreadsheet,
  Check,
  X,
  AlertCircle,
  Key,
  Smartphone,
  LogOut,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
  SlidersHorizontal
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { TwoFactorModal } from "../components/auth/TwoFactorModal";

export default function ProfilePage() {
  const { user, setUser } = useAuth();

  const [activeTab, setActiveTab] = useState("personal"); // personal | security | devices | activity

  // Personal Info Form State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.name || "Dr. Sarah Jenkins");
  const [email, setEmail] = useState(user?.email || "sarah.jenkins@medverse.hospital");
  const [employeeId, setEmployeeId] = useState(user?.employeeId || "MED-SEC-1042");
  const [department, setDepartment] = useState(user?.department || "Emergency & Cyber Operations");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "SOC Lead Analyst");
  const [phone, setPhone] = useState(user?.phone || "+91 98765 43210");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null); // { type, msg }

  // 2FA & Security Toggles State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [newLoginAlerts, setNewLoginAlerts] = useState(true);
  const [passwordAlerts, setPasswordAlerts] = useState(true);
  const [twoFactorAlerts, setTwoFactorAlerts] = useState(true);
  const [backupCodesGenerated, setBackupCodesGenerated] = useState(false);

  // Active Sessions / Devices State
  const [devices, setDevices] = useState([
    {
      id: "dev-1",
      name: "SOC Station Alpha",
      browser: "Chrome 122.0",
      os: "Windows 11 Enterprise",
      ip: "10.20.1.22",
      lastActive: "Active now",
      isCurrent: true,
      status: "Active"
    },
    {
      id: "dev-2",
      name: "Hospital iPad Pro (ICU Ward)",
      browser: "Safari Mobile 17.2",
      os: "iPadOS 17.2",
      ip: "10.20.4.15",
      lastActive: "2 hours ago",
      isCurrent: false,
      status: "Trusted"
    },
    {
      id: "dev-3",
      name: "Workstation Dell XPS 15",
      browser: "Firefox Enterprise",
      os: "Ubuntu 22.04 LTS",
      ip: "10.20.1.88",
      lastActive: "Yesterday at 18:30",
      isCurrent: false,
      status: "Idle"
    }
  ]);

  // Activity / Audit Logs State
  const [activityLogs] = useState([
    {
      id: "log-1",
      timestamp: "10 Oct 2026, 15:42",
      user: user?.email || "sarah.jenkins@medverse.hospital",
      action: "Successful Login",
      device: "SOC Station Alpha",
      ip: "10.20.1.22",
      status: "Success",
      severity: "info"
    },
    {
      id: "log-2",
      timestamp: "10 Oct 2026, 14:18",
      user: user?.email || "sarah.jenkins@medverse.hospital",
      action: "2FA Verification Passed",
      device: "Hospital iPad Pro",
      ip: "10.20.4.15",
      status: "Success",
      severity: "info"
    },
    {
      id: "log-3",
      timestamp: "09 Oct 2026, 18:30",
      user: user?.email || "sarah.jenkins@medverse.hospital",
      action: "Password Changed",
      device: "Workstation Dell XPS 15",
      ip: "10.20.1.88",
      status: "Success",
      severity: "warning"
    },
    {
      id: "log-4",
      timestamp: "08 Oct 2026, 09:15",
      user: user?.email || "sarah.jenkins@medverse.hospital",
      action: "AI Containment Dispatched",
      device: "SOC Station Alpha",
      ip: "10.20.1.22",
      status: "Success",
      severity: "info"
    }
  ]);

  // Password Requirement Checks
  const passReqs = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword)
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    if (setUser && user) {
      setUser({
        ...user,
        name: fullName,
        email,
        employeeId,
        department,
        jobTitle,
        phone
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (!passReqs.length || !passReqs.uppercase || !passReqs.number) {
      setPasswordStatus({ type: "error", msg: "Please satisfy all password complexity requirements." });
      return;
    }

    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordStatus({ type: "success", msg: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordStatus({ type: "error", msg: err.message || "Failed to update password." });
    }
  };

  const handleRemoveDevice = (devId) => {
    setDevices((prev) => prev.filter((d) => d.id !== devId));
  };

  return (
    <div className="profile-page-wrapper">
      {/* PROFILE HEADER HERO */}
      <div className="profile-header-card">
        <div className="avatar-section">
          <div className="profile-avatar-box">
            {user?.avatar || fullName.substring(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="profile-meta-info">
          <div className="name-row">
            <h2>{fullName}</h2>
            <span className="session-status-badge">
              <ShieldCheck size={13} /> Active Session
            </span>
          </div>

          <div className="badges-pills-row">
            <span className="role-badge-pill">{user?.role || "SOC Lead Analyst"}</span>
            <span className="dept-badge-pill">{department}</span>
            <span className="email-text">{email}</span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="profile-tab-navigation">
        <button
          className={`prof-tab-btn ${activeTab === "personal" ? "active" : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <User size={16} />
          <span>Personal Info</span>
        </button>

        <button
          className={`prof-tab-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Lock size={16} />
          <span>Security & Passwords</span>
        </button>

        <button
          className={`prof-tab-btn ${activeTab === "devices" ? "active" : ""}`}
          onClick={() => setActiveTab("devices")}
        >
          <Laptop size={16} />
          <span>Device Management</span>
        </button>

        <button
          className={`prof-tab-btn ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => setActiveTab("activity")}
        >
          <History size={16} />
          <span>Activity Audit Log</span>
        </button>
      </div>

      {/* TAB CONTENT CONTAINER */}
      <div className="profile-tab-content">
        {/* TAB 1: PERSONAL INFORMATION */}
        {activeTab === "personal" && (
          <div className="profile-card-box">
            <div className="card-top-bar">
              <div>
                <h3 className="card-title-text">Personal Information</h3>
                <p className="card-subtitle-text">Manage your SOC identity, contact details, and hospital wing credentials.</p>
              </div>

              {!isEditingProfile ? (
                <button
                  className="secondary-button"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="btn-group">
                  <button
                    className="secondary-button"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary-button" onClick={handleSaveProfile}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="personal-info-grid">
              <div className="form-field-group">
                <label>Full Name</label>
                <div className="field-input-wrapper">
                  <User size={16} className="field-icon" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Work Email</label>
                <div className="field-input-wrapper">
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Employee ID</label>
                <div className="field-input-wrapper">
                  <FileSpreadsheet size={16} className="field-icon" />
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Department Wing</label>
                <div className="field-input-wrapper">
                  <Building size={16} className="field-icon" />
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Designation / Job Title</label>
                <div className="field-input-wrapper">
                  <Briefcase size={16} className="field-icon" />
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label>Phone Number</label>
                <div className="field-input-wrapper">
                  <Phone size={16} className="field-icon" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECURITY & PASSWORDS */}
        {activeTab === "security" && (
          <div className="security-dual-grid">
            {/* CHANGE PASSWORD CARD */}
            <div className="profile-card-box">
              <h3 className="card-title-text">Change Password</h3>
              <p className="card-subtitle-text">Ensure your account is protected using a strong enterprise password.</p>

              {passwordStatus && (
                <div className={`status-banner-alert ${passwordStatus.type}`}>
                  <span>{passwordStatus.msg}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="form-stack-spacing">
                <div className="form-field-group">
                  <label>Current Password</label>
                  <div className="field-input-wrapper">
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="pass-toggle-eye"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="form-field-group">
                  <label>New Password</label>
                  <div className="field-input-wrapper">
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showNewPass ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="pass-toggle-eye"
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {newPassword && (
                  <div className="pass-requirements-checklist">
                    <p className="req-title">Password Requirements:</p>
                    <div className="req-item-row">
                      <span className={passReqs.length ? "met" : "unmet"}>
                        {passReqs.length ? <Check size={13} /> : "•"} At least 8 characters
                      </span>
                      <span className={passReqs.uppercase ? "met" : "unmet"}>
                        {passReqs.uppercase ? <Check size={13} /> : "•"} Uppercase letter (A-Z)
                      </span>
                    </div>
                    <div className="req-item-row">
                      <span className={passReqs.lowercase ? "met" : "unmet"}>
                        {passReqs.lowercase ? <Check size={13} /> : "•"} Lowercase letter (a-z)
                      </span>
                      <span className={passReqs.number ? "met" : "unmet"}>
                        {passReqs.number ? <Check size={13} /> : "•"} At least 1 number (0-9)
                      </span>
                    </div>
                  </div>
                )}

                <div className="form-field-group">
                  <label>Confirm New Password</label>
                  <div className="field-input-wrapper">
                    <Lock size={16} className="field-icon" />
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="pass-toggle-eye"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="primary-button margin-top-btn">
                  Update Password
                </button>
              </form>
            </div>

            {/* 2FA & SECURITY SETTINGS CARD */}
            <div className="profile-card-box">
              <h3 className="card-title-text">Two-Factor Authentication (2FA)</h3>
              <p className="card-subtitle-text">Multi-factor authentication status and recovery tokens.</p>

              <div className="setting-control-row">
                <div>
                  <strong className="setting-heading">Authenticator App (TOTP)</strong>
                  <p className="setting-desc">Status: <span className="text-success-bold">Enabled</span> (Google / Microsoft Authenticator)</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => setIs2FAModalOpen(true)}
                >
                  Configure 2FA
                </button>
              </div>

              <div className="setting-control-row border-top">
                <div>
                  <strong className="setting-heading">Emergency Backup Codes</strong>
                  <p className="setting-desc">Use backup codes if access to authenticator app is lost.</p>
                </div>

                <button
                  className="secondary-button"
                  onClick={() => alert("8 Active Backup Codes Available. Check 2FA config.")}
                >
                  Generate Codes
                </button>
              </div>

              <hr className="divider-hr" />

              <h3 className="card-title-text margin-top-section">Security Notifications</h3>
              
              <div className="setting-control-row">
                <div>
                  <strong className="setting-heading">New Device Login Alerts</strong>
                  <p className="setting-desc">Receive immediate email alerts on unknown device logins.</p>
                </div>
                <input
                  type="checkbox"
                  checked={newLoginAlerts}
                  onChange={(e) => setNewLoginAlerts(e.target.checked)}
                  className="custom-toggle-checkbox"
                />
              </div>

              <div className="setting-control-row">
                <div>
                  <strong className="setting-heading">Password Change Alerts</strong>
                  <p className="setting-desc">Notify work email whenever password modification occurs.</p>
                </div>
                <input
                  type="checkbox"
                  checked={passwordAlerts}
                  onChange={(e) => setPasswordAlerts(e.target.checked)}
                  className="custom-toggle-checkbox"
                />
              </div>

              <div className="setting-control-row">
                <div>
                  <strong className="setting-heading">2FA Modification Alerts</strong>
                  <p className="setting-desc">Alert SOC lead when 2FA parameters are altered.</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorAlerts}
                  onChange={(e) => setTwoFactorAlerts(e.target.checked)}
                  className="custom-toggle-checkbox"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DEVICE MANAGEMENT */}
        {activeTab === "devices" && (
          <div className="profile-card-box">
            <div className="card-top-bar">
              <div>
                <h3 className="card-title-text">Device Management</h3>
                <p className="card-subtitle-text">Authorized workstations and mobile devices signed into your SOC account.</p>
              </div>
            </div>

            <div className="devices-compact-list">
              {devices.map((dev) => (
                <div key={dev.id} className="device-compact-card">
                  <div className="dev-icon-badge">
                    <Laptop size={20} className="text-cyan-icon" />
                  </div>

                  <div className="dev-info-col">
                    <div className="dev-name-row">
                      <strong>{dev.name}</strong>
                      {dev.isCurrent && <span className="current-dev-badge">Current Device</span>}
                    </div>
                    <p className="dev-subtext">
                      {dev.os} • {dev.browser} • IP: {dev.ip}
                    </p>
                    <small className="dev-time-text">Last active: {dev.lastActive}</small>
                  </div>

                  <div className="dev-action-col">
                    {!dev.isCurrent ? (
                      <button
                        className="secondary-button danger small-btn"
                        onClick={() => handleRemoveDevice(dev.id)}
                      >
                        Sign Out
                      </button>
                    ) : (
                      <span className="active-now-text">Active Session</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ACTIVITY AUDIT LOG */}
        {activeTab === "activity" && (
          <div className="profile-card-box">
            <div className="card-top-bar">
              <div>
                <h3 className="card-title-text">Security Activity Audit Log</h3>
                <p className="card-subtitle-text">Chronological record of authentication and SOC operations.</p>
              </div>
            </div>

            <div className="audit-table-container">
              <table className="audit-logs-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action Event</th>
                    <th>Device</th>
                    <th>IP Address</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((log) => (
                    <tr key={log.id}>
                      <td><code>{log.timestamp}</code></td>
                      <td><strong>{log.action}</strong></td>
                      <td>{log.device}</td>
                      <td><code>{log.ip}</code></td>
                      <td>
                        <span className="status-pill-success">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TwoFactorModal
        isOpen={is2FAModalOpen}
        onClose={() => setIs2FAModalOpen(false)}
        onComplete={() => setTwoFactorEnabled(true)}
      />
    </div>
  );
}
