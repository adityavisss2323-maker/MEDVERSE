import { useState, useEffect } from "react";
import { QrCode, Key, ShieldCheck, Copy, Check, X, AlertCircle } from "lucide-react";
import { twoFactorService } from "../../services/twoFactorService";

export function TwoFactorModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1); // 1: QR setup, 2: Backup codes
  const [secretData, setSecretData] = useState(null);
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      twoFactorService.generateSecret().then((data) => setSecretData(data));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit authenticator code.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await twoFactorService.enable2FA("authenticator", code);
      if (res.success) {
        setBackupCodes(res.backupCodes);
        setStep(2);
      }
    } catch (err) {
      setErrorMsg(err.message || "2FA verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copySecretKey = () => {
    if (secretData?.secretKey) {
      navigator.clipboard.writeText(secretData.secretKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box two-factor-modal">
        <div className="modal-header">
          <ShieldCheck size={20} className="text-cyan" />
          <h3>Two-Factor Authentication Setup</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <>
              <p className="modal-desc">
                Scan the QR code below using your preferred Authenticator App (Google Authenticator, Microsoft Authenticator, 1Password, etc.).
              </p>

              {errorMsg && (
                <div className="auth-error-banner">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="qr-container">
                <div className="qr-box">
                  <QrCode size={120} className="qr-icon-placeholder" />
                </div>

                <div className="secret-key-box">
                  <div className="key-info">
                    <Key size={14} />
                    <span>Secret Key:</span>
                  </div>
                  <code>{secretData?.secretKey || "MEDV-SOC-7829-XQ91-K28L"}</code>
                  <button className="icon-btn-inline" onClick={copySecretKey}>
                    {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <form onSubmit={handleVerify2FA} className="verify-2fa-form">
                <label>Enter 6-digit Code from Authenticator App</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="auth-code-input"
                />

                <button
                  type="submit"
                  className="primary-button full-width"
                  disabled={isSubmitting || code.length !== 6}
                >
                  {isSubmitting ? "Enabling 2FA..." : "Enable 2FA"}
                </button>
              </form>
            </>
          ) : (
            <div className="backup-codes-step">
              <div className="success-badge-header">
                <ShieldCheck size={32} className="text-success" />
                <h4>2FA Enabled Successfully</h4>
              </div>

              <p className="modal-desc">
                Save these backup emergency codes in a secure location. You can use these to recover access if you lose your phone or authenticator app.
              </p>

              <div className="backup-codes-grid">
                {backupCodes.map((bCode, idx) => (
                  <code key={idx}>{bCode}</code>
                ))}
              </div>

              <button
                className="primary-button full-width"
                onClick={() => {
                  onComplete();
                  onClose();
                }}
              >
                I Have Saved My Backup Codes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
