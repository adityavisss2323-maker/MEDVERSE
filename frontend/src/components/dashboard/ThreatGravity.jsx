import { useState, useEffect } from "react";
import {
  Network,
  Server,
  ShieldAlert,
} from "lucide-react";

import { ExplainButton } from "../common/ExplainButton";
import { useSOC } from "../../context/SOCContext";

export function ThreatGravity() {
  const { assetList = [] } = useSOC();

  const [selectedCore, setSelectedCore] = useState(
    assetList[0] || null
  );

  /* =========================================
     SYNC SELECTED ASSET WITH BACKEND DATA
     ========================================= */

  useEffect(() => {
    if (assetList.length === 0) {
      setSelectedCore(null);
      return;
    }

    setSelectedCore((current) => {
      if (!current) {
        return assetList[0];
      }

      const updatedAsset = assetList.find(
        (asset) =>
          String(asset.id) ===
          String(current.id)
      );

      return updatedAsset || assetList[0];
    });
  }, [assetList]);

  /* =========================================
     REAL BACKEND THREAT GRAVITY DATA
     ========================================= */

  const affectedSystems = Array.isArray(
    selectedCore?.threatGravityImpact
  )
    ? selectedCore.threatGravityImpact
    : [];

  /* =========================================
     NO ASSETS
     ========================================= */

  if (assetList.length === 0) {
    return (
      <div className="dashboard-card threat-gravity-card">

        <div className="card-header">

          <div className="card-title-wrap">

            <Network
              size={18}
              className="teal-icon"
            />

            <div>

              <h3>
                MED-VERSE Threat Gravity
              </h3>

              <p className="card-subtitle">
                Asset Risk Influence & Blast Radius Visualizer
              </p>

            </div>

          </div>

          <ExplainButton
            title="MED-VERSE Threat Gravity"
            explanation="High-criticality assets exert stronger visual risk influence over connected medical infrastructure."
            simpleConcept="Select an asset to view which secondary hospital systems will be affected if it becomes compromised."
          />

        </div>

        <div className="gravity-content">

          <p className="no-impact">
            No assets available.
          </p>

        </div>

      </div>
    );
  }

  /* =========================================
     ASSET SELECTION
     ========================================= */

  const handleAssetChange = (e) => {
    const selectedId = e.target.value;

    const foundAsset = assetList.find(
      (asset) =>
        String(asset.id) ===
        String(selectedId)
    );

    if (foundAsset) {
      setSelectedCore(foundAsset);
    }
  };

  return (
    <div className="dashboard-card threat-gravity-card">

      {/* HEADER */}

      <div className="card-header">

        <div className="card-title-wrap">

          <Network
            size={18}
            className="teal-icon"
          />

          <div>

            <h3>
              MED-VERSE Threat Gravity
            </h3>

            <p className="card-subtitle">
              Asset Risk Influence & Blast Radius Visualizer
            </p>

          </div>

        </div>

        <ExplainButton
          title="MED-VERSE Threat Gravity"
          explanation="High-criticality assets exert stronger visual risk influence over connected medical infrastructure."
          simpleConcept="Select an asset to view which secondary hospital systems will be affected if it becomes compromised."
        />

      </div>

      {/* CONTENT */}

      <div className="gravity-content">

        {/* ASSET SELECTOR */}

        <div className="gravity-asset-selector">

          <label>
            Focus Critical Asset:
          </label>

          <select
            value={selectedCore?.id || ""}
            onChange={handleAssetChange}
          >

            {assetList.map((asset) => (

              <option
                key={asset.id}
                value={asset.id}
              >

                {asset.name || asset.id}
                {" — Criticality: "}
                {Number(
                  asset.criticalityScore || 0
                )}
                /100
                {" ("}
                {asset.department ||
                  "Unknown"}
                {")"}

              </option>

            ))}

          </select>

        </div>

        {/* GRAVITY DIAGRAM */}

        <div className="gravity-diagram">

          {/* CENTER ASSET */}

          <div className="gravity-center-node">

            <div
              className={`center-circle ${
                selectedCore?.status ||
                "normal"
              }`}
            >

              <Server size={22} />

            </div>

            <strong>
              {selectedCore?.name ||
                selectedCore?.id ||
                "Unknown Asset"}
            </strong>

            <span className="criticality-badge">
              Score:{" "}
              {Number(
                selectedCore?.criticalityScore ||
                0
              )}
            </span>

          </div>

          {/* CONNECTION */}

          <div className="gravity-rays">

            <div className="ray-line"></div>

          </div>

          {/* BLAST RADIUS */}

          <div className="gravity-impact-nodes">

            <p className="impact-title">

              BLAST RADIUS
              {" ("}
              {affectedSystems.length}
              {" Affected Systems):"}

            </p>

            <div className="impact-chips">

              {affectedSystems.length === 0 ? (

                <span className="no-impact">
                  No blast radius impact mapped.
                </span>

              ) : (

                affectedSystems.map(
                  (systemId, index) => (

                    <div
                      key={`${systemId}-${index}`}
                      className="impact-chip"
                    >

                      <ShieldAlert
                        size={14}
                        className="impact-icon"
                      />

                      <span>
                        {systemId}
                      </span>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}