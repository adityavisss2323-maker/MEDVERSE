import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Filter,
  Eye,
  Search,
  ArrowUpRight,
  CheckCircle2,
  Siren,
  GitCommit
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";
import {
  SeverityBadge,
  StatusBadge
} from "../components/common/StatusBadge";
import { ExplainButton } from "../components/common/ExplainButton";
import { departments } from "../data/departments";

export default function Alerts() {
  const { t } = useLanguage();
  const { alertList } = useSOC();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSeverity =
    searchParams.get("severity") || "All";

  const [severityFilter, setSeverityFilter] =
    useState(initialSeverity);

  const [deptFilter, setDeptFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [focusMode, setFocusMode] =
    useState(false);

  const [selectedAlertModal, setSelectedAlertModal] =
    useState(null);

  const filteredAlerts = alertList.filter((alt) => {
    const matchesSev =
      severityFilter === "All" ||
      alt.severity?.toLowerCase() ===
        severityFilter.toLowerCase();

    const matchesDept =
      deptFilter === "All" ||
      alt.department?.toLowerCase() ===
        deptFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "All" ||
      alt.status?.toLowerCase() ===
        statusFilter.toLowerCase();

    const matchesFocus =
      !focusMode ||
      alt.severity === "Critical" ||
      alt.severity === "High";

    return (
      matchesSev &&
      matchesDept &&
      matchesStatus &&
      matchesFocus
    );
  });

  return (
    <div className="page alerts-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <p className="eyebrow">
            TELEMETRY & ALERTS
          </p>

          <h1>
            {t("nav.alerts")}
          </h1>

          <p className="page-description">
            Correlated cybersecurity alerts across hospital infrastructure
          </p>
        </div>

        <div className="header-actions">

          <button
            className={`control-button ${
              focusMode ? "control-active" : ""
            }`}
            onClick={() =>
              setFocusMode(!focusMode)
            }
          >
            <Eye size={16} />

            {focusMode
              ? "Focus Mode: High & Critical"
              : "Focus Mode"}
          </button>

          <ExplainButton
            title="Security Alert Management"
            explanation="Consolidates security events from EDR agents, network switches, and medical device monitors."
            simpleConcept="Critical alerts require immediate analyst review and containment."
          />

        </div>
      </div>

      {/* FILTER BAR */}
      <div className="dashboard-card alerts-filter-bar">

        <div className="filter-group">
          <Filter size={16} />
          <span>Filters:</span>
        </div>

        <div className="filter-selects">

          <select
            value={severityFilter}
            onChange={(e) =>
              setSeverityFilter(e.target.value)
            }
          >
            <option value="All">
              All Severities
            </option>

            <option value="Critical">
              Critical
            </option>

            <option value="High">
              High
            </option>

            <option value="Medium">
              Medium
            </option>

            <option value="Low">
              Low
            </option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) =>
              setDeptFilter(e.target.value)
            }
          >
            <option value="All">
              All Departments
            </option>

            {departments.map((d) => (
              <option
                key={d.id}
                value={d.name}
              >
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="All">
              All Statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Investigating">
              Investigating
            </option>

            <option value="Acknowledged">
              Acknowledged
            </option>
          </select>

          {(severityFilter !== "All" ||
            deptFilter !== "All" ||
            statusFilter !== "All") && (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSeverityFilter("All");
                setDeptFilter("All");
                setStatusFilter("All");
              }}
            >
              Clear Filters
            </button>
          )}

        </div>
      </div>

      {/* ALERTS TABLE */}
      <div className="dashboard-card alerts-table-card">

        <div className="table-responsive">

          <table className="alerts-table">

            <thead>
              <tr>
                <th>Severity</th>
                <th>Time</th>
                <th>Alert Title</th>
                <th>Asset</th>
                <th>Department</th>
                <th>Source</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredAlerts.length === 0 ? (

                <tr>
                  <td
                    colSpan="9"
                    className="empty-table"
                  >
                    No alerts match the selected filter criteria.
                  </td>
                </tr>

              ) : (

                filteredAlerts.map((alt) => (

                  <tr
                    key={alt.id}
                    className={`alert-row ${
                      alt.severity?.toLowerCase()
                    }`}
                  >

                    <td>
                      <SeverityBadge
                        severity={alt.severity}
                      />
                    </td>

                    <td className="time-cell">
                      {alt.timestamp}
                    </td>

                    <td className="title-cell">
                      <strong>
                        {alt.title}
                      </strong>

                      <small>
                        {alt.threatType}
                      </small>
                    </td>

                    <td>
                      <code>
                        {alt.assetName}
                      </code>
                    </td>

                    <td>
                      {alt.department}
                    </td>

                    <td className="source-cell">
                      {alt.source}
                    </td>

                    <td>
                      <strong className="conf-score">
                        {alt.confidence}%
                      </strong>
                    </td>

                    <td>
                      <StatusBadge
                        status={alt.status}
                      />
                    </td>

                    <td>

                      <div className="row-actions">

                        <button
                          className="table-action-btn"
                          onClick={() =>
                            setSelectedAlertModal(alt)
                          }
                          title="Investigate Evidence"
                        >
                          Investigate
                        </button>

                        <button
                          className="table-action-btn"
                          onClick={() =>
                            navigate(
                              `/digital-twin?highlight=${alt.assetId}`
                            )
                          }
                          title="View Asset in Twin"
                        >
                          Twin
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* ALERT INVESTIGATION MODAL */}
      {selectedAlertModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedAlertModal(null)
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
                Alert Detail:{" "}
                {selectedAlertModal.id}
              </h3>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedAlertModal(null)
                }
              >
                ✕
              </button>

            </div>

            <div className="modal-body">

              <h4>
                {selectedAlertModal.title}
              </h4>

              <p>
                <strong>
                  Target Asset:
                </strong>{" "}
                {selectedAlertModal.assetName}{" "}
                ({selectedAlertModal.department})
              </p>

              <p>
                <strong>
                  Severity:
                </strong>{" "}
                <SeverityBadge
                  severity={
                    selectedAlertModal.severity
                  }
                />
              </p>

              <p>
                <strong>
                  AI Confidence:
                </strong>{" "}
                {selectedAlertModal.confidence}%
              </p>

              <p>
                <strong>
                  Detection Time:
                </strong>{" "}
                {selectedAlertModal.timestamp}
              </p>

              <div className="evidence-box">

                <strong>
                  Forensic Evidence:
                </strong>

                <p>
                  {selectedAlertModal.evidence}
                </p>

              </div>

              <div className="evidence-box simple">

                <strong>
                  Plain Language Summary:
                </strong>

                <p>
                  {selectedAlertModal.simpleExplanation}
                </p>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedAlertModal(null)
                }
              >
                Close
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  setSelectedAlertModal(null);
                  navigate("/attack-paths");
                }}
              >
                Show Attack Path
              </button>

              <button
                className="primary-button"
                onClick={() => {
                  setSelectedAlertModal(null);
                  navigate("/incidents");
                }}
              >
                Create Incident
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}