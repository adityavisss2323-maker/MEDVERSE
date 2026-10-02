import { useEffect, useState } from "react";
import { Dna, AlertTriangle } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import { ExplainButton } from "../components/common/ExplainButton";
import { StatusBadge } from "../components/common/StatusBadge";
import { API_ENDPOINTS } from "../services/api";

export default function CyberDNAPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const initialAssetId =
    searchParams.get("asset") || "";

  const [selectedAssetId, setSelectedAssetId] =
    useState(initialAssetId);

  const [profiles, setProfiles] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // LOAD REAL CYBER DNA DATA
  // =========================================================

  useEffect(() => {
    const loadCyberDNA = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          API_ENDPOINTS.CYBER_DNA
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch Cyber DNA data"
          );
        }

        const result = await response.json();

        const data = Array.isArray(result.data)
          ? result.data
          : [];

        setProfiles(data);

        // If URL contains asset, use it.
        // Otherwise use first backend asset.
        const selected =
          data.find(
            (item) =>
              String(item.assetId) ===
              String(initialAssetId) ||
              item.assetName === initialAssetId
          ) || data[0];

        if (selected) {
          setSelectedAssetId(
            String(selected.assetId)
          );

          setProfile(selected);
        } else {
          setProfile(null);
        }

      } catch (error) {
        console.error(
          "Cyber DNA API Error:",
          error
        );

        setProfiles([]);
        setProfile(null);

      } finally {
        setLoading(false);
      }
    };

    loadCyberDNA();
  }, [initialAssetId]);

  // =========================================================
  // CHANGE ASSET
  // =========================================================

  const handleAssetChange = (assetId) => {
    setSelectedAssetId(String(assetId));

    const selected = profiles.find(
      (item) =>
        String(item.assetId) ===
        String(assetId)
    );

    setProfile(selected || null);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="page cyber-dna-page">

        <div className="page-header">
          <div>
            <p className="eyebrow">
              BEHAVIORAL PROFILING
            </p>

            <h1>
              {t("cyberDNA.title")}
            </h1>

            <p className="page-description">
              {t("cyberDNA.subtitle")}
            </p>
          </div>
        </div>

        <div className="dashboard-card">
          Loading Cyber DNA analysis...
        </div>

      </div>
    );
  }

  // =========================================================
  // NO DATA
  // =========================================================

  if (!profile) {
    return (
      <div className="page cyber-dna-page">

        <div className="page-header">
          <div>
            <p className="eyebrow">
              BEHAVIORAL PROFILING
            </p>

            <h1>
              {t("cyberDNA.title")}
            </h1>

            <p className="page-description">
              {t("cyberDNA.subtitle")}
            </p>
          </div>

          <ExplainButton
            title="Cyber DNA & Behavioral Profiling"
            explanation="Cyber DNA measures security-event activity associated with an asset and calculates a behavioral deviation score."
            simpleConcept="Higher recent security activity produces a higher deviation score."
          />
        </div>

        <div className="dashboard-card">
          No Cyber DNA data is currently available.
        </div>

      </div>
    );
  }

  // =========================================================
  // REAL BACKEND VALUES
  // =========================================================

  const deviationScore =
    Number(profile.deviationScore || 0);

  const behaviorStatus =
    profile.behaviorStatus || "Normal";

  const statistics =
    profile.statistics || {};

  const totalEvents =
    Number(
      statistics.totalSecurityEvents || 0
    );

  const highEvents =
    Number(
      statistics.highSeverityEvents || 0
    );

  const criticalEvents =
    Number(
      statistics.criticalSeverityEvents || 0
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page cyber-dna-page">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <p className="eyebrow">
            BEHAVIORAL PROFILING
          </p>

          <h1>
            {t("cyberDNA.title")}
          </h1>

          <p className="page-description">
            {t("cyberDNA.subtitle")}
          </p>

        </div>

        <ExplainButton
          title="Cyber DNA & Behavioral Profiling"
          explanation="Cyber DNA measures recent security-event activity associated with an asset and calculates a behavioral deviation score."
          simpleConcept="A higher deviation score means more unusual security activity was detected during the analysis window."
        />

      </div>

      {/* ASSET SELECTOR */}

      <div className="dna-selector-bar">

        <label>
          Select Monitored Asset:
        </label>

        <div className="asset-tab-buttons">

          {profiles.map((item) => (

            <button
              key={item.assetId}
              className={`asset-dna-btn ${
                String(selectedAssetId) ===
                String(item.assetId)
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleAssetChange(item.assetId)
              }
            >

              <Dna size={16} />

              <span>
                {item.assetName}
              </span>

            </button>

          ))}

        </div>

      </div>

      <div className="dna-main-grid">

        {/* =================================================
            DEVIATION SCORE
        ================================================= */}

        <div className="dashboard-card dna-score-card">

          <div className="card-header">

            <h3>
              Behavioral Anomaly Index
            </h3>

            <StatusBadge
              status={behaviorStatus}
            />

          </div>

          <div className="dna-gauge-container">

            <div className="dna-gauge-circle">

              <span className="gauge-number">
                {deviationScore}%
              </span>

              <span className="gauge-label">
                DEVIATION
              </span>

            </div>

            <div className="gauge-description">

              <strong>
                {profile.assetName}
                {" "}
                ({profile.assetType})
              </strong>

              <p>
                Analysis window:
                {" "}
                {profile.analysisWindow ||
                  "Last 24 Hours"}
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            BACKEND STATISTICS
        ================================================= */}

        <div className="dashboard-card dna-comparison-card">

          <h3>
            Security Behavior Statistics
          </h3>

          <div className="comparison-table">

            <div className="comp-row head">
              <div>Metric</div>
              <div>Current Activity</div>
              <div>Contribution</div>
            </div>

            <div className="comp-row">

              <div className="metric-label">
                Total Security Events
              </div>

              <div className="current-cell">
                {totalEvents}
              </div>

              <div>
                {totalEvents * 5} points
              </div>

            </div>

            <div className="comp-row">

              <div className="metric-label">
                High Severity Events
              </div>

              <div className="current-cell anomaly">
                {highEvents}
              </div>

              <div>
                {highEvents * 10} points
              </div>

            </div>

            <div className="comp-row">

              <div className="metric-label">
                Critical Severity Events
              </div>

              <div className="current-cell anomaly">
                {criticalEvents}
              </div>

              <div>
                {criticalEvents * 20} points
              </div>

            </div>

            <div className="comp-row">

              <div className="metric-label">
                Final Deviation Score
              </div>

              <div className="current-cell anomaly">
                {deviationScore}%
              </div>

              <div>
                Maximum: 100
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            DEVIATION REASONS
        ================================================= */}

        <div className="dashboard-card dna-reasons-card">

          <h3>
            {t("cyberDNA.whyUnusual")}
          </h3>

          <p className="card-subtitle">
            AI-assisted anomaly classification
          </p>

          <div className="reasons-grid">

            {totalEvents === 0 ? (

              <div className="reason-card">

                <div className="reason-top">

                  <Dna
                    size={18}
                    className="reason-icon"
                  />

                  <strong>
                    No Recent Security Events
                  </strong>

                  <span className="severity-chip">
                    NORMAL
                  </span>

                </div>

                <p>
                  No security events were recorded
                  for this asset during the
                  {profile.analysisWindow ||
                    " Last 24 Hours"}{" "}
                  analysis window.
                </p>

              </div>

            ) : (

              <>

                {totalEvents > 0 && (
                  <div className="reason-card">

                    <div className="reason-top">

                      <AlertTriangle
                        size={18}
                        className="reason-icon red"
                      />

                      <strong>
                        Security Activity Detected
                      </strong>

                      <span className="severity-chip red">
                        OBSERVED
                      </span>

                    </div>

                    <p>
                      {totalEvents} security
                      event(s) were recorded
                      during the analysis window.
                    </p>

                  </div>
                )}

                {highEvents > 0 && (
                  <div className="reason-card">

                    <div className="reason-top">

                      <AlertTriangle
                        size={18}
                        className="reason-icon red"
                      />

                      <strong>
                        High Severity Activity
                      </strong>

                      <span className="severity-chip red">
                        HIGH
                      </span>

                    </div>

                    <p>
                      {highEvents} high-severity
                      security event(s) contributed
                      to the deviation score.
                    </p>

                  </div>
                )}

                {criticalEvents > 0 && (
                  <div className="reason-card">

                    <div className="reason-top">

                      <AlertTriangle
                        size={18}
                        className="reason-icon red"
                      />

                      <strong>
                        Critical Activity
                      </strong>

                      <span className="severity-chip red">
                        CRITICAL
                      </span>

                    </div>

                    <p>
                      {criticalEvents} critical
                      security event(s) contributed
                      to the deviation score.
                    </p>

                  </div>
                )}

              </>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}