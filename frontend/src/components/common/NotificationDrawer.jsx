import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ShieldAlert, Info, ArrowRight, CheckCircle } from "lucide-react";
import { groupedNotifications } from "../../data/notifications";
import { useApp } from "../../context/AppContext";

export function NotificationDrawer() {
  const { isNotificationOpen, setIsNotificationOpen } = useApp();
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [acknowledgedIds, setAcknowledgedIds] = useState([]);
  const navigate = useNavigate();

  if (!isNotificationOpen) return null;

  const filteredNotifs = (groupedNotifications || []).filter((item) => {
    if (filterSeverity === "all") return true;
    return (item?.severity || "").toLowerCase() === filterSeverity;
  });

  const handleAck = (id, e) => {
    e.stopPropagation();
    setAcknowledgedIds((prev) => [...prev, id]);
  };

  return (
    <div className="drawer-overlay" onClick={() => setIsNotificationOpen(false)}>
      <div className="notification-drawer-card" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <h3>SOC Notifications</h3>
            <p className="drawer-subtitle">Smart Grouped Alert Center</p>
          </div>
          <button className="close-btn" onClick={() => setIsNotificationOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="alert-fatigue-notice">
          <Info size={16} />
          <span>Smart grouping active: 24 raw events grouped into 3 campaign clusters.</span>
        </div>

        <div className="notif-filter-row">
          <button className={`notif-tab ${filterSeverity === "all" ? "active" : ""}`} onClick={() => setFilterSeverity("all")}>
            All ({groupedNotifications.length})
          </button>
          <button className={`notif-tab ${filterSeverity === "critical" ? "active" : ""}`} onClick={() => setFilterSeverity("critical")}>
            Critical
          </button>
          <button className={`notif-tab ${filterSeverity === "high" ? "active" : ""}`} onClick={() => setFilterSeverity("high")}>
            High
          </button>
          <button className={`notif-tab ${filterSeverity === "medium" ? "active" : ""}`} onClick={() => setFilterSeverity("medium")}>
            Medium
          </button>
        </div>

        <div className="notification-list">
          {filteredNotifs.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>No notifications match the selected filter.</p>
          ) : (
            filteredNotifs.map((item) => {
              const sev = (item?.severity || "info").toLowerCase();
              const isAcked = acknowledgedIds.includes(item.id);
              return (
                <div key={item.id} className={`notification-item ${sev}`} style={{ opacity: isAcked ? 0.6 : 1 }}>
                  <div className="notif-top">
                    <div className="notif-badge-wrap">
                      <ShieldAlert size={16} className={`icon-${sev}`} />
                      <span className="notif-severity">{item.severity || "Info"}</span>
                    </div>
                    <span className="notif-time">{item.timestamp}</span>
                  </div>

                  <h4 className="notif-title">{item.title}</h4>
                  <p className="notif-asset">{item.assetName} • {item.count} correlated events</p>
                  <p className="notif-summary">{item.summary}</p>

                  <div className="notif-actions">
                    {!isAcked && (
                      <button className="notif-btn" onClick={(e) => handleAck(item.id, e)} style={{ background: "rgba(255,255,255,0.05)" }}>
                        <CheckCircle size={14} />
                        <span>Acknowledge</span>
                      </button>
                    )}
                    <button
                      className="notif-btn"
                      onClick={() => {
                        setIsNotificationOpen(false);
                        navigate("/incidents");
                      }}
                    >
                      <span>{item.action}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
