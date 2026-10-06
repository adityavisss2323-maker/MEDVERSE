import { useState } from "react";
import { Laptop, Clock, ShieldAlert, CheckCircle, XCircle, X } from "lucide-react";

export function NewDeviceModal({ isOpen, deviceInfo, onApprove, onDeny }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentDevice = deviceInfo || {
    device: "Desktop / Laptop",
    browser: "Chrome 122.0",
    os: "Windows 11 Enterprise",
    ip: "10.20.1.45 (Hospital Subnet)",
    timestamp: new Date().toLocaleTimeString()
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 500));
    setIsSubmitting(false);
    onApprove();
  };

  const handleDeny = async () => {
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 400));
    setIsSubmitting(false);
    onDeny();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-box new-device-modal">
        <div className="modal-header warning">
          <ShieldAlert size={22} className="text-warning" />
          <h3>NEW DEVICE DETECTED</h3>
          <button className="close-btn" onClick={onDeny}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            An authentication attempt was initiated from an unrecognized device or location. Please approve this device to proceed.
          </p>

          <div className="device-spec-card">
            <div className="spec-row">
              <Laptop size={16} className="spec-icon" />
              <div>
                <strong>Device & OS:</strong>
                <span>{currentDevice.os} • {currentDevice.browser}</span>
              </div>
            </div>

            <div className="spec-row">
              <Clock size={16} className="spec-icon" />
              <div>
                <strong>Login Timestamp:</strong>
                <span>{currentDevice.timestamp}</span>
              </div>
            </div>

            <div className="spec-row">
              <span className="spec-bullet">•</span>
              <div>
                <strong>Source IP / Subnet:</strong>
                <span>{currentDevice.ip}</span>
              </div>
            </div>
          </div>

          <div className="new-device-actions">
            <button
              className="secondary-button danger flex-1"
              onClick={handleDeny}
              disabled={isSubmitting}
            >
              <XCircle size={16} />
              <span>Deny Access</span>
            </button>

            <button
              className="primary-button flex-1"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              <CheckCircle size={16} />
              <span>Approve Device</span>
            </button>
          </div>
        </div>

        <div className="modal-footer text-muted">
          <small>Denied logins automatically log a security event in SOC Audit Log.</small>
        </div>
      </div>
    </div>
  );
}
