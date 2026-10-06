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
  AlertCircle,
  ArrowRight,
  KeyRound,
  BadgeCheck,
  Briefcase,
  Phone,
  FileSpreadsheet
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ROLES, DEPARTMENTS } from "../types";
import { OTPModal } from "../components/auth/OTPModal";
import { ForgotPasswordModal } from "../components/auth/ForgotPasswordModal";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterPage = location.pathname === "/register";
  const [activeTab, setActiveTab] = useState(isRegisterPage ? "register" : "login");

  // Form states
  const [email, setEmail] = useState("sarah.jenkins@medverse.hospital");
  const [password, setPassword] = useState("medverse2026!");
  const [role, setRole] = useState(ROLES.SOC_LEAD);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Register extra fields
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("Cybersecurity");
  const [jobTitle, setJobTitle] = useState("Senior Security Analyst");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Modals & States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

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
    return { score: 100, label: "Enterprise Secure", color: "#10b981" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setAuthNotice("");

    if (!email || !password) {
      setErrorMsg("Please provide your hospital work email address and password.");
      return;
    }

    if (activeTab === "register") {
      if (!fullName) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (activeTab === "login") {
        await login(email, password, role);
        navigate("/dashboard");
      } else {
        // Register flow
        const result = await register({
          name: fullName,
          email,
          password,
          role,
          department,
          employeeId,
          jobTitle,
          phone: phoneNumber
        });

        if (result?.requiresAuthorization) {
          setAuthNotice("Your account has been created and requires authorization.");
          setIsOTPModalOpen(true);
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page enterprise-auth">
      <div className="auth-card-container minimal-enterprise">
        {/* BRANDING HEADER */}
        <div className="auth-brand-header">
          <div className="brand-logo minimal">
            <Shield className="brand-icon" size={26} />
          </div>
          <h1 className="brand-title">MED-VERSE</h1>
          <p className="auth-subtitle">Hospital Cyber Digital Twin & SOC Portal</p>
        </div>

        {/* TAB SWITCHER */}
        <div className="auth-tabs minimal">
          <button
            className={`auth-tab ${activeTab === "login" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("login");
              setErrorMsg("");
              setAuthNotice("");
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
              setAuthNotice("");
            }}
          >
            <User size={15} />
            <span>Register Account</span>
          </button>
        </div>

        {/* MESSAGES */}
        {errorMsg && (
          <div className="auth-error-banner">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {authNotice && (
          <div className="auth-notice-banner">
            <BadgeCheck size={16} className="text-cyan" />
            <span>{authNotice}</span>
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="auth-form enterprise">
          {activeTab === "register" && (
            <>
              <div className="auth-input-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Dr. Krishna Gandhi"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-input-group">
                  <label>Employee ID</label>
                  <div className="input-wrapper">
                    <FileSpreadsheet size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="EMP-9021"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Department</label>
                  <div className="input-wrapper">
                    <Building size={16} className="input-icon" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="auth-form-row">
                <div className="auth-input-group">
                  <label>Job Title</label>
                  <div className="input-wrapper">
                    <Briefcase size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="Senior Security Analyst"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Phone Number</label>
                  <div className="input-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="text"
                      placeholder="+1 (555) 019-2831"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
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

            {password && activeTab === "register" && (
              <div className="strength-bar-container">
                <div className="strength-track">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${strength.score}%`,
                      backgroundColor: strength.color
                    }}
                  ></div>
                </div>
                <span className="strength-text" style={{ color: strength.color }}>
                  Password Strength: <strong>{strength.label}</strong>
                </span>
              </div>
            )}
          </div>

          {activeTab === "register" && (
            <div className="auth-input-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="auth-input-group">
            <label>{activeTab === "register" ? "Requested Role" : "Assigned SOC Role"}</label>
            <div className="input-wrapper">
              <ShieldCheck size={16} className="input-icon" />
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {Object.values(ROLES).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === "login" && (
            <div className="auth-options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember this device</span>
              </label>

              <button
                type="button"
                className="forgot-link-btn"
                onClick={() => setIsForgotPasswordOpen(true)}
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="primary-button auth-submit-btn"
            disabled={isSubmitting}
          >
            <span>
              {isSubmitting
                ? "Authenticating..."
                : activeTab === "login"
                ? "Access Cyber Command"
                : "Submit Registration"}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* FOOTER NOTICE */}
        <div className="auth-footer-notice minimal">
          <span>Protected by multi-factor authentication and role-based access controls.</span>
        </div>
      </div>

      {/* MODALS */}
      <OTPModal
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        recipient={email}
        onSuccess={() => navigate("/dashboard")}
      />

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}
