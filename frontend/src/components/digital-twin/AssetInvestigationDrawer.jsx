import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Server,
  Dna,
  GitCommit,
  Zap,
  History,
  ShieldAlert,
  CheckCircle2
} from "lucide-react";

import {
  StatusBadge,
  SeverityBadge
} from "../common/StatusBadge";

import { useSOC } from "../../context/SOCContext";
import { API_ENDPOINTS } from "../../services/api";

export function AssetInvestigationDrawer({
  asset,
  onClose
}) {
  const [activeTab, setActiveTab] =
    useState("overview");

  const [cyberDNA, setCyberDNA] =
    useState(null);

  const [forensicEvents, setForensicEvents] =
    useState([]);

  const [loadingDNA, setLoadingDNA] =
    useState(false);

  const [loadingForensics, setLoadingForensics] =
    useState(false);

  const [quarantineLoading, setQuarantineLoading] =
    useState(false);

  const [quarantineSuccess, setQuarantineSuccess] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const {
    quarantineAsset
  } = useSOC();

  const navigate = useNavigate();

  if (!asset) {
    return null;
  }

  // =========================================================
  // LOAD CYBER DNA
  // =========================================================

  useEffect(() => {
    const loadCyberDNA = async () => {
      if (!asset?.id) {
        return;
      }

      try {
        setLoadingDNA(true);
        setErrorMessage("");

        const response = await fetch(
  `${API_ENDPOINTS.CYBER_DNA}/${encodeURIComponent(asset.id)}`
);

        if (!response.ok) {
          throw new Error(
            "Failed to fetch Cyber DNA"
          );
        }

        const result =
          await response.json();

        setCyberDNA(
          result.data || null
        );

      } catch (error) {
        console.error(
          "Asset Cyber DNA Error:",
          error
        );

        setCyberDNA(null);

      } finally {
        setLoadingDNA(false);
      }
    };

    loadCyberDNA();
  }, [asset?.id]);

  // =========================================================
  // LOAD FORENSIC DATA
  // =========================================================

  useEffect(() => {
    const loadForensics = async () => {
      if (!asset?.id) {
        return;
      }

      try {
        setLoadingForensics(true);

        const response = await fetch(
          API_ENDPOINTS.FORENSICS
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch forensic data"
          );
        }

        const result =
          await response.json();

        const timelines =
          Array.isArray(result.data)
            ? result.data
            : [];

        const events = [];

        // ---------------------------------------------------
        // Flatten all incident timelines
        // and keep events belonging to this asset.
        // ---------------------------------------------------

        timelines.forEach((timelineData) => {
          const timelineAsset =
            timelineData.asset;

          if (!timelineAsset) {
            return;
          }

          const sameAsset =
            String(timelineAsset.id) ===
            String(asset.id);

          if (!sameAsset) {
            return;
          }

          (timelineData.timeline || [])
            .forEach((event) => {

              const timestamp =
                event.timestamp
                  ? new Date(
                      event.timestamp
                    ).toLocaleTimeString(
                      "en-US",
                      {
                        hour12: false
                      }
                    )
                  : "";

              events.push({
                id: event.id,

                timestamp,

                rawTimestamp: event.timestamp || null,

                severity:
                  event.severity ||
                  "Low",

                eventType:
                  event.type ||
                  "EVENT",

                title:
                  event.title ||
                  "",

                description:
                  event.description ||
                  "",

                source:
                  event.source ||
                  "MED-VERSE",

                status:
                  event.status ||
                  "Detected",

                rawLog: [
                  timestamp,
                  event.source ||
                    "MED-VERSE",
                  event.type ||
                    "EVENT",
                  event.title ||
                    "",
                  event.description ||
                    "",
                  event.target
                    ? `Target: ${event.target}`
                    : ""
                ]
                  .filter(Boolean)
                  .join(" | ")
              });
            });
        });

        // Oldest → newest
events.sort((a, b) => {
  if (!a.rawTimestamp) return 1;
  if (!b.rawTimestamp) return -1;

  return (
    new Date(a.rawTimestamp) -
    new Date(b.rawTimestamp)
  );
});

        setForensicEvents(events);

      } catch (error) {
        console.error(
          "Asset Forensic Error:",
          error
        );

        setForensicEvents([]);

      } finally {
        setLoadingForensics(false);
      }
    };

    loadForensics();
  }, [asset?.id]);

  // =========================================================
  // QUARANTINE DEVICE
  // =========================================================

