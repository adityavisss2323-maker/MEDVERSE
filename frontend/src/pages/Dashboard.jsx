import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Server,
  ShieldAlert,
  Users,
  Radio,
  Eye,
  Network,
  ArrowUpRight,
  X,
  Play,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useApp } from "../context/AppContext";
import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";

import {
  SeverityBadge,
  StatusBadge,
} from "../components/common/StatusBadge";

import { ExplainButton } from "../components/common/ExplainButton";
import { SecurityPulse } from "../components/dashboard/SecurityPulse";
import { ThreatGravity } from "../components/dashboard/ThreatGravity";
import { SimpleDashboardView } from "../components/dashboard/SimpleDashboardView";
import { IncidentStoryEngine } from "../components/story/IncidentStoryEngine";


export default function Dashboard() {
  const {
    mode,
    focusMode,
    setFocusMode,
    liveMode,
    setLiveMode,
  } = useApp();

  const { t } = useLanguage();

  const {
    assetList,
    alertList,
    incidentList,
    forensicList,
  } = useSOC();

  const navigate = useNavigate();


  /* =========================================
     LOCAL STATE
     ========================================= */

  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedAssetModal, setSelectedAssetModal] = useState(null);
  const [selectedIncidentModal, setSelectedIncidentModal] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);


  /* =========================================
     REAL DASHBOARD CALCULATIONS
     ========================================= */

  const totalAssets = assetList.length;

  const criticalAlerts = alertList.filter(
    (alert) =>
      alert.severity?.toLowerCase() === "critical"
  ).length;

  const compromisedAssets = assetList.filter(
    (asset) =>
      asset.status?.toLowerCase() === "compromised"
  ).length;

  const normalAssets = assetList.filter(
    (asset) =>
      asset.status?.toLowerCase() === "normal"
  ).length;

  const suspiciousAssets = assetList.filter(
    (asset) =>
      asset.status?.toLowerCase() === "suspicious"
  ).length;


  /* =========================================
     ASSET HEALTH PERCENTAGES
     ========================================= */

  const normalPercentage =
    totalAssets > 0
      ? Math.round((normalAssets / totalAssets) * 100)
      : 0;

  const suspiciousPercentage =
    totalAssets > 0
      ? Math.round((suspiciousAssets / totalAssets) * 100)
      : 0;

  const compromisedPercentage =
    totalAssets > 0
      ? Math.round((compromisedAssets / totalAssets) * 100)
      : 0;


  /* =========================================
     THREAT ACTIVITY DATA
     ========================================= */

  const threatData = alertList.reduce((result, alert) => {
    const date = alert.timestamp || "";

    if (!date) {
      return result;
    }

    const hour = date.substring(0, 2);

    const existing = result.find(
      (item) => item.time === `${hour}:00`
    );

    if (existing) {
      existing.alerts += 1;
    } else {
      result.push({
        time: `${hour}:00`,
        alerts: 1,
      });
    }

    return result;
  }, []);


  /* =========================================
     LIVE EVENT STREAM
     ========================================= */

  const [eventsStream, setEventsStream] = useState([]);


  /* =========================================
     BUILD EVENT STREAM FROM REAL DATA
     ========================================= */

  useEffect(() => {
    const realEvents = [];


    /* Alerts */
    alertList.forEach((alert) => {
      realEvents.push({
        id: `alert-${alert.id}`,
        type: alert.threatType || alert.title || "Security Alert",
        asset: alert.assetName || alert.assetId || "Unknown Asset",
        severity: alert.severity || "Low",
        time: alert.timestamp || "Recorded",
      });
    });


    /* Forensic events */
    forensicList.slice(0, 10).forEach((event) => {
      realEvents.push({
        id: `forensic-${event.id}`,
        type: event.title || event.eventType || "Security Event",
        asset: event.assetName || event.assetId || "Unknown Asset",
        severity: event.severity || "Low",
        time: event.timestamp || "Recorded",
      });
    });


    setEventsStream(realEvents.slice(0, 10));
  }, [alertList, forensicList]);


  /* =========================================
     LIVE MODE
     ========================================= */

  useEffect(() => {
    if (!liveMode) {
      return;
    }

    const interval = setInterval(() => {
      setEventsStream((current) => {
        if (current.length === 0) {
          return current;
        }

        return [
          {
            ...current[0],
            id: `${current[0].id}-live-${Date.now()}`,
            time: "Just now",
          },
          ...current.slice(0, 9),
        ];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [liveMode]);


  /* =========================================
     FOCUS MODE
     ========================================= */

  const visibleEvents = focusMode
    ? eventsStream.filter(
        (event) =>
          event.severity?.toLowerCase() === "critical"
      )
    : eventsStream;


  /* =========================================
     SIMPLE MODE
     ========================================= */

  if (mode === "simple") {
    return (
      <div className="page dashboard-page">

        <SimpleDashboardView
          onOpenStory={() => setIsStoryModalOpen(true)}
        />

        {isStoryModalOpen && (
          <IncidentStoryEngine
            onClose={() => setIsStoryModalOpen(false)}
          />
        )}

      </div>
    );
  }


  /* =========================================
     MAIN DASHBOARD
     ========================================= */

  return (
    <div className="page dashboard-page">

      {/* =====================================
          HEADER
          ===================================== */}

      <div className="dashboard-header">

        <div>
          <p className="eyebrow">
            SECURITY OPERATIONS CENTER
          </p>

          <h1>
            Security Overview
          </h1>

          <p className="page-description">
            Real-time cybersecurity monitoring across
            the hospital environment.
          </p>
        </div>


        <div className="dashboard-controls">

          <button
            className={`control-button ${
              liveMode ? "control-active" : ""
            }`}
            onClick={() => setLiveMode(!liveMode)}
          >
            <Radio size={16} />

            {liveMode
              ? t("header.liveSocOn")
              : t("header.liveSocOff")}
          </button>


          <button
            className={`control-button ${
              focusMode ? "control-active" : ""
            }`}
            onClick={() => setFocusMode(!focusMode)}
          >
            <Eye size={16} />

            {focusMode
              ? t("header.criticalOnly")
              : t("header.focusMode")}
          </button>


          <button
            className="control-button story-trigger-btn"
            onClick={() => setIsStoryModalOpen(true)}
          >
            <Play size={16} />

            <span>
              Incident Story
            </span>
          </button>

        </div>

      </div>


      {/* =====================================
          SECURITY POSTURE
          ===================================== */}

      <div className="security-posture">

        <div className="posture-left">

          <div className="posture-icon">
            <ShieldAlert size={24} />
          </div>

          <div>

            <span>
              {t("dashboard.securityPosture")}
            </span>

            <strong>
              {t("dashboard.attentionRequired")}
            </strong>

            <p>
              {t("dashboard.postureSub")}
            </p>

          </div>

        </div>


        <div className="posture-status">

          <span className="status-pulse"></span>

          {t("dashboard.monitoringActive")}

        </div>

      </div>


      {/* =====================================
          KPI CARDS
          ===================================== */}

      <div className="kpi-grid">

        {/* TOTAL ASSETS */}

        <div
          className="kpi-card clickable"
          onClick={() => navigate("/digital-twin")}
        >

          <div className="kpi-top">

            <div className="kpi-icon">
              <Server size={20} />
            </div>

            <span className="kpi-change positive">
              Live
            </span>

          </div>

          <div className="kpi-value">
            {totalAssets}
          </div>

          <div className="kpi-label">
            {t("dashboard.protectedAssets")}
          </div>

          <small className="kpi-sub">
            Click for Digital Twin
          </small>

        </div>


        {/* ACTIVE ALERTS */}

        <div
          className="kpi-card clickable"
          onClick={() => navigate("/alerts")}
        >

          <div className="kpi-top">

            <div className="kpi-icon">
              <ShieldAlert size={20} />
            </div>

            <span className="kpi-change">
              Live
            </span>

          </div>

          <div className="kpi-value">
            {alertList.length}
          </div>

          <div className="kpi-label">
            {t("dashboard.activeAlerts")}
          </div>

          <small className="kpi-sub">
            Click to filter alerts
          </small>

        </div>


        {/* CRITICAL THREATS */}

        <div
          className="kpi-card kpi-critical clickable"
          onClick={() =>
            navigate("/alerts?severity=Critical")
          }
        >

          <div className="kpi-top">

            <div className="kpi-icon">
              <AlertTriangle size={20} />
            </div>

            <span className="kpi-change">
              Live
            </span>

          </div>

          <div className="kpi-value">
            {criticalAlerts}
          </div>

          <div className="kpi-label">
            {t("dashboard.criticalThreats")}
          </div>

          <small className="kpi-sub">
            Click for critical alerts
          </small>

        </div>


        {/* COMPROMISED ASSETS */}

        <div
          className="kpi-card clickable"
          onClick={() =>
            navigate("/digital-twin?status=compromised")
          }
        >

          <div className="kpi-top">

            <div className="kpi-icon">
              <Activity size={20} />
            </div>

            <span className="kpi-change positive">
              Live
            </span>

          </div>

          <div className="kpi-value">
            {compromisedAssets}
          </div>

          <div className="kpi-label">
            {t("dashboard.compromisedAssets")}
          </div>

          <small className="kpi-sub">
            Click for asset list
          </small>

        </div>


        {/* ACTIVE INCIDENTS */}

        <div
          className="kpi-card clickable"
          onClick={() => navigate("/incidents")}
        >

          <div className="kpi-top">

            <div className="kpi-icon">
              <Users size={20} />
            </div>

            <span className="kpi-change">
              Live
            </span>

          </div>

          <div className="kpi-value">
            {incidentList.length}
          </div>

          <div className="kpi-label">
            {t("dashboard.activeIncidents")}
          </div>

          <small className="kpi-sub">
            Click for incidents
          </small>

        </div>

      </div>


      {/* =====================================
          DASHBOARD GRID
          ===================================== */}

      <div className="dashboard-grid">


        {/* ===================================
            THREAT ACTIVITY
            =================================== */}

        <section className="dashboard-card threat-chart-card">

          <div className="card-header">

            <div>

              <h3>
                {t("dashboard.threatActivity")}
              </h3>

              <p className="card-subtitle">
                Click graph points to inspect events
              </p>

            </div>


            <ExplainButton
              title="Threat Activity Graph"
              explanation="Tracks hourly count of security events across hospital subnets."
              simpleConcept="Spikes on graph indicate periods of high threat activity."
            />

          </div>


          <div className="chart-container">

            {threatData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={220}
              >

                <LineChart
                  data={threatData}
                  onClick={(data) => {

                    if (
                      data?.activePayload?.length
                    ) {
                      setSelectedHour(
                        data.activePayload[0].payload
                      );
                    }

                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e8edf2"
                  />

                  <XAxis
                    dataKey="time"
                    tick={{
                      fontSize: 11,
                      fill: "#8793a3",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#8793a3",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      border: "1px solid #e3e8ee",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="alerts"
                    stroke="#176b87"
                    strokeWidth={2.5}
                    dot={{
                      r: 4,
                      fill: "#176b87",
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            ) : (

              <div className="chart-empty-state">
                No alert activity available.
              </div>

            )}

          </div>


          {selectedHour && (

            <div className="chart-selection">

              <div>

                <strong>
                  {selectedHour.time}
                </strong>

                <span>
                  {selectedHour.alerts}
                  {" "}
                  security events detected
                </span>

              </div>


              <button
                className="secondary-button"
                onClick={() => navigate("/alerts")}
              >
                View Events
              </button>


              <button
                onClick={() => setSelectedHour(null)}
              >
                <X size={15} />
              </button>

            </div>

          )}

        </section>


        {/* ===================================
            ACTIVE INCIDENTS
            =================================== */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>
                {t("dashboard.activeIncidents")}
              </h3>

              <p className="card-subtitle">
                Requires analyst attention
              </p>

            </div>

          </div>


          <div className="incident-list">

            {incidentList.length > 0 ? (

              incidentList.map((incident) => (

                <button
                  className="incident-row"
                  key={incident.id}
                  onClick={() =>
                    setSelectedIncidentModal(incident)
                  }
                >

                  <div
                    className={`severity-bar ${
                      incident.severity?.toLowerCase()
                    }`}
                  ></div>


                  <div className="incident-content">

                    <div className="incident-top">

                      <span className="incident-id">
                        {incident.id}
                      </span>

                      <SeverityBadge
                        severity={incident.severity}
                      />

                    </div>


                    <strong>
                      {incident.title}
                    </strong>

                    <span className="incident-asset">
                      {incident.assetName}
                    </span>

                  </div>


                  <ArrowUpRight size={16} />

                </button>

              ))

            ) : (

              <p className="empty-state">
                No active incidents.
              </p>

            )}

          </div>

        </section>


        {/* ===================================
            SECURITY PULSE
            =================================== */}

        <SecurityPulse />


        {/* ===================================
            THREAT GRAVITY
            =================================== */}

        <ThreatGravity />


        {/* ===================================
            ASSET HEALTH
            =================================== */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>
                {t("dashboard.assetHealth")}
              </h3>

              <p className="card-subtitle">
                Current infrastructure status breakdown
              </p>

            </div>

          </div>


          <div className="asset-health-bars">

            {/* NORMAL */}

            <div
              className="health-bar-row clickable"
              onClick={() =>
                navigate("/digital-twin?status=normal")
              }
            >

              <div className="health-label">
                Normal ({normalPercentage}%)
              </div>

              <div className="health-track">

                <div
                  className="health-fill normal"
                  style={{
                    width: `${normalPercentage}%`,
                  }}
                ></div>

              </div>

            </div>


            {/* SUSPICIOUS */}

            <div
              className="health-bar-row clickable"
              onClick={() =>
                navigate("/digital-twin?status=suspicious")
              }
            >

              <div className="health-label">
                Suspicious ({suspiciousPercentage}%)
              </div>

              <div className="health-track">

                <div
                  className="health-fill suspicious"
                  style={{
                    width: `${suspiciousPercentage}%`,
                  }}
                ></div>

              </div>

            </div>


            {/* COMPROMISED */}

            <div
              className="health-bar-row clickable"
              onClick={() =>
                navigate("/digital-twin?status=compromised")
              }
            >

              <div className="health-label">
                Compromised ({compromisedPercentage}%)
              </div>

              <div className="health-track">

                <div
                  className="health-fill compromised"
                  style={{
                    width: `${compromisedPercentage}%`,
                  }}
                ></div>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================
            MINI DIGITAL TWIN
            =================================== */}

        <section className="dashboard-card twin-card">

          <div className="card-header">

            <div>

              <h3>
                {t("dashboard.miniDigitalTwin")}
              </h3>

              <p className="card-subtitle">
                Live topology map preview
              </p>

            </div>


            <button
              className="secondary-button"
              onClick={() =>
                navigate("/digital-twin")
              }
            >
              Full Twin
            </button>

          </div>


          <div className="mini-twin-preview">

            <div
              className="mini-twin-node core"
              onClick={() =>
                navigate("/digital-twin")
              }
            >

              <Network size={18} />

              <span>
                Core Network
              </span>

            </div>


            <div className="mini-nodes-row">

              {assetList
                .slice(0, 3)
                .map((ast) => (

                  <div
                    key={ast.id}
                    className={`mini-node ${ast.status}`}
                    onClick={() =>
                      setSelectedAssetModal(ast)
                    }
                  >

                    <Server size={14} />

                    <span>
                      {ast.id}
                    </span>

                  </div>

                ))}

            </div>

          </div>

        </section>


        {/* ===================================
            LIVE EVENT STREAM
            =================================== */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>
                Security Event Stream
              </h3>

              <p className="card-subtitle">
                Latest security activity
              </p>

            </div>

          </div>


          <div className="incident-list">

            {visibleEvents.length > 0 ? (

              visibleEvents.map((event) => (

                <div
                  className="incident-row"
                  key={event.id}
                >

                  <div
                    className={`severity-bar ${
                      event.severity?.toLowerCase()
                    }`}
                  ></div>


                  <div className="incident-content">

                    <div className="incident-top">

                      <span className="incident-id">
                        {event.type}
                      </span>

                      <SeverityBadge
                        severity={event.severity}
                      />

                    </div>


                    <strong>
                      {event.asset}
                    </strong>

                    <span className="incident-asset">
                      {event.time}
                    </span>

                  </div>

                </div>

              ))

            ) : (

              <p className="empty-state">
                No security events available.
              </p>

            )}

          </div>

        </section>

      </div>


      {/* =====================================
          ASSET MODAL
          ===================================== */}

      {selectedAssetModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedAssetModal(null)
          }
        >

          <div
            className="modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <h3>
                Asset Investigation:{" "}
                {selectedAssetModal.id}
              </h3>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedAssetModal(null)
                }
              >
                ✕
              </button>

            </div>


            <div className="modal-body">

              <p>
                <strong>
                  Type:
                </strong>{" "}
                {selectedAssetModal.type}
              </p>

              <p>
                <strong>
                  Department:
                </strong>{" "}
                {selectedAssetModal.department}
              </p>

              <p>
                <strong>
                  IP Address:
                </strong>{" "}
                {selectedAssetModal.ip}
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}
                <StatusBadge
                  status={selectedAssetModal.status}
                />
              </p>

              <p>
                {selectedAssetModal.simpleDescription}
              </p>

            </div>


            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedAssetModal(null)
                }
              >
                Close
              </button>


              <button
                className="primary-button"
                onClick={() => {

                  const assetId =
                    selectedAssetModal.id;

                  setSelectedAssetModal(null);

                  navigate(
                    `/cyber-dna?asset=${assetId}`
                  );

                }}
              >
                Cyber DNA
              </button>


              <button
                className="primary-button"
                onClick={() => {

                  const assetId =
                    selectedAssetModal.id;

                  setSelectedAssetModal(null);

                  navigate(
                    `/digital-twin?highlight=${assetId}`
                  );

                }}
              >
                Open in Twin
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================
          INCIDENT MODAL
          ===================================== */}

      {selectedIncidentModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedIncidentModal(null)
          }
        >

          <div
            className="modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <h3>
                Incident Overview:{" "}
                {selectedIncidentModal.id}
              </h3>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedIncidentModal(null)
                }
              >
                ✕
              </button>

            </div>


            <div className="modal-body">

              <h4>
                {selectedIncidentModal.title}
              </h4>

              <p>
                <strong>
                  Affected Asset:
                </strong>{" "}
                {selectedIncidentModal.assetName}
              </p>

              <p>
                <strong>
                  Severity:
                </strong>{" "}
                <SeverityBadge
                  severity={
                    selectedIncidentModal.severity
                  }
                />
              </p>

              <p>
                <strong>
                  Summary:
                </strong>{" "}
                {selectedIncidentModal.summary}
              </p>

            </div>


            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedIncidentModal(null)
                }
              >
                Close
              </button>


              <button
                className="primary-button"
                onClick={() => {

                  const incidentId =
                    selectedIncidentModal.id;

                  setSelectedIncidentModal(null);

                  navigate(
                    `/attack-paths?incident=${incidentId}`
                  );

                }}
              >
                Attack Path
              </button>


              <button
                className="primary-button"
                onClick={() => {

                  setSelectedIncidentModal(null);

                  setIsStoryModalOpen(true);

                }}
              >
                Play Story
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =====================================
          INCIDENT STORY ENGINE
          ===================================== */}

      {isStoryModalOpen && (

        <IncidentStoryEngine
          onClose={() =>
            setIsStoryModalOpen(false)
          }
        />

      )}

    </div>
  );
}