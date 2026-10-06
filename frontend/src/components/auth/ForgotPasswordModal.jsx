import { useState } from "react";
import { KeyRound, Mail, Lock, CheckCircle2, X, AlertCircle } from "lucide-react";
import { authService } from "../../services/authService";
import { otpService } from "../../services/otpService";

export function ForgotPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setErrorMsg("");

    try {
      await authService.resetPasswordRequest(email);
      setStep(2);
    } catch (err) {
      setErrorMsg("Unable to process request. Verify work email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrorMsg("Please enter 6-digit verification code.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await otpService.verifyOtp(email, otp);
      if (res.success) {
        setStep(3);
      } else {
        setErrorMsg(res.error);
      }
    } catch (err) {
      setErrorMsg("OTP verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await authService.changePassword({ currentPassword: "temp", newPassword });
      setStep(4);
    } catch (err) {
      setErrorMsg("Password reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box forgot-password-modal">
        <div className="modal-header">
          <KeyRound size={20} className="text-cyan" />
          <h3>Reset Password</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {errorMsg && (
            <div className="auth-error-banner">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendResetEmail}>
              <p className="modal-desc">
                Enter your hospital work email address to receive password reset verification instructions.
              </p>
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
              <button
                type="submit"
                className="primary-button full-width margin-top"
                disabled={isLoading}
              >
                {isLoading ? "Dispatching OTP..." : "Send Verification OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <p className="modal-desc">
                We sent a 6-digit OTP code to <strong>{email}</strong>.
              </p>
              <div className="auth-input-group">
                <label>6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="auth-code-input"
                  required
                />
              </div>
              <button
                type="submit"
                className="primary-button full-width margin-top"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleUpdatePassword}>
              <div className="auth-input-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group margin-top-sm">
                <label>Confirm New Password</label>
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

              <button
                type="submit"
                className="primary-button full-width margin-top"
                disabled={isLoading}
              >
                {isLoading ? "Updating Password..." : "Set New Password"}
              </button>
            </form>
          )}

          {step === 4 && (
            <div className="success-step-container">
              <CheckCircle2 size={44} className="text-success" />
              <h4>Password Updated Successfully</h4>
              <p>Your SOC password has been changed. You may now sign in using your new credentials.</p>
              <button className="primary-button full-width" onClick={onClose}>
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
