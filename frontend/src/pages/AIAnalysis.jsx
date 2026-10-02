import { useEffect, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  Info
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";
import { ExplainButton } from "../components/common/ExplainButton";
import { SeverityBadge } from "../components/common/StatusBadge";
import { API_ENDPOINTS } from "../services/api";

export default function AIAnalysis() {
  const { t } = useLanguage();
  const { assetList, alertList } = useSOC();

  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD REAL THREAT ANALYSIS
  // =========================================================

  useEffect(() => {
  const loadThreatAnalysis = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        API_ENDPOINTS.THREAT_ANALYSIS
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch threat analysis"
        );
      }

      const result = await response.json();

      const analyses = Array.isArray(result.data)
        ? result.data
        : [];

      // Select analysis for the first frontend asset
      const selectedAsset = assetList[0];

      const matchingAnalysis = selectedAsset
        ? analyses.find(
            (item) =>
              item.asset?.name === selectedAsset.name ||
              item.assetName === selectedAsset.name
          )
        : analyses[0];

      setAnalysis(
        matchingAnalysis || analyses[0] || null
      );

    } catch (error) {
      console.error(
        "Threat Analysis API Error:",
        error
      );

      setAnalysis(null);

    } finally {
      setLoading(false);
    }
  };

  loadThreatAnalysis();
}, [assetList]);

  // =========================================================
  // LOADING STATE
  // =========================================================

  if (loading) {
    return (
      <div className="page ai-analysis-page">

        <div className="page-header">
          <div>
            <p className="eyebrow">
              EXPLAINABLE AI INTELLIGENCE
            </p>

            <h1>
              {t("nav.aiAnalysis")}
            </h1>

            <p className="page-description">
              Structured AI threat classification and evidence reasoning
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          <p>
            Loading AI threat analysis...
          </p>
        </div>

      </div>
    );
  }

  // =========================================================
  // NO ANALYSIS
  // =========================================================

  if (!analysis) {
    return (
      <div className="page ai-analysis-page">

        <div className="page-header">
          <div>
            <p className="eyebrow">
              EXPLAINABLE AI INTELLIGENCE
            </p>

            <h1>
              {t("nav.aiAnalysis")}
            </h1>

            <p className="page-description">
              Structured AI threat classification and evidence reasoning
            </p>
          </div>

          <ExplainButton
            title="Explainable AI Threat Analysis"
            explanation="MED-VERSE analyzes security alerts, incidents, and Cyber DNA deviations to generate a structured threat assessment."
            simpleConcept="The analysis explains why an asset is considered suspicious."
          />
        </div>

        <div className="dashboard-card">
          <div className="empty-evidence">
            <Info size={24} />

            <p>
              No threat analysis is currently available.
            </p>
          </div>
        </div>

      </div>
    );
  }

  // =========================================================
  // NORMALIZE BACKEND DATA
  // =========================================================

  const threatType =
  analysis.threat?.type ||
  "No Active Threat";

const threatLevel =
  analysis.threat?.level ||
  "Low";

const threatScore =
  Number(
    analysis.threat?.score || 0
  );

const confidence =
  Number(
    analysis.threat?.confidence || 0
  );

const cyberDNA =
  Number(
    analysis.cyberDNA?.deviationScore || 0
  );

const activeAlerts =
  Array.isArray(analysis.alerts)
    ? analysis.alerts.length
    : 0;

const activeIncidents =
  Array.isArray(analysis.incidents)
    ? analysis.incidents.length
    : 0;

