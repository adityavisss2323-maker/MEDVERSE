import { useState } from "react";
import { Terminal } from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";
import { SeverityBadge } from "../components/common/StatusBadge";
import { ExplainButton } from "../components/common/ExplainButton";
import { SecurityReplayPlayer } from "../components/replay/SecurityReplayPlayer";

export default function Forensics() {
  const { t } = useLanguage();
  const { forensicList = [] } = useSOC();

  const [filterSeverity, setFilterSeverity] = useState("All");
  const [selectedRawLog, setSelectedRawLog] = useState(null);

  /* =========================================
     FILTER FORENSIC EVENTS
     ========================================= */

  const filteredList = forensicList.filter((f) => {
    const severity = (
      f.severity || "Low"
    ).toLowerCase();

    return (
      filterSeverity === "All" ||
      severity === filterSeverity.toLowerCase()
    );
  });

  return (
    <div className="page forensics-page">

      {/* =========================================
          PAGE HEADER
          ========================================= */}

      <div className="page-header">

        <div>

          <p className="eyebrow">
            CHRONOLOGICAL RECONSTRUCTION
          </p>

          <h1>
            {t("nav.forensics")}
          </h1>

          <p className="page-description">
            Reconstruct incidents through an interactive
            forensic timeline
          </p>

        </div>

        <ExplainButton
          title="Forensic Time Machine"
          explanation="Records system logs, process executions, and network flows in exact chronological sequence."
          simpleConcept="Allows security analysts to replay an attack step-by-step and inspect exact timestamps."
        />

      </div>

      {/* =========================================
          SECURITY REPLAY
          ========================================= */}

      <SecurityReplayPlayer />

      {/* =========================================
          FORENSIC TIMELINE
          ========================================= */}

      <div className="dashboard-card forensics-timeline-card">

        <div className="card-header">

          <h3>
            Forensic Event Timeline
          </h3>

          <div className="filter-group">

            <select
              value={filterSeverity}
              onChange={(e) =>
                setFilterSeverity(e.target.value)
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

            </select>

          </div>

        </div>

        <div className="forensic-timeline-list">

          {/* =========================================
              EMPTY STATE
              ========================================= */}

          {filteredList.length === 0 ? (

            <div className="dashboard-card">

              <p>
                No forensic events are available
                for the selected severity.
              </p>

            </div>

          ) : (

            /* =========================================
               FORENSIC EVENTS
               ========================================= */

            filteredList.map((evt) => {

              const severity =
                evt.severity || "Low";

              return (
                <div
                  key={evt.id}
                  className="timeline-item"
                >

                  {/* TIMESTAMP */}

                  <div className="timeline-left">

                    <span className="evt-timestamp">
                      {evt.timestamp || "Unknown"}
                    </span>

                    <span className="evt-ago">
                      {evt.timeAgo || "Recorded"}
                    </span>

                  </div>

                  {/* TIMELINE CONNECTOR */}

                  <div className="timeline-dot-connector">

                    <div
                      className={`t-dot ${severity.toLowerCase()}`}
                    ></div>

                    <div className="t-line"></div>

                  </div>

                  {/* EVENT CONTENT */}

                  <div className="timeline-right-content">

                    <div className="evt-top">

                      <SeverityBadge
                        severity={severity}
                      />

                      <span className="evt-type-tag">
                        {evt.eventType || "EVENT"}
                      </span>

                      <span className="evt-asset-tag">

                        <code>
                          {evt.assetName ||
                            "Unknown Asset"}
                        </code>

                        {" ("}

                        {evt.department ||
                          "Unknown Department"}

                        {")"}

                      </span>

                    </div>

                    <h4>
                      {evt.title ||
                        "Forensic Event"}
                    </h4>

                    <p>
                      {evt.description ||
                        "No event description available."}
                    </p>

                    {/* RAW LOG */}

                    <button
                      className="raw-log-btn"
                      onClick={() =>
                        setSelectedRawLog(evt)
                      }
                    >

                      <Terminal size={14} />

                      <span>
                        Inspect Raw Audit Log
                      </span>

                    </button>

                  </div>

                </div>
              );
            })

          )}

        </div>

      </div>

      {/* =========================================
          RAW LOG INSPECTOR MODAL
          ========================================= */}

      {selectedRawLog && (

        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedRawLog(null)
          }
        >

          <div
            className="modal-card log-modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <h3>
                Raw Audit Log:{" "}
                {selectedRawLog.id}
              </h3>

              <button
                className="close-btn"
                onClick={() =>
                  setSelectedRawLog(null)
                }
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="modal-body">

              <p>
                <strong>
                  Timestamp:
                </strong>{" "}
                {selectedRawLog.timestamp ||
                  "Unknown"}
              </p>

              <p>
                <strong>
                  Asset:
                </strong>{" "}
                {selectedRawLog.assetName ||
                  "Unknown Asset"}
              </p>

              <p>
                <strong>
                  Event Type:
                </strong>{" "}
                {selectedRawLog.eventType ||
                  "EVENT"}
              </p>

              <div className="terminal-log-box">

                <pre>
                  {selectedRawLog.rawLog ||
                    "No raw audit log available."}
                </pre>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="modal-footer">

              <button
                className="primary-button"
                onClick={() =>
                  setSelectedRawLog(null)
                }
              >
                Close Inspector
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}