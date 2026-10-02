import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertTriangle, CheckCircle, Info, Sparkles, ArrowRight, Play } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { ExplainButton } from "../common/ExplainButton";
import { departments } from "../../data/departments";

export function SimpleDashboardView({ onOpenStory }) {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="simple-dashboard-view">
      <div className="simple-status-banner warning">
        <div className="status-banner-left">
          <div className="status-banner-icon">
            <AlertTriangle size={32} />
          </div>
          <div>
            <span className="banner-eyebrow">{t("simpleView.statusTitle")}</span>
            <h2>{t("simpleView.attentionMessage")}</h2>
            <p>Security systems are actively monitoring and containing anomalous network traffic.</p>
          </div>
        </div>

        <div className="status-banner-right">
          <button className="explain-story-btn" onClick={onOpenStory}>
            <Sparkles size={16} />
            <span>{t("simpleView.explainButton")}</span>
          </button>
        </div>
      </div>

      <div className="simple-cards-grid">
        <div className="simple-card">
          <div className="simple-card-header">
            <Info size={20} className="blue-icon" />
            <h3>{t("simpleView.recentIssueTitle")}</h3>
          </div>
          <p className="simple-card-text">{t("simpleView.recentIssue")}</p>
          <div className="simple-card-footer">
            <span className="location-tag">Location: Emergency & Administration</span>
          </div>
        </div>

        <div className="simple-card">
          <div className="simple-card-header">
            <CheckCircle size={20} className="green-icon" />
            <h3>{t("simpleView.actionTakenTitle")}</h3>
          </div>
          <p className="simple-card-text">{t("simpleView.actionTaken")}</p>
          <div className="simple-card-footer">
            <span className="status-tag success">Patient Care Uninterrupted</span>
          </div>
        </div>
      </div>

      <div className="simple-departments-section">
        <div className="section-header">
          <div>
            <h3>Hospital Department Security Overview</h3>
            <p className="section-subtitle">Real-time status across hospital wings</p>
          </div>
          <ExplainButton
            title="Department Security Status"
            explanation="Shows whether clinical equipment and computers in each hospital section are working safely."
            simpleConcept="Green means normal operations. Yellow/Red means security filters are active."
          />
        </div>

        <div className="department-cards-grid">
          {departments.map((dept) => (
            <div key={dept.id} className={`dept-simple-card ${dept.status}`}>
              <div className="dept-top">
                <span className="dept-code">{dept.code}</span>
                <span className={`dept-badge ${dept.status}`}>
                  {dept.status === "normal" ? "🟢 Normal" : dept.status === "warning" ? "🟡 Monitoring" : "🔴 Attention Required"}
                </span>
              </div>
              <h4>{dept.name}</h4>
              <p>{dept.description}</p>
              <div className="dept-stats">
                <span>{dept.criticalAssets} Protected Devices</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