const explanation =
  Array.isArray(analysis.explanation)
    ? analysis.explanation.join(". ")
    : (
        analysis.explanation ||
        "No additional AI explanation is available."
      ); 
   const assetName =
    analysis.asset?.name ||
    analysis.assetName ||
    assetList[0]?.name ||
    "";

  // =========================================================
  // FIND RELATED ALERTS
  // =========================================================

  const relatedAlerts = alertList.filter(
    (alert) =>
      alert.assetName === assetName
  );

  // =========================================================
  // BUILD EVIDENCE FROM REAL ALERT DATA
  // =========================================================

  const evidenceItems = relatedAlerts.map(
    (alert, index) => ({
      id: `alert-${alert.id || index}`,

      title:
        alert.title ||
        "Security Alert Detected",

      type: "OBSERVED",

      timestamp:
        alert.timestamp ||
        "",

      asset:
        alert.assetName ||
        assetName,

      event:
        alert.threatType ||
        "Security Threat",

      observed:
        alert.evidence ||
        alert.simpleExplanation ||
        alert.title ||
        "Security activity detected.",

      whyItMatters:
        alert.simpleExplanation ||
        `The detection engine identified ${alert.severity || "suspicious"} security activity on this asset.`
    })
  );

  // Add AI analysis as an evidence item
  if (explanation) {
    evidenceItems.push({
      id: "ai-analysis",
      title: "AI Threat Correlation",
      type: "INFERRED",
      timestamp: "",
      asset: assetName,
      event: threatType,
      observed: explanation,
      whyItMatters:
        `The AI analysis combines ${activeAlerts} active alert(s), ${activeIncidents} active incident(s), and a Cyber DNA deviation of ${cyberDNA}.`
    });
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page ai-analysis-page">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="page-header">

        <div>

          <p className="eyebrow">
            EXPLAINABLE AI INTELLIGENCE
          </p>

          <h1>
            {t("nav.aiAnalysis")}
          </h1>

          <p className="page-description">
            Structured AI threat classification and evidence reasoning
          </p>

        </div>

        <ExplainButton
          title="Explainable AI Threat Analysis"
          explanation="Instead of a black box, MED-VERSE breaks down threat classification, confidence, alert activity, incident activity, and Cyber DNA deviation."
          simpleConcept="Click any evidence reason below to inspect why the asset was flagged."
        />

      </div>

      {/* ===================================================
          MAIN AI GRID
      =================================================== */}

      <div className="ai-main-grid">

        {/* =================================================
            AI SUMMARY CARD
        ================================================= */}

        <div className="dashboard-card ai-summary-card">

          <div className="card-header">

            <div className="card-title-wrap">

              <BrainCircuit
                size={20}
                className="teal-icon"
              />

              <div>

                <h3>
                  CLASSIFICATION:{" "}
                  {String(threatType).toUpperCase()}
                </h3>

                <p className="card-subtitle">
                  Target: {assetName}
                </p>

              </div>

            </div>

            <SeverityBadge
              severity={threatLevel}
            />

          </div>

          {/* =================================================
              AI CONFIDENCE
          ================================================= */}

          <div className="ai-confidence-banner">

            <div className="confidence-circle">

              <span className="conf-num">
                {confidence}%
              </span>

              <span className="conf-label">
                CONFIDENCE
              </span>

            </div>

            <div className="confidence-info">

              <h4>
                {threatLevel} Threat Assessment
              </h4>

              <p>
                {explanation}
              </p>

            </div>

          </div>

          {/* =================================================
              THREAT METRICS
          ================================================= */}

          <div className="ai-evidence-list">

            <h4>
              AI THREAT METRICS
            </h4>

            <div className="evidence-chips">

              <button
                className="evidence-btn-chip"
                onClick={() =>
                  setSelectedEvidence({
                    id: "threat-score",
                    title: "Threat Score",
                    type: "AI",
                    timestamp: "",
                    asset: assetName,
                    event: threatType,
                    observed:
                      `Threat score: ${threatScore}/100`,
                    whyItMatters:
                      "The threat score represents the current calculated security risk for this asset."
                  })
                }
              >

                <CheckCircle2
                  size={16}
                  className="green-check"
                />

                <span>
                  Threat Score: {threatScore}/100
                </span>

                <span className="tag-badge inferred">
                  AI
                </span>

              </button>

              <button
                className="evidence-btn-chip"
                onClick={() =>
                  setSelectedEvidence({
                    id: "cyber-dna",
                    title: "Cyber DNA Deviation",
                    type: "AI",
                    timestamp: "",
                    asset: assetName,
                    event: "Behavioral Deviation",
                    observed:
                      `Cyber DNA deviation: ${cyberDNA}`,
                    whyItMatters:
                      "Cyber DNA represents deviation from the asset's expected security behavior."
                  })
                }
              >

                <CheckCircle2
                  size={16}
                  className="green-check"
                />

                <span>
                  Cyber DNA Deviation: {cyberDNA}
                </span>

                <span className="tag-badge inferred">
                  AI
                </span>

              </button>

              <button
                className="evidence-btn-chip"
                onClick={() =>
                  setSelectedEvidence({
                    id: "active-alerts",
                    title: "Active Security Alerts",
                    type: "OBSERVED",
                    timestamp: "",
                    asset: assetName,
                    event: "Security Alerts",
                    observed:
                      `${activeAlerts} active alert(s) associated with this asset.`,
                    whyItMatters:
                      "Active alerts indicate unresolved security activity requiring investigation."
                  })
                }
              >

                <CheckCircle2
                  size={16}
                  className="green-check"
                />

                <span>
                  Active Alerts: {activeAlerts}
                </span>

                <span className="tag-badge observed">
                  OBSERVED
                </span>

              </button>

              <button
                className="evidence-btn-chip"
                onClick={() =>
                  setSelectedEvidence({
                    id: "active-incidents",
                    title: "Active Security Incidents",
                    type: "OBSERVED",
                    timestamp: "",
                    asset: assetName,
                    event: "Incident Correlation",
                    observed:
                      `${activeIncidents} active incident(s) associated with this asset.`,
                    whyItMatters:
                      "Incidents correlate multiple security events into a larger security campaign."
                  })
                }
              >

                <CheckCircle2
                  size={16}
                  className="green-check"
                />

                <span>
                  Active Incidents: {activeIncidents}
                </span>

                <span className="tag-badge observed">
                  OBSERVED
                </span>

              </button>

              {/* REAL ALERT EVIDENCE */}

              {evidenceItems.map((item) => (

                <button
                  key={item.id}
                  className={`evidence-btn-chip ${
                    selectedEvidence?.id === item.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSelectedEvidence(item)
                  }
                >

                  <CheckCircle2
                    size={16}
                    className="green-check"
                  />

                  <span>
                    {item.title}
                  </span>

                  <span
                    className={`tag-badge ${
                      item.type.toLowerCase()
                    }`}
                  >
                    {item.type}
                  </span>

                </button>

              ))}

            </div>

          </div>

        </div>

        {/* =================================================
            EVIDENCE DETAIL CARD
        ================================================= */}

        <div className="dashboard-card ai-detail-card">

          <h3>
            Evidence Inspection Panel
          </h3>

          {!selectedEvidence ? (

            <div className="empty-evidence">

              <Info size={24} />

              <p>
                Click any evidence item on the left to view
                technical observed behavior and security explanation.
              </p>

            </div>

          ) : (

            <div className="evidence-detail-body">

              <div className="detail-top">

                <span
                  className={`tag-badge ${
                    selectedEvidence.type.toLowerCase()
                  }`}
                >
                  {selectedEvidence.type} EVIDENCE
                </span>

                <span className="detail-time">
                  Detected:{" "}
                  {selectedEvidence.timestamp || "Current analysis"}
                </span>

              </div>

              <h4>
                {selectedEvidence.title}
              </h4>

              <p>
                <strong>
                  Affected Asset:
                </strong>{" "}
                {selectedEvidence.asset}
              </p>

              <p>
                <strong>
                  Event Classification:
                </strong>{" "}
                {selectedEvidence.event}
              </p>

              <div className="detail-box observed">

                <strong>
                  Observed Behavior:
                </strong>

                <p>
                  {selectedEvidence.observed}
                </p>

              </div>

              <div className="detail-box why">

                <strong>
                  Why It Matters:
                </strong>

                <p>
                  {selectedEvidence.whyItMatters}
                </p>

              </div>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}