const handleQuarantine = async () => {
  if (!asset?.id || quarantineLoading) {
    return;
  }

  try {
    setQuarantineLoading(true);
    setErrorMessage("");
    setQuarantineSuccess(false);

    const response = await fetch(
      `${API_ENDPOINTS.RESPONSES}/${asset.id}/execute`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "QUARANTINE_DEVICE"
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
        "Failed to simulate quarantine"
      );
    }

    /*
     * Update frontend asset state immediately.
     * Backend response action is already stored in MySQL.
     */
    quarantineAsset(asset.id);

    setQuarantineSuccess(true);

    setTimeout(() => {
      setQuarantineSuccess(false);
    }, 4000);

  } catch (error) {
    console.error(
      "Quarantine Error:",
      error
    );

    setErrorMessage(
      error.message ||
      "Failed to simulate quarantine"
    );

  } finally {
    setQuarantineLoading(false);
  }
};
  // =========================================================
  // CYBER DNA VALUES
  // =========================================================

  const deviationScore =
    Number(
      cyberDNA?.deviationScore || 0
    );

  const behaviorStatus =
    cyberDNA?.behaviorStatus ||
    "Normal";

  const statistics =
    cyberDNA?.statistics || {};

  const totalEvents =
    Number(
      statistics.totalSecurityEvents ||
      0
    );

  const highEvents =
    Number(
      statistics.highSeverityEvents ||
      0
    );

  const criticalEvents =
    Number(
      statistics.criticalSeverityEvents ||
      0
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
    >

      <div
        className="asset-drawer-card"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="drawer-header">

          <div className="drawer-asset-title">

            <div
              className={`asset-drawer-icon ${
                asset.status || "normal"
              }`}
            >
              <Server size={22} />
            </div>

            <div>

              <h3>
                {asset.name || asset.id}
              </h3>

              <p className="drawer-subtitle">
                {asset.type || "Hospital Asset"}
              </p>

            </div>

          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>

        </div>

        {/* =================================================
            TABS
        ================================================= */}

        <div className="drawer-tabs">

          <button
            className={`tab-btn ${
              activeTab === "overview"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("overview")
            }
          >
            Overview
          </button>

          <button
            className={`tab-btn ${
              activeTab === "dna"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("dna")
            }
          >
            Cyber DNA
          </button>

          <button
            className={`tab-btn ${
              activeTab === "relationships"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab(
                "relationships"
              )
            }
          >
            Connections
          </button>

          <button
            className={`tab-btn ${
              activeTab === "forensics"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveTab("forensics")
            }
          >
            Forensics ({forensicEvents.length})
          </button>

        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <div className="drawer-body">

          {/* =================================================
              OVERVIEW
          ================================================= */}

          {activeTab === "overview" && (

            <div className="tab-content">

              <div className="drawer-detail-grid">

                <div className="detail-item">
                  <span className="detail-label">
                    Department
                  </span>

                  <strong>
                    {asset.department ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    IP Address
                  </span>

                  <strong>
                    {asset.ip ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    MAC Address
                  </span>

                  <strong>
                    {asset.mac ||
                      "Not Available"}
                  </strong>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Status
                  </span>

                  <div className="status-badge-container">
                    <StatusBadge
                      status={
                        asset.status ||
                        "normal"
                      }
                    />
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Risk Level
                  </span>

                  <div className="status-badge-container">
                    <SeverityBadge
                      severity={
                        asset.risk ||
                        "Low"
                      }
                    />
                  </div>
                </div>

                <div className="detail-item">
                  <span className="detail-label">
                    Criticality Score
                  </span>

                  <strong>
                    {
                      asset.criticalityScore ??
                      0
                    }
                    /100
                  </strong>
                </div>

              </div>

              <div className="drawer-section">

                <h4>
                  System Description
                </h4>

                <p>
                  {asset.simpleDescription ||
                    "No system description is currently available."}
                </p>

              </div>

              <div className="drawer-section">

                <h4>
                  Location & OS
                </h4>

                <p>
                  📍{" "}
                  {asset.location ||
                    "Not Available"}
                </p>

                <p>
                  💻{" "}
                  {asset.os ||
                    "Not Available"}
                </p>

              </div>

              {/* ERROR */}

              {errorMessage && (

                <div
                  className="response-success-banner"
                  style={{
                    marginTop: "15px"
                  }}
                >
                  <ShieldAlert size={18} />

                  <span>
                    {errorMessage}
                  </span>

                </div>

              )}

              {/* SUCCESS */}

              {quarantineSuccess && (

                <div
                  className="response-success-banner"
                  style={{
                    marginTop: "15px"
                  }}
                >
                  <CheckCircle2
                    size={18}
                  />

                  <span>
                    Simulated quarantine
                    action stored
                    successfully.
                  </span>

                </div>

              )}

              {/* ACTIONS */}

              <div className="drawer-actions">

                <button
                  className="secondary-button"
                  onClick={() => {
                    onClose();

                    navigate(
                      `/cyber-dna?asset=${asset.id}`
                    );
                  }}
                >
                  <Dna size={15} />

                  Cyber DNA
                </button>

                <button
                  className="secondary-button"
                  onClick={() => {
                    onClose();

                    navigate(
                      `/attack-paths`
                    );
                  }}
                >
                  <GitCommit size={15} />

                  Attack Path
                </button>

                {String(
                  asset.status
                ).toLowerCase() !==
                "quarantined" ? (

                  <button
                    className="danger-button"
                    onClick={
                      handleQuarantine
                    }
                    disabled={
                      quarantineLoading
                    }
                  >
                    <Zap size={15} />

                    {quarantineLoading
                      ? "Simulating..."
                      : "Quarantining Device (Simulated)"}
                  </button>

                ) : (

                  <span className="quarantined-badge-label">
                    ✓ Simulated Quarantine Active
                  </span>

                )}

              </div>

            </div>

          )}

          {/* =================================================
              CYBER DNA
          ================================================= */}

          {activeTab === "dna" && (

            <div className="tab-content">

              {loadingDNA ? (

                <p>
                  Loading Cyber DNA analysis...
                </p>

              ) : cyberDNA ? (

                <div>

                  <div className="dna-score-box">

                    <span>
                      Behavioral Deviation
                      Score:
                    </span>

                    <strong className="dna-score-val">
                      {deviationScore}%
                    </strong>

                  </div>

                  <div
                    className="drawer-section"
                  >

                    <h4>
                      Behavioral Status
                    </h4>

                    <StatusBadge
                      status={
                        behaviorStatus
                      }
                    />

                    <p>
                      Analysis window:
                      {" "}
                      {cyberDNA.analysisWindow ||
                        "Last 24 Hours"}
                    </p>

                  </div>

                  <h4>
                    Security Activity
                  </h4>

                  <ul className="reasons-list">

                    <li>

                      <strong className="reason-title">
                        Total Security Events:
                      </strong>

                      <p>
                        {totalEvents}
                      </p>

                    </li>

                    <li>

                      <strong className="reason-title">
                        High Severity Events:
                      </strong>

                      <p>
                        {highEvents}
                      </p>

                    </li>

                    <li>

                      <strong className="reason-title">
                        Critical Severity Events:
                      </strong>

                      <p>
                        {criticalEvents}
                      </p>

                    </li>

                  </ul>

                  {totalEvents === 0 && (

                    <p>
                      No anomalous security
                      events were recorded
                      during the current
                      analysis window.
                    </p>

                  )}

                </div>

              ) : (

                <p>
                  Cyber DNA analysis is
                  currently unavailable
                  for this asset.
                </p>

              )}

            </div>

          )}

          {/* =================================================
              CONNECTIONS
          ================================================= */}

          {activeTab === "relationships" && (

            <div className="tab-content">

              <h4>
                Connected Infrastructure (
                {
                  Array.isArray(
                    asset.connections
                  )
                    ? asset.connections.length
                    : 0
                }
                ):
              </h4>

              {Array.isArray(
                asset.connections
              ) &&
              asset.connections.length >
                0 ? (

                <div className="connections-chips">

                  {asset.connections.map(
                    (connection, index) => (

                      <div
                        key={`${connection}-${index}`}
                        className="conn-chip"
                      >

                        <Server size={14} />

                        <span>
                          {typeof connection ===
                          "object"
                            ? connection.name ||
                              connection.id ||
                              "Unknown"
                            : connection}
                        </span>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p>
                  No connection information
                  is currently available
                  for this asset.
                </p>

              )}

            </div>

          )}

          {/* =================================================
              FORENSICS
          ================================================= */}

          {activeTab === "forensics" && (

            <div className="tab-content">

              {loadingForensics ? (

                <p>
                  Loading forensic timeline...
                </p>

              ) : forensicEvents.length ===
                0 ? (

                <p>
                  No forensic log entries
                  recorded for this asset.
                </p>

              ) : (

                <div className="drawer-events-list">

                  {forensicEvents.map(
                    (event) => (

                      <div
                        key={event.id}
                        className="drawer-event-item"
                      >

                        <div className="evt-top">

                          <SeverityBadge
  severity={event.severity || "Low"}
/>

                          <span className="evt-time">
                            {event.timestamp}
                          </span>

                        </div>

                       <strong>
  {event.title || "Forensic Event"}
</strong>

<p>
  {event.description ||
    "No event description available."}
</p>

<small>
  Source:{" "}
  {event.source || "MED-VERSE"}
</small>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}