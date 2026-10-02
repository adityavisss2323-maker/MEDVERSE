import { useState } from "react";
import { Server, Network, Sparkles } from "lucide-react";
import { StatusBadge } from "../common/StatusBadge";
import { departments } from "../../data/departments";
import { useSOC } from "../../context/SOCContext";

export function InfrastructureMap({
  onSelectAsset,
  highlightThreatPath,
  setHighlightThreatPath
}) {
  const { assetList } = useSOC();

  const [selectedDept, setSelectedDept] = useState("All");
  const [filterText, setFilterText] = useState("");

  /*
   * These are the assets used in the MED-VERSE
   * simulated threat-path scenario.
   *
   * They will only be highlighted if they actually
   * exist in the backend asset list.
   */
  const threatPathAssetIds = [
    "Doctor-PC-04",
    "Core-Switch-01",
    "HIS-Server-02",
    "DB-Server-01"
  ];

  // ---------------------------------------------------------
  // FILTER REAL BACKEND ASSETS
  // ---------------------------------------------------------

  const filteredAssets = assetList.filter((asset) => {
    const assetId = String(asset.id || "");
    const assetName = String(asset.name || "");
    const department = String(asset.department || "");

    const searchValue = filterText.toLowerCase();

    const matchesDept =
      selectedDept === "All" ||
      department.toLowerCase() ===
        selectedDept.toLowerCase();

    const matchesText =
      assetId.toLowerCase().includes(searchValue) ||
      assetName.toLowerCase().includes(searchValue);

    return matchesDept && matchesText;
  });

  // ---------------------------------------------------------
  // FIND REAL CORE ASSET
  // ---------------------------------------------------------

  const coreAsset =
    assetList.find(
      (asset) =>
        asset.id === "Core-Switch-01" ||
        asset.name === "Core-Switch-01"
    ) || null;

  // ---------------------------------------------------------
  // STATUS HELPER
  // ---------------------------------------------------------

  const getAssetStatus = (asset) => {
    if (!asset) {
      return "normal";
    }

    return (
      asset.status ||
      "normal"
    ).toLowerCase();
  };

  // ---------------------------------------------------------
  // SELECT ASSET SAFELY
  // ---------------------------------------------------------

  const handleAssetSelect = (asset) => {
    if (!asset) {
      return;
    }

    onSelectAsset(asset);
  };

  return (
    <div className="digital-twin-canvas-wrapper">

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="twin-toolbar">

        <div className="toolbar-left">

          <div className="dept-filter-chips">

            <button
              className={`chip ${
                selectedDept === "All"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setSelectedDept("All")
              }
            >
              All Departments
            </button>

            {departments.map((department) => (

              <button
                key={department.id}
                className={`chip ${
                  selectedDept === department.name
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSelectedDept(
                    department.name
                  )
                }
              >
                {department.name}
              </button>

            ))}

          </div>

        </div>

        <div className="toolbar-right">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search asset..."
            value={filterText}
            onChange={(e) =>
              setFilterText(e.target.value)
            }
            className="twin-search-input"
          />

          {/* THREAT PATH */}

          <button
            className={`threat-path-toggle ${
              highlightThreatPath
                ? "active"
                : ""
            }`}
            onClick={() =>
              setHighlightThreatPath(
                !highlightThreatPath
              )
            }
            title="Dim normal connections and emphasize the simulated threat path"
          >
            <Sparkles size={16} />

            <span>
              {highlightThreatPath
                ? "Threat Path Active"
                : "Highlight Threat Path"}
            </span>

          </button>

        </div>

      </div>

      {/* =====================================================
          DIGITAL TWIN CANVAS
      ===================================================== */}

      <div
        className={`twin-canvas ${
          highlightThreatPath
            ? "highlighting-threat"
            : ""
        }`}
      >

        {/* ===================================================
            CORE BACKBONE NODE
        =================================================== */}

        {coreAsset && (

          <div className="twin-tier tier-core">

            <div
              className={`twin-node-large core-switch-node ${
                getAssetStatus(coreAsset)
              }`}
              onClick={() =>
                handleAssetSelect(coreAsset)
              }
            >

              <div className="node-icon">
                <Network size={28} />
              </div>

              <div className="node-info">

                <strong>
                  {coreAsset.name}
                </strong>

                <span>
                  {coreAsset.type ||
                    "Hospital Core Backbone"}
                </span>

              </div>

              <StatusBadge
                status={getAssetStatus(coreAsset)}
              />

            </div>

          </div>

        )}

        {/* ===================================================
            CONNECTING LINES
        =================================================== */}

        {coreAsset && filteredAssets.length > 0 && (

          <div className="connecting-lines-svg">

            <svg
              width="100%"
              height="100%"
            >

              <line
                x1="50%"
                y1="60"
                x2="20%"
                y2="180"
                className={`svg-link ${
                  highlightThreatPath
                    ? "threat-glowing"
                    : ""
                }`}
              />

              <line
                x1="50%"
                y1="60"
                x2="40%"
                y2="180"
                className={`svg-link ${
                  highlightThreatPath
                    ? "threat-glowing"
                    : ""
                }`}
              />

              <line
                x1="50%"
                y1="60"
                x2="60%"
                y2="180"
                className={`svg-link ${
                  highlightThreatPath
                    ? "faded"
                    : ""
                }`}
              />

              <line
                x1="50%"
                y1="60"
                x2="80%"
                y2="180"
                className={`svg-link ${
                  highlightThreatPath
                    ? "faded"
                    : ""
                }`}
              />

            </svg>

          </div>

        )}

        {/* ===================================================
            ASSET NODES
        =================================================== */}

        <div className="twin-tier tier-assets">

          {filteredAssets.length === 0 ? (

  <div
    style={{
      width: "100%",
      padding: "40px 20px",
      textAlign: "center",
      color: "#ffffff"
    }}
  >
    <p>
      No assets found for this department.
    </p>
  </div>

) : (

            filteredAssets.map((asset) => {

              const assetId =
                String(asset.id || "");

              const assetName =
                String(asset.name || "");

              const isThreatNode =
                threatPathAssetIds.includes(
                  assetId
                ) ||
                threatPathAssetIds.includes(
                  assetName
                );

              const isDimmed =
                highlightThreatPath &&
                !isThreatNode;

              const status =
                getAssetStatus(asset);

              return (

                <div
                  key={asset.id}
                  className={`
                    twin-asset-card
                    ${status}
                    ${
                      isThreatNode &&
                      highlightThreatPath
                        ? "threat-highlighted"
                        : ""
                    }
                    ${
                      isDimmed
                        ? "dimmed"
                        : ""
                    }
                  `}
                  onClick={() =>
                    handleAssetSelect(asset)
                  }
                >

                  {/* TOP */}

                  <div className="asset-card-top">

                    <span className="asset-dept-tag">
                      {asset.department ||
                        "Unknown Department"}
                    </span>

                    <StatusBadge
                      status={status}
                    />

                  </div>

                  {/* MAIN */}

                  <div className="asset-card-main">

                    <div
                      className={`asset-icon-box ${status}`}
                    >
                      <Server size={20} />
                    </div>

                    <div>

                      <h4>
                        {asset.name ||
                          asset.id}
                      </h4>

                      <p>
                        {asset.type ||
                          "Unknown Asset Type"}
                      </p>

                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="asset-card-footer">

                    <span>
                      IP:{" "}
                      {asset.ip ||
                        "Not Available"}
                    </span>

                    <span className="crit-score">
                      Score:{" "}
                      {asset.criticalityScore ??
                        0}
                    </span>

                  </div>

                </div>

              );
            })

          )}

        </div>

      </div>

    </div>
  );
}