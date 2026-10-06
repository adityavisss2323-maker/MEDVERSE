import { useState, useEffect, useRef } from "react";
import { ShieldCheck, ArrowRight, RefreshCw, X, AlertCircle } from "lucide-react";
import { otpService } from "../../services/otpService";

export function OTPModal({ isOpen, onClose, recipient, onSuccess }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    let timer;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setErrorMsg("");

    // Auto-advance to next digit input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await otpService.verifyOtp(recipient, code);
      if (res.success) {
        setSuccessMsg("Identity verified successfully!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.error || "Invalid verification code.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setCountdown(60);
    setDigits(["", "", "", "", "", ""]);
    setErrorMsg("");
    try {
      await otpService.resendOtp(recipient);
      setSuccessMsg("New code dispatched to work email.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to resend code.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box otp-modal-box">
        <div className="modal-header">
          <div className="otp-icon-header">
            <ShieldCheck size={24} className="text-cyan" />
          </div>
          <h3>Verify Your Identity</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="otp-subtitle">
            We sent a 6-digit security verification code to your registered work email address.
          </p>

          {errorMsg && (
            <div className="auth-error-banner">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-success-banner">
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="otp-form">
            <div className="otp-digits-container">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="otp-digit-input"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div className="otp-timer-row">
              {countdown > 0 ? (
                <span className="timer-text">
                  Code expires in <strong>{countdown}s</strong>
                </span>
              ) : (
                <span className="expired-text">Code expired. Please resend.</span>
              )}

              <button
                type="button"
                className="resend-btn"
                onClick={handleResend}
                disabled={countdown > 0}
              >
                <RefreshCw size={13} />
                <span>Resend Code</span>
              </button>
            </div>

            <button
              type="submit"
              className="primary-button full-width"
              disabled={isSubmitting || digits.join("").length !== 6}
            >
              <span>{isSubmitting ? "Verifying..." : "Verify Identity"}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="modal-footer text-muted">
          <small>Protected by multi-factor authentication & security audit logs.</small>
        </div>
      </div>
    </div>
  );
}
