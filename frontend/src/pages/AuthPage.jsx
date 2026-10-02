import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Shield,
  Lock,
  Mail,
  User,
  Building,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register, loginAsPreset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab mode: 'login' or 'register'
  const isRegisterPage = location.pathname === "/register";
  const [activeTab, setActiveTab] = useState(isRegisterPage ? "register" : "login");

  // Form states - Pre-filled with default authorized credentials for fast authentication
  const [name, setName] = useState("");
  const [email, setEmail] = useState("sarah.jenkins@medverse.hospital");
  const [password, setPassword] = useState("medverse2026!");
  const [role, setRole] = useState("SOC Lead Analyst");
  const [department, setDepartment] = useState("Emergency Operations");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Password Strength Calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Empty", color: "#64748b" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 25, label: "Weak", color: "#ef4444" };
    if (score === 2) return { score: 50, label: "Moderate", color: "#f59e0b" };
    if (score === 3) return { score: 75, label: "Strong", color: "#06b6d4" };
    return { score: 100, label: "Cyber Secure", color: "#10b981" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please provide both email address and password.");
      return;
    }

    if (activeTab === "register" && !name) {
      setErrorMsg("Please enter your full name for SOC registration.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === "login") {
        await login(email, password, role);
      } else {
        await register({ name, email, password, role, department });
      }
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg("Authentication failed. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* BACKGROUND PARTICLES & GLOW EFFECT */}
      <div className="auth-glow-bg">
        <div className="glow-circle cyan"></div>
        <div className="glow-circle teal"></div>
      </div>

      <div className="auth-card-container">
        {/* BRANDING HEADER */}
        <div className="auth-brand-header">
          <div className="brand-logo">
            <Shield className="brand-icon" size={28} />
          </div>
          <h1>MED-VERSE</h1>
          <p className="auth-subtitle">Hospital Cyber Digital Twin & SOC Portal</p>
        </div>

        {/* TAB SWITCHER */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
            }}
          >
            <KeyRound size={15} />
            <span>Sign In</span>
          </button>

          <button
            className={`auth-tab ${activeTab === "register" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("register");
              setErrorMsg("");
            }}
          >
            <User size={15} />
            <span>Register Account</span>
          </button>
        </div>

        {/* ERROR ALERT */}
        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="auth-form">
          {activeTab === "register" && (
            <div className="auth-input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label>Hospital Work Email</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                placeholder="name@medverse.hospital"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-pass-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* PASSWORD STRENGTH BAR */}
            {password && activeTab === "register" && (
              <div className="strength-bar-container">
                <div className="strength-track">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${strength.score}%`,
                      backgroundColor: strength.color,
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: strength.color }}>
                  Password Strength: <strong>{strength.label}</strong>
                </span>
              </div>
            )}
          </div>

          <div className="auth-form-row">
            <div className="auth-input-group">
              <label>Assigned SOC Role</label>
              <div className="input-wrapper">
                <ShieldCheck size={16} className="input-icon" />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="SOC Lead Analyst">🛡️ SOC Lead Analyst</option>
                  <option value="Hospital CISO & Executive Director">🏥 Hospital CISO & Executive</option>
                  <option value="IT Security Administrator">💻 IT Security Admin</option>
                  <option value="Emergency MD / Clinical Staff">🚑 Emergency MD Staff</option>
                </select>
              </div>
            </div>

            {activeTab === "register" && (
              <div className="auth-input-group">
                <label>Department Wing</label>
                <div className="input-wrapper">
                  <Building size={16} className="input-icon" />
                  <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                    <option value="Emergency Operations">Emergency Dept</option>
                    <option value="Administration & EHR">Administration Wing</option>
                    <option value="ICU & Critical Care">ICU IoMT Wing</option>
                    <option value="Radiology & Imaging">Radiology Subnet</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {activeTab === "login" && (
            <>
              <div className="auth-options-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember session</span>
                </label>

                <span className="mfa-badge">
                  <ShieldCheck size={13} /> 2FA Encrypted
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px", margin: "14px 0 6px 0" }}>
                <button
                  type="button"
                  onClick={() => {
                    loginAsPreset("analyst");
                    navigate("/dashboard");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    background: "rgba(6, 182, 212, 0.12)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "8px",
                    color: "#06b6d4",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <Shield size={14} /> Quick Demo Analyst
                </button>

                <button
                  type="button"
                  onClick={() => {
                    loginAsPreset("executive");
                    navigate("/dashboard");
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    background: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "8px",
                    color: "#10b981",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <ShieldCheck size={14} /> Quick Demo CISO
                </button>
              </div>
            </>
          )}

          <button type="submit" className="primary-button auth-submit-btn" disabled={isSubmitting}>
            <span>{isSubmitting ? "Authenticating..." : activeTab === "login" ? "Access Cyber Command" : "Create SOC Account"}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* FOOTER AUDIT NOTICE */}
        <div className="auth-footer-notice">
          <CheckCircle2 size={13} />
          <span>HIPAA & DPDP Compliant 256-Bit Encrypted SOC Authorization</span>
        </div>
      </div>
    </div>
  );
}
