import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Play,
  GitCommit
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";
import {
  SeverityBadge,
  StatusBadge
} from "../components/common/StatusBadge";
import { ExplainButton } from "../components/common/ExplainButton";
import { IncidentStoryEngine } from "../components/story/IncidentStoryEngine";

export default function Incidents() {
  const { t } = useLanguage();
  const { incidentList } = useSOC();
  const navigate = useNavigate();

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [isStoryOpen, setIsStoryOpen] =
    useState(false);

  return (
    <div className="page incidents-page">

      {/* PAGE HEADER */}
      <div className="page-header">

        <div>
          <p className="eyebrow">
            CAMPAIGN CORRELATION
          </p>

          <h1>
            {t("nav.incidents")}
          </h1>

          <p className="page-description">
            Manage and investigate correlated security incidents across hospital wings
          </p>
        </div>

        <ExplainButton
          title="Security Incidents"
          explanation="An Incident groups related alerts together into a single security event campaign."
          simpleConcept="Related security alerts can be investigated together as one incident."
        />

      </div>

      {/* INCIDENT LIST */}
      <div className="incidents-grid">

        {incidentList.length === 0 ? (

          <div className="dashboard-card">
            <p>
              No security incidents are currently available.
            </p>
          </div>

        ) : (

          incidentList.map((inc) => (

            <div
              key={inc.id}
              className="dashboard-card incident-card-item"
            >

              <div className="incident-card-header">

                <div className="inc-id-badge">
                  {inc.id}
                </div>

                <SeverityBadge
                  severity={inc.severity}
                />

              </div>

              <h3 className="inc-card-title">
                {inc.title}
              </h3>

              <div className="inc-card-meta">

                <span>
                  📍 Asset:{" "}
                  <strong>
                    {inc.assetName || "Not Available"}
                  </strong>
                </span>

                <span>
                  🏥 Department:{" "}
                  <strong>
                    {inc.department || "Not Available"}
                  </strong>
                </span>

                <span>
                  ⏰ Detected:{" "}
                  {inc.detectionTime || "Not Available"}
                </span>

              </div>

              <p className="inc-card-summary">
                {inc.summary ||
                  inc.simpleSummary ||
                  "No incident summary is available."}
              </p>

              <div className="inc-card-footer">

                <StatusBadge
                  status={inc.status}
                />

                <button
                  className="primary-button inc-open-btn"
                  onClick={() =>
                    setSelectedIncident(inc)
                  }
                >
                  <span>
                    Investigate
                  </span>

                  <ArrowUpRight size={16} />
                </button>

              </div>

            </div>

          ))

        )}

      </div>

      {/* INCIDENT DETAILS */}
      {selectedIncident && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedIncident(null)
          }
        >

          <div
            className="modal-card incident-drawer-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="eyebrow">
                  {selectedIncident.id}
                </span>

                <h3>
                  {selectedIncident.title}
                </h3>

              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedIncident(null)
                }
              >
                ✕
              </button>

            </div>

            <div className="modal-body">

              <div className="detail-grid">

                <div>
                  <span>
                    Affected Asset:
                  </span>{" "}
                  <strong>
                    {selectedIncident.assetName ||
                      "Not Available"}
                  </strong>
                </div>

                <div>
                  <span>
                    Department:
                  </span>{" "}
                  <strong>
                    {selectedIncident.department ||
                      "Not Available"}
                  </strong>
                </div>

                <div>
                  <span>
                    AI Confidence:
                  </span>{" "}
                  <strong>
                    {selectedIncident.aiConfidence ??
                      selectedIncident.confidence ??
                      0}
                    %
                  </strong>
                </div>

                <div>
                  <span>
                    Severity:
                  </span>{" "}
                  <SeverityBadge
                    severity={
                      selectedIncident.severity
                    }
                  />
                </div>

                <div>
                  <span>
                    Threat Type:
                  </span>{" "}
                  <strong>
                    {selectedIncident.threatType ||
                      "Not Available"}
                  </strong>
                </div>

                <div>
                  <span>
                    Status:
                  </span>{" "}
                  <StatusBadge
                    status={
                      selectedIncident.status
                    }
                  />
                </div>

              </div>

              <div className="evidence-box">

                <strong>
                  Technical Summary:
                </strong>

                <p>
                  {selectedIncident.summary ||
                    selectedIncident.description ||
                    "No technical summary is available."}
                </p>

              </div>

              <div className="evidence-box simple">

                <strong>
                  Executive / Simple Summary:
                </strong>

                <p>
                  {selectedIncident.simpleSummary ||
                    selectedIncident.summary ||
                    "No simple summary is available."}
                </p>

              </div>

              <div className="evidence-box action">

                <strong>
                  Recommended Action:
                </strong>

                <p>
                  {selectedIncident.recommendedAction ||
                    (Array.isArray(
                      selectedIncident.recommendedActions
                    )
                      ? selectedIncident.recommendedActions.join(
                          ". "
                        )
                      : "No recommended action is available.")}
                </p>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setSelectedIncident(null)
                }
              >
                Close
              </button>

              <button
                className="secondary-button"
                onClick={() => {
                  const incidentId =
                    selectedIncident.id;

                  setSelectedIncident(null);

                  navigate(
                    `/attack-paths?incident=${incidentId}`
                  );
                }}
              >
                <GitCommit size={15} />
                Attack Path
              </button>

              <button
                className="primary-button"
                onClick={() =>
                  setIsStoryOpen(true)
                }
              >
                <Play size={15} />
                Incident Story
              </button>

            </div>

          </div>

        </div>

      )}

      {/* INCIDENT STORY */}
      {isStoryOpen && (
        <IncidentStoryEngine
          onClose={() =>
            setIsStoryOpen(false)
          }
        />
      )}

    </div>
  );
}