import { useEffect, useState } from "react";
import {
  Zap,
  CheckCircle2,
  Info
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";
import { ExplainButton } from "../components/common/ExplainButton";
import { StatusBadge } from "../components/common/StatusBadge";
import { API_ENDPOINTS } from "../services/api";

export default function Response() {
  const { t } = useLanguage();

  const {
    assetList,
    quarantineAsset
  } = useSOC();

  const [selectedAssetId, setSelectedAssetId] =
    useState("");

  const [responseData, setResponseData] =
    useState(null);

  const [history, setHistory] =
    useState([]);

  const [activeActionModal, setActiveActionModal] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [executing, setExecuting] =
    useState(false);

  const [successNotice, setSuccessNotice] =
    useState(null);

  const [errorNotice, setErrorNotice] =
    useState(null);

  // =========================================================
  // SELECT FIRST ASSET
  // =========================================================

  useEffect(() => {
    if (
      assetList.length > 0 &&
      !selectedAssetId
    ) {
      setSelectedAssetId(
        assetList[0].id
      );
    }
  }, [
    assetList,
    selectedAssetId
  ]);

  // =========================================================
  // LOAD RESPONSE DATA
  // =========================================================

  useEffect(() => {
    if (!selectedAssetId) {
      return;
    }

    const loadResponseData = async () => {
      try {
        setLoading(true);
        setErrorNotice(null);

        const response = await fetch(
          `${API_ENDPOINTS.RESPONSES}/${selectedAssetId}`
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load response data"
          );
        }

        const result =
          await response.json();

        if (!result.success) {
          throw new Error(
            result.message ||
            "Failed to load response data"
          );
        }

        setResponseData(
          result.data || null
        );

      } catch (error) {
        console.error(
          "Response API Error:",
          error
        );

        setResponseData(null);

        setErrorNotice(
          error.message ||
          "Failed to load response data"
        );

      } finally {
        setLoading(false);
      }
    };

    loadResponseData();

  }, [selectedAssetId]);

  // =========================================================
  // LOAD RESPONSE HISTORY
  // =========================================================

  const loadResponseHistory = async () => {
    try {
      const response = await fetch(
        API_ENDPOINTS.RESPONSES
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load response history"
        );
      }

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
          "Failed to load response history"
        );
      }

      const allResponses =
        Array.isArray(result.data)
          ? result.data
          : [];

      const storedActions = [];

      allResponses.forEach(
        (item, itemIndex) => {

          const itemActions =
            Array.isArray(
              item.executedActions
            )
              ? item.executedActions
              : [];

          itemActions.forEach(
            (action, actionIndex) => {

              const uniqueId =
                action.id
                  ? String(action.id)
                  : `RA-${itemIndex}-${actionIndex}-${action.action || action.title || "ACTION"}-${action.executedAt || "RECORDED"}`;

              storedActions.push({

                id: uniqueId,

                timestamp:
                  action.executedAt
                    ? new Date(
                        action.executedAt
                      ).toLocaleTimeString(
                        "en-US",
                        {
                          hour12: false
                        }
                      )
                    : "Recorded",

                actionName:
                  action.title ||
                  action.action ||
                  "Response Action",

                targetAsset:
                  action.target ||
                  item.asset?.name ||
                  "",

                initiatedBy:
                  "SOC Analyst (Simulated)",

                status:
                  action.status ||
                  "Simulated",

                notes:
                  action.description ||
                  ""
              });
            }
          );
        }
      );

      setHistory(storedActions);

    } catch (error) {
      console.error(
        "Response History Error:",
        error
      );
    }
  };

  useEffect(() => {
    loadResponseHistory();
  }, []);

  // =========================================================
  // EXECUTE SIMULATED ACTION
  // =========================================================

  const handleConfirmAction = async () => {
    if (
      !activeActionModal ||
      !selectedAssetId ||
      executing
    ) {
      return;
    }

    try {
      setExecuting(true);
      setErrorNotice(null);
      setSuccessNotice(null);

      const response =
        await fetch(
          `${API_ENDPOINTS.RESPONSES}/${selectedAssetId}/execute`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              action:
                activeActionModal.action
            })
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
          "Failed to execute simulated action"
        );
      }

      // Update local asset state only.
      // The forensic event itself is stored by backend.
      if (
        activeActionModal.action ===
        "QUARANTINE_DEVICE"
      ) {
        quarantineAsset(
          selectedAssetId
        );
      }

      setSuccessNotice(
        `${activeActionModal.title} simulated successfully for ${selectedAssetId}.`
      );

      setActiveActionModal(null);

      // Refresh response information
      const refreshed =
        await fetch(
          `${API_ENDPOINTS.RESPONSES}/${selectedAssetId}`
        );

      if (refreshed.ok) {
        const refreshedData =
          await refreshed.json();

        if (refreshedData.success) {
          setResponseData(
            refreshedData.data || null
          );
        }
      }

      // Refresh history
      await loadResponseHistory();

      setTimeout(() => {
        setSuccessNotice(null);
      }, 4000);

    } catch (error) {
      console.error(
        "Execute Response Error:",
        error
      );

      setErrorNotice(
        error.message ||
        "Failed to execute simulated action"
      );

    } finally {
      setExecuting(false);
    }
  };

  // =========================================================
  // CURRENT ASSET
  // =========================================================

  const selectedAsset =
    assetList.find(
      (asset) =>
        String(asset.id) ===
        String(selectedAssetId)
    );

  // =========================================================
  // AVAILABLE ACTIONS
  // =========================================================

  const actions =
    Array.isArray(responseData?.actions)
      ? responseData.actions
      : [];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page response-page">

      {/* PAGE HEADER */}

      <div className="page-header">

        <div>

          <p className="eyebrow">
            CONTAINMENT & DEFENSE
          </p>

          <h1>
            {t("response.title")}
          </h1>

          <p className="page-description">
            {t("response.subtitle")}
          </p>

        </div>

        <ExplainButton
          title="Simulated Response Center"
          explanation="Allows SOC analysts to test containment actions generated from the active security state of an asset."
          simpleConcept="Actions are simulated and stored in the MED-VERSE backend without affecting real hospital devices."
        />

      </div>

      {/* SIMULATION NOTICE */}

      <div className="simulation-notice-banner">

        <Info size={18} />

        <span>
          SIMULATION MODE — DEFENSIVE ACTIONS
          ARE SIMULATED ONLY
        </span>

      </div>

      {/* SUCCESS */}

      {successNotice && (

        <div className="response-success-banner">

          <CheckCircle2 size={20} />

          <span>
            {successNotice}
          </span>

        </div>

      )}

      {/* ERROR */}

      {errorNotice && (

        <div className="response-success-banner">

          <Info size={20} />

          <span>
            {errorNotice}
          </span>

        </div>

      )}

      {/* TARGET SELECTION */}

      <div className="dashboard-card response-target-card">

        <h3>
          Target Asset Selection
        </h3>

        <div className="target-select-row">

          <label>
            Select Target Device:
          </label>

          <select
            value={selectedAssetId}
            onChange={(e) =>
              setSelectedAssetId(
                e.target.value
              )
            }
          >

            {assetList.map(
              (asset) => (

                <option
                  key={asset.id}
                  value={asset.id}
                >
                  {asset.name || asset.id} —{" "}
{asset.department || "Unknown Department"}{" "}
[Status:{" "}
{asset.status || "Normal"}]
                </option>

              )
            )}

          </select>

        </div>

      </div>

      {/* CURRENT RESPONSE STATUS */}

      {responseData && (

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>
                Response Assessment
              </h3>

              <p className="card-subtitle">
                {responseData.asset?.name}
              </p>

            </div>

            <span className="sim-badge">
              {responseData.responseMode ||
                "SIMULATION"}
            </span>

          </div>

          <div className="drawer-detail-grid">

            <div className="detail-item">

              <span className="detail-label">
                Active Alerts
              </span>

              <strong>
                {responseData.activeAlerts ?? 0}
              </strong>

            </div>

            <div className="detail-item">

              <span className="detail-label">
                Active Incidents
              </span>

              <strong>
                {responseData.activeIncidents ?? 0}
              </strong>

            </div>

            <div className="detail-item">

              <span className="detail-label">
                Asset Status
              </span>

              <StatusBadge
                status={
                  responseData.asset?.status ||
                  "Normal"
                }
              />

            </div>

            <div className="detail-item">

              <span className="detail-label">
                Risk Level
              </span>

              <StatusBadge
                status={
                  responseData.asset?.riskLevel ||
                  "Low"
                }
              />

            </div>

          </div>

        </div>

      )}

      {/* ACTION CARDS */}

      <div className="response-actions-grid">

        {loading ? (

          <div className="dashboard-card">

            <p>
              Loading response actions...
            </p>

          </div>

        ) : actions.length === 0 ? (

          <div className="dashboard-card">

            <h3>
              No Active Response Actions
            </h3>

            <p>
              No active security activity
              currently requires a simulated
              response for this asset.
            </p>

          </div>

        ) : (

          actions.map(
            (action, index) => (

              <div
                key={`${action.action || "ACTION"}-${action.id || index}-${index}`}
                className="dashboard-card response-action-card"
              >

                <div className="act-top">

                  <span className="act-cat">
                    SIMULATED RESPONSE
                  </span>

                  <span className="act-impact high">
                    {action.status}
                  </span>

                </div>

                <h4>
                  {action.title}
                </h4>

                <p className="act-desc">
                  {action.description}
                </p>

                <p className="act-effect">
                  ⚡ {action.reason}
                </p>

                <button
                  className="primary-button act-trigger-btn"
                  onClick={() =>
                    setActiveActionModal(
                      action
                    )
                  }
                  disabled={executing}
                >

                  <Zap size={16} />

                  <span>
                    Simulate{" "}
                    {action.title}
                  </span>

                </button>

              </div>

            )
          )

        )}

      </div>

      {/* RESPONSE HISTORY */}

      <div className="dashboard-card response-history-card">

        <h3>
          Recent Response Action Log
        </h3>

        <div className="table-responsive">

          <table className="alerts-table">

            <thead>

              <tr>
                <th>Time</th>
                <th>Action</th>
                <th>Target Asset</th>
                <th>Initiated By</th>
                <th>Status</th>
                <th>Simulated Effect</th>
              </tr>

            </thead>

            <tbody>

              {history.length === 0 ? (

                <tr>

                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center"
                    }}
                  >
                    No response actions
                    recorded yet.
                  </td>

                </tr>

              ) : (

                history.map(
                  (item, index) => (

                    <tr
                      key={`${item.id || "response"}-${index}`}
                    >

                      <td>
                        {item.timestamp}
                      </td>

                      <td>
                        <strong>
                          {item.actionName}
                        </strong>
                      </td>

                      <td>
                        <code>
                          {item.targetAsset}
                        </code>
                      </td>

                      <td>
                        {item.initiatedBy}
                      </td>

                      <td>
                        <StatusBadge
                          status={
                            item.status
                          }
                        />
                      </td>

                      <td className="notes-cell">
                        {item.notes}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* CONFIRMATION MODAL */}

      {activeActionModal && (

        <div
          className="modal-overlay"
          onClick={() =>
            setActiveActionModal(null)
          }
        >

          <div
            className="modal-card action-preview-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <h3>
                ACTION PREVIEW:{" "}
                {activeActionModal.title}
              </h3>

              <button
                className="close-btn"
                onClick={() =>
                  setActiveActionModal(null)
                }
              >
                ✕
              </button>

            </div>

            <div className="modal-body">

              <div className="preview-item">

                <span>
                  Target Asset:
                </span>

                <strong>
                  {selectedAsset?.name ||
                    selectedAssetId}
                </strong>

              </div>

              <div className="preview-item">

                <span>
                  Action:
                </span>

                <strong>
                  {activeActionModal.title}
                </strong>

              </div>

              <div className="preview-item">

                <span>
                  Target:
                </span>

                <strong>
                  {activeActionModal.target ||
                    selectedAsset?.name ||
                    selectedAssetId}
                </strong>

              </div>

              <div className="preview-item">

                <span>
                  Expected Effect:
                </span>

                <strong>
                  {activeActionModal.description}
                </strong>

              </div>

              <div className="preview-item">

                <span>
                  Mode:
                </span>

                <span className="sim-badge">
                  BACKEND SIMULATION MODE
                </span>

              </div>

            </div>

            <div className="modal-footer">

              <button
                className="secondary-button"
                onClick={() =>
                  setActiveActionModal(null)
                }
                disabled={executing}
              >
                Cancel
              </button>

              <button
                className="danger-button"
                onClick={
                  handleConfirmAction
                }
                disabled={executing}
              >
                {executing
                  ? "Executing..."
                  : "Confirm Simulation Action"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}