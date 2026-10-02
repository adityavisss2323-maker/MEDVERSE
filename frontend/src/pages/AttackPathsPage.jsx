import { useState, useEffect } from "react";
import {
  Play,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Activity,
  Target,
  GitBranch
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { ExplainButton } from "../components/common/ExplainButton";
import { SeverityBadge } from "../components/common/StatusBadge";
import { API_ENDPOINTS } from "../services/api";

export default function AttackPathsPage() {
  const { t } = useLanguage();

  const [attackPaths, setAttackPaths] = useState([]);
  const [selectedPathId, setSelectedPathId] = useState("");
  const [activeStep, setActiveStep] = useState(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedIndex, setAnimatedIndex] = useState(-1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * Load attack paths from backend
   */
  useEffect(() => {
    let isMounted = true;

    const loadAttackPaths = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          API_ENDPOINTS.ATTACK_PATHS
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
            "Failed to load attack paths"
          );
        }

        const paths = Array.isArray(result.data)
          ? result.data
          : [];

        if (!isMounted) return;

        setAttackPaths(paths);

        if (paths.length > 0) {
          setSelectedPathId(
            String(paths[0].id)
          );
        }

      } catch (err) {
        console.error(
          "Attack Paths API Error:",
          err
        );

        if (!isMounted) return;

        setError(
          err.message ||
          "Failed to load attack paths"
        );

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAttackPaths();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * Find selected path
   */
  const path =
    attackPaths.find(
      (p) =>
        String(p.id) ===
        String(selectedPathId)
    ) || attackPaths[0];

  /*
   * Stop animation when path changes
   */
  useEffect(() => {
    setActiveStep(null);
    setAnimatedIndex(-1);
    setIsAnimating(false);
  }, [selectedPathId]);

  /*
   * Animate attack path
   */
  const handleAnimate = () => {
    if (
      !path ||
      !Array.isArray(path.nodes) ||
      path.nodes.length === 0 ||
      isAnimating
    ) {
      return;
    }

    setIsAnimating(true);
    setAnimatedIndex(0);

    let idx = 0;

    const interval = setInterval(() => {
      idx++;

      if (idx >= path.nodes.length) {
        clearInterval(interval);

        setAnimatedIndex(
          path.nodes.length - 1
        );

        setIsAnimating(false);

        return;
      }

      setAnimatedIndex(idx);
    }, 1500);

    // Store cleanup on window temporarily
    window.__MEDVERSE_ATTACK_INTERVAL__ =
      interval;
  };

  /*
   * Cleanup animation
   */
  useEffect(() => {
    return () => {
      if (
        window.__MEDVERSE_ATTACK_INTERVAL__
      ) {
        clearInterval(
          window.__MEDVERSE_ATTACK_INTERVAL__
        );

        delete window.__MEDVERSE_ATTACK_INTERVAL__;
      }
    };
  }, []);

  /*
   * Change scenario
   */
  const handlePathChange = (e) => {
    setSelectedPathId(e.target.value);
    setActiveStep(null);
    setAnimatedIndex(-1);
    setIsAnimating(false);

    if (
      window.__MEDVERSE_ATTACK_INTERVAL__
    ) {
      clearInterval(
        window.__MEDVERSE_ATTACK_INTERVAL__
      );

      delete window.__MEDVERSE_ATTACK_INTERVAL__;
    }
  };

  /*
   * Progress calculation
   */
  const completedSteps =
    isAnimating && animatedIndex >= 0
      ? animatedIndex + 1
      : path?.nodes?.length || 0;

  const totalSteps =
    path?.nodes?.length || 0;

  const progressPercentage =
    totalSteps > 0
      ? Math.round(
          (completedSteps /
            totalSteps) *
            100
        )
      : 0;

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="page attack-paths-page">

        <div className="page-header">

          <div>

            <p className="eyebrow">
              MULTISTAGE THREAT MAPPING
            </p>

            <h1>
              {t("attackPath.title")}
            </h1>

            <p className="page-description">
              {t("attackPath.subtitle")}
            </p>

          </div>

        </div>

        <div className="dashboard-card">
          <p>
            Loading attack paths...
          </p>
        </div>

      </div>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <div className="page attack-paths-page">

        <div className="page-header">

          <div>

            <p className="eyebrow">
              MULTISTAGE THREAT MAPPING
            </p>

            <h1>
              {t("attackPath.title")}
            </h1>

            <p className="page-description">
              {t("attackPath.subtitle")}
            </p>

          </div>

          <ExplainButton
            title="Attack Path Visualization"
            explanation="Maps how a cyber attack entered the hospital network, moved across systems, and progressed toward sensitive assets."
            simpleConcept="Each card represents one stage of the attack path. Select a stage to inspect its evidence."
          />

        </div>

        <div className="dashboard-card">

          <div className="empty-attack-path">
            {error}
          </div>

        </div>

      </div>
    );
  }

  /*
   * Empty state
   */
  if (!attackPaths.length) {
    return (
      <div className="page attack-paths-page">

        <div className="page-header">

          <div>

            <p className="eyebrow">
              MULTISTAGE THREAT MAPPING
            </p>

            <h1>
              {t("attackPath.title")}
            </h1>

            <p className="page-description">
              {t("attackPath.subtitle")}
            </p>

          </div>

          <ExplainButton
            title="Attack Path Visualization"
            explanation="Maps how a cyber attack entered the hospital network, moved across systems, and progressed toward sensitive assets."
            simpleConcept="Each card represents one stage of the attack path. Select a stage to inspect its evidence."
          />

        </div>

        <div className="dashboard-card">

          <div className="empty-attack-path">
            No attack paths are available.
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="page attack-paths-page">

      {/* HEADER */}

      <div className="page-header">

        <div>

          <p className="eyebrow">
            MULTISTAGE THREAT MAPPING
          </p>

          <h1>
            {t("attackPath.title")}
          </h1>

          <p className="page-description">
            {t("attackPath.subtitle")}
          </p>

        </div>

        <ExplainButton
          title="Attack Path Visualization"
          explanation="Maps how a cyber attack entered the hospital network, moved across systems, and progressed toward sensitive assets."
          simpleConcept="Each card represents one stage of the attack path. Select a stage to inspect its evidence."
        />

      </div>

      {/* SCENARIO CONTROL */}

      <div className="dashboard-card attack-scenario-card">

        <div className="scenario-top">

          <div className="scenario-selector">

            <div className="scenario-label">

              <GitBranch size={18} />

              <span>
                Select Attack Scenario
              </span>

            </div>

            <select
              value={selectedPathId}
              onChange={handlePathChange}
            >

              {attackPaths.map((p) => (

                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.title}
                  {p.incidentId
                    ? ` (${p.incidentId})`
                    : ""}
                </option>

              ))}

            </select>

          </div>

          <button
            className={`animate-btn ${
              isAnimating
                ? "animating"
                : ""
            }`}
            onClick={handleAnimate}
            disabled={
              isAnimating ||
              !path ||
              !path.nodes?.length
            }
          >

            <Play size={17} />

            <span>
              {isAnimating
                ? "Animating Path..."
                : "Animate Attack Path"}
            </span>

          </button>

        </div>

        {/* SCENARIO SUMMARY */}

        {path && (

          <div className="attack-summary-grid">

            <div className="attack-summary-item">

              <div className="summary-icon">
                <ShieldAlert size={18} />
              </div>

              <div>

                <span>
                  Scenario
                </span>

                <strong>
                  {path.title}
                </strong>

              </div>

            </div>

            <div className="attack-summary-item">

              <div className="summary-icon">
                <Target size={18} />
              </div>

              <div>

                <span>
                  Incident
                </span>

                <strong>
                  {path.incidentId || "N/A"}
                </strong>

              </div>

            </div>

            <div className="attack-summary-item">

              <div className="summary-icon">
                <Activity size={18} />
              </div>

              <div>

                <span>
                  Attack Stages
                </span>

                <strong>
                  {totalSteps} Stages
                </strong>

              </div>

            </div>

            <div className="attack-summary-item">

              <div className="summary-icon">
                <CheckCircle2 size={18} />
              </div>

              <div>

                <span>
                  Path Progress
                </span>

                <strong>
                  {completedSteps}/
                  {totalSteps}
                </strong>

              </div>

            </div>

          </div>

        )}

        {/* PROGRESS */}

        {path && totalSteps > 0 && (

          <div className="attack-progress-section">

            <div className="attack-progress-header">

              <span>
                Attack Path Progress
              </span>

              <span>
                {progressPercentage}%
              </span>

            </div>

            <div className="attack-progress-bar">

              <div
                className="attack-progress-fill"
                style={{
                  width:
                    `${progressPercentage}%`
                }}
              />

            </div>

          </div>

        )}

      </div>

      {/* ATTACK PATH */}

      <div className="dashboard-card attack-path-card">

        <div className="attack-path-header">

          <div>

            <h3>
              Attack Progression
            </h3>

            <p>
              Select any stage to inspect the associated
              evidence and MITRE technique.
            </p>

          </div>

          <div className="attack-path-status">

            <span className="status-dot" />

            Simulated Threat Path

          </div>

        </div>

        <div className="attack-tree-container">

          <div className="tree-nodes-list">

            {path?.nodes?.length > 0 ? (

              path.nodes.map(
                (node, index) => {

                  const isHighlighted =
                    isAnimating
                      ? index <= animatedIndex
                      : true;

                  const isSelected =
                    activeStep?.id ===
                    node.id;

                  return (

                    <div
                      key={node.id}
                      className="tree-node-wrapper"
                    >

                      <div
                        className={`
                          tree-node-card
                          ${node.severity?.toLowerCase() || ""}
                          ${
                            isHighlighted
                              ? "highlighted"
                              : "dimmed"
                          }
                          ${
                            isSelected
                              ? "selected"
                              : ""
                          }
                        `}
                        onClick={() =>
                          setActiveStep(node)
                        }
                      >

                        <div className="node-step-badge">
                          STEP {node.step}
                        </div>

                        <div className="node-main">

                          <div className="node-title-row">

                            <h4>
                              {node.title}
                            </h4>

                            <SeverityBadge
                              severity={
                                node.severity ||
                                "Low"
                              }
                            />

                          </div>

                          <p className="node-asset">

                            {node.assetName ||
                              "Unknown Asset"}

                            <span>
                              {" • "}
                            </span>

                            {node.department ||
                              "Unknown Department"}

                          </p>

                          <div className="node-tech-box">

                            {node.technique ||
                              "Technique not available"}

                          </div>

                        </div>

                        <div className="node-footer">

                          <span className="node-time">
                            {node.timestamp ||
                              "N/A"}
                          </span>

                          <button
                            className="inspect-node-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveStep(node);
                            }}
                          >
                            Inspect
                          </button>

                        </div>

                      </div>

                      {index <
                        path.nodes.length - 1 && (

                        <div
                          className={`
                            node-arrow-connector
                            ${
                              isHighlighted
                                ? "active-flow"
                                : ""
                            }
                          `}
                        >

                          <div className="connector-line" />

                          <ArrowRight size={22} />

                        </div>

                      )}

                    </div>

                  );
                }
              )

            ) : (

              <div className="empty-attack-path">

                No attack path stages are available
                for this scenario.

              </div>

            )}

          </div>

        </div>

        {/* LEGEND */}

        <div className="attack-path-legend">

          <span className="legend-title">
            Path Legend
          </span>

          <span>
            <i className="legend-dot medium" />
            Medium
          </span>

          <span>
            <i className="legend-dot high" />
            High
          </span>

          <span>
            <i className="legend-dot critical" />
            Critical
          </span>

          <span>
            <i className="legend-line" />
            Attack Flow
          </span>

        </div>

      </div>

      {/* EVIDENCE MODAL */}

      {activeStep && (

        <div
          className="modal-overlay"
          onClick={() =>
            setActiveStep(null)
          }
        >

          <div
            className="modal-card attack-evidence-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>

                <span className="modal-eyebrow">
                  ATTACK PATH EVIDENCE
                </span>

                <h3>
                  Step {activeStep.step}:{" "}
                  {activeStep.title}
                </h3>

              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setActiveStep(null)
                }
              >
                ✕
              </button>

            </div>

            <div className="modal-body">

              <div className="evidence-summary-grid">

                <div>

                  <span>
                    Target Asset
                  </span>

                  <strong>
                    {activeStep.assetName ||
                      "Unknown Asset"}
                  </strong>

                </div>

                <div>

                  <span>
                    Department
                  </span>

                  <strong>
                    {activeStep.department ||
                      "Unknown Department"}
                  </strong>

                </div>

                <div>

                  <span>
                    Timestamp
                  </span>

                  <strong>
                    {activeStep.timestamp ||
                      "N/A"}
                  </strong>

                </div>

                <div>

                  <span>
                    Severity
                  </span>

                  <SeverityBadge
                    severity={
                      activeStep.severity ||
                      "Low"
                    }
                  />

                </div>

              </div>

              <div className="evidence-technique">

                <span>
                  MITRE ATT&CK Technique
                </span>

                <strong>
                  {activeStep.technique ||
                    "Technique not available"}
                </strong>

              </div>

              <div className="evidence-box">

                <div className="evidence-box-title">

                  <ShieldAlert size={17} />

                  Forensic Evidence

                </div>

                <p>
                  {activeStep.evidence ||
                    "No forensic evidence available."}
                </p>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="primary-button"
                onClick={() =>
                  setActiveStep(null)
                }
              >
                Close Evidence
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}