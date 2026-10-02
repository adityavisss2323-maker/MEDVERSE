import { useState } from "react";
import {
  Activity,
  X,
} from "lucide-react";

import { ExplainButton } from "../common/ExplainButton";
import { useSOC } from "../../context/SOCContext";

export function SecurityPulse() {
  const [expanded, setExpanded] = useState(false);

  const {
    assetList = [],
    alertList = [],
    incidentList = [],
  } = useSOC();

  /* =========================================
     REAL SECURITY DATA
     ========================================= */

  // Only alerts that are currently active
  const activeAlertList = alertList.filter((alert) => {
    const status = alert.status?.toLowerCase();

    return (
      status === "active" ||
      status === "new" ||
      status === "investigating"
    );
  });

  const totalAlerts = activeAlertList.length;

  const criticalAlerts = activeAlertList.filter(
    (alert) =>
      alert.severity?.toLowerCase() === "critical"
  ).length;

  const highAlerts = activeAlertList.filter(
    (alert) =>
      alert.severity?.toLowerCase() === "high"
  ).length;

  const affectedAssets = new Set(
    activeAlertList
      .map(
        (alert) =>
          alert.assetId ||
          alert.assetName
      )
      .filter(Boolean)
  ).size;

  const activeIncidents = incidentList.filter(
    (incident) => {
      const status =
        incident.status?.toLowerCase();

      return (
        status === "open" ||
        status === "investigating" ||
        status === "contained" ||
        status === "in progress"
      );
    }
  ).length;

  /* =========================================
     CALCULATE SECURITY PULSE
     ========================================= */

  const alertPressure =
    totalAlerts > 0
      ? Math.min(totalAlerts * 10, 40)
      : 0;

  const criticalPressure =
    criticalAlerts * 20;

  const highPressure =
    highAlerts * 10;

  const incidentPressure =
    activeIncidents * 15;

  const assetPressure =
    affectedAssets * 5;

  const pulseScore = Math.min(
    100,
    Math.round(
      alertPressure +
      criticalPressure +
      highPressure +
      incidentPressure +
      assetPressure
    )
  );

  /* =========================================
     PULSE LEVEL
     ========================================= */

  let pulseLevel = "LOW";
  let pulseClass = "normal";

  if (pulseScore >= 75) {
    pulseLevel = "HIGH PRESSURE";
    pulseClass = "critical";
  } else if (pulseScore >= 50) {
    pulseLevel = "ELEVATED";
    pulseClass = "high";
  } else if (pulseScore >= 25) {
    pulseLevel = "GUARDED";
    pulseClass = "medium";
  }

  /* =========================================
     ASSET RISK
     ========================================= */

  const highRiskAssets = assetList.filter(
    (asset) => {
      const risk =
        asset.risk?.toLowerCase();

      return (
        risk === "high" ||
        risk === "critical"
      );
    }
  ).length;

  /* =========================================
     NETWORK STABILITY
     ========================================= */

  /*
   * Current backend does not provide
   * network uptime telemetry.
   *
   * Therefore we do not invent
   * an uptime percentage.
   */
  const networkStability =
    assetList.length > 0
      ? "MONITORED"
      : "NO DATA";

  return (
    <div className="dashboard-card security-pulse-card">

      {/* HEADER */}

      <div className="card-header">

        <div className="card-title-wrap">

          <Activity
            size={18}
            className="teal-icon"
          />

          <div>

            <h3>
              Security Pulse
            </h3>

            <p className="card-subtitle">
              MED-VERSE Real-Time Threat Dynamics
            </p>

          </div>

        </div>

        <ExplainButton
          title="Security Pulse Concept"
          explanation="Instead of a single static number, Security Pulse combines alert volume, asset risk, and system stability into a live visual heartbeat."
          simpleConcept="Higher pulse frequency indicates elevated threat activity across hospital subnets."
        />

      </div>

      {/* PULSE VISUAL */}

      <div
        className="pulse-visual-area"
        onClick={() => setExpanded(true)}
      >

        <div className="pulse-ring-outer">

          <div className="pulse-ring-middle">

            <div className="pulse-core-glow">

              <Activity
                size={28}
                className="pulse-icon"
              />

            </div>

          </div>

        </div>

        <div className="pulse-summary">

          <span
            className={`pulse-level-badge ${pulseClass}`}
          >
            {pulseLevel}
          </span>

          <strong>
            {pulseScore} / 100 Anomaly Pulse
          </strong>

          <p>
            Click to inspect driving security factors
          </p>

        </div>

      </div>

      {/* EXPANDED PANEL */}

      {expanded && (

        <div className="pulse-expanded-panel">

          <div className="panel-header">

            <h4>
              What is driving the current
              security pulse?
            </h4>

            <button
              onClick={() =>
                setExpanded(false)
              }
            >
              <X size={16} />
            </button>

          </div>

          <div className="pulse-metrics-grid">

            {/* ALERT PRESSURE */}

            <div className="pulse-metric-row">

              <span>
                Alert Pressure
              </span>

              <strong className="text-red">

                {totalAlerts > 0
                  ? `HIGH (${totalAlerts} Active Alerts)`
                  : "LOW (No Active Alerts)"}

              </strong>

            </div>

            {/* ASSET RISK */}

            <div className="pulse-metric-row">

              <span>
                Asset Risk Level
              </span>

              <strong className="text-orange">

                {highRiskAssets > 0
                  ? `HIGH (${highRiskAssets} High/Critical Risk Assets)`
                  : affectedAssets > 0
                    ? `MEDIUM (${affectedAssets} Assets Affected)`
                    : "LOW (No Affected Assets)"}

              </strong>

            </div>

            {/* CRITICAL THREATS */}

            <div className="pulse-metric-row">

              <span>
                Critical Threats
              </span>

              <strong className="text-red">

                {criticalAlerts > 0
                  ? `${criticalAlerts} Critical Alerts`
                  : `${activeIncidents} Active Incidents`}

              </strong>

            </div>

            {/* NETWORK STABILITY */}

            <div className="pulse-metric-row">

              <span>
                Network Stability
              </span>

              <strong className="text-green">
                {networkStability}
              </strong>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}