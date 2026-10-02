import { useState, useEffect } from "react";
import {
    FlaskConical,
    Info,
    RefreshCw,
    ShieldCheck
} from "lucide-react";

import { useLanguage } from "../context/LanguageContext";
import { useSOC } from "../context/SOCContext";
import { ExplainButton } from "../components/common/ExplainButton";
import { API_ENDPOINTS } from "../services/api";

export default function WhatIfPage() {
    const { t } = useLanguage();
    const { assetList } = useSOC();

    const [selectedAssetId, setSelectedAssetId] = useState("");
    const [selectedScenario, setSelectedScenario] =
        useState("ransomware");

    const [attackSpeed, setAttackSpeed] =
        useState("rapid");

    const [containmentDelay, setContainmentDelay] =
        useState("30s");

    const [segmentationMode, setSegmentationMode] =
        useState("standard");

    const [isSimulated, setIsSimulated] =
        useState(false);

    const [simulationResult, setSimulationResult] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(false);

    /*
     * Select first real backend asset
     */
    useEffect(() => {
        if (assetList.length === 0) {
            setSelectedAssetId("");
            return;
        }

        const assetExists = assetList.some(
            (asset) =>
                String(asset.id) ===
                String(selectedAssetId)
        );

        if (!assetExists) {
            setSelectedAssetId(
                String(assetList[0].id)
            );
        }
    }, [assetList, selectedAssetId]);

    /*
     * Simulation scenarios
     */
    const scenarios = [
        {
            id: "ransomware",
            name: "Ransomware Infection",
            description:
                "Simulate rapid file encryption and secondary lateral propagation."
        },
        {
            id: "credential",
            name: "Credential Theft",
            description:
                "Simulate administrative token capture and unauthorized server login."
        },
        {
            id: "lateral",
            name: "Lateral Movement Probe",
            description:
                "Simulate subnet scanning and SMB port harvesting."
        },
        {
            id: "isolation",
            name: "Network Isolation Test",
            description:
                "Simulate containment effect if device is instantly quarantined."
        }
    ];

    /*
     * Reset existing result when configuration changes
     */
    const resetSimulationResult = () => {
        setIsSimulated(false);
        setSimulationResult(null);
    };

    /*
     * Run simulation
     */
    const handleSimulate = async () => {
        if (!selectedAssetId) {
            alert("Please select a target asset.");
            return;
        }

        try {
            setIsLoading(true);
            setIsSimulated(false);
            setSimulationResult(null);

            const response = await fetch(
                `${API_ENDPOINTS.WHAT_IF}/simulate`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        assetId: selectedAssetId,
                        scenario: selectedScenario,
                        attackSpeed,
                        containmentDelay,
                        segmentationMode
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
                    "What-If simulation failed"
                );
            }

            setSimulationResult(
                result.data || {}
            );

            setIsSimulated(true);

        } catch (error) {
            console.error(
                "What-If Simulation Error:",
                error
            );

            alert(
                error.message ||
                "Failed to run What-If simulation"
            );

        } finally {
            setIsLoading(false);
        }
    };

    /*
     * Reset
     */
    const handleReset = () => {
        setIsSimulated(false);
        setSimulationResult(null);
    };

    /*
     * Backend result values
     */
    const isIsolation =
        simulationResult?.isIsolation ??
        (
            selectedScenario === "isolation" ||
            containmentDelay === "0s"
        );

    const affectedCount =
        simulationResult?.affectedCount ?? 0;

    const riskScore =
        Number(
            simulationResult?.riskScore ?? 0
        );

    const financialRisk =
        simulationResult?.financialRisk ??
        "$0";

    const patientCareDisruption =
        simulationResult?.patientCareDisruption ??
        "Not calculated";

    const aiRecommendation =
        simulationResult?.aiRecommendation ??
        "No recommendation available.";

    /*
     * Selected asset
     */
    const selectedAsset =
        assetList.find(
            (asset) =>
                String(asset.id) ===
                String(selectedAssetId)
        ) || null;

    /*
     * Find connected/important assets
     */
    const coreSwitch =
        assetList.find(
            (asset) =>
                asset.name ===
                "Core-Switch-01"
        );

    const hisServer =
        assetList.find(
            (asset) =>
                asset.name ===
                "HIS-Server-02"
        );

    const dbServer =
        assetList.find(
            (asset) =>
                asset.name ===
                "DB-Server-01"
        );

    /*
     * No assets available
     */
    if (assetList.length === 0) {
        return (
            <div className="page what-if-page">

                <div className="page-header">

                    <div>

                        <p className="eyebrow">
                            CYBER SCENARIO TESTING
                        </p>

                        <h1>
                            {t("whatIf.title")}
                        </h1>

                        <p className="page-description">
                            {t("whatIf.subtitle")}
                        </p>

                    </div>

                    <ExplainButton
                        title="What-If Cyber Simulator"
                        explanation="Simulates how a cyber attack or defensive quarantine action would propagate through the hospital network."
                        simpleConcept="Test hypothetical scenarios without disrupting actual patient systems or hospital networks."
                    />

                </div>

                <div className="dashboard-card">

                    <div className="empty-attack-path">
                        No assets are available for simulation.
                    </div>

                </div>

            </div>
        );
    }

    return (
        <div className="page what-if-page">

            {/* PAGE HEADER */}

            <div className="page-header">

                <div>

                    <p className="eyebrow">
                        CYBER SCENARIO TESTING
                    </p>

                    <h1>
                        {t("whatIf.title")}
                    </h1>

                    <p className="page-description">
                        {t("whatIf.subtitle")}
                    </p>

                </div>

                <ExplainButton
                    title="What-If Cyber Simulator"
                    explanation="Simulates how a cyber attack or defensive quarantine action would propagate through the hospital network."
                    simpleConcept="Test hypothetical scenarios without disrupting actual patient systems or hospital networks."
                />

            </div>

            {/* SIMULATION NOTICE */}

            <div className="simulation-notice-banner">

                <Info size={18} />

                <span>
                    SIMULATION MODE — NO REAL NETWORK ACTIONS ARE TAKEN ON HOSPITAL INFRASTRUCTURE
                </span>

            </div>

            {/* CONFIGURATION */}

            <div className="dashboard-card simulation-config-card">

                <h3>
                    1. Select Simulation Target & Attack Scenario
                </h3>

                <div className="sim-config-grid">

                    {/* TARGET ASSET */}

                    <div className="config-item">

                        <label
                            style={{
                                fontWeight: 700,
                                fontSize: "12px",
                                color: "#475569",
                                display: "block",
                                marginBottom: "6px"
                            }}
                        >
                            Target Asset:
                        </label>

                        <select
                            value={selectedAssetId}
                            onChange={(e) => {
                                setSelectedAssetId(
                                    e.target.value
                                );
                                resetSimulationResult();
                            }}
                            style={{
                                width: "100%",
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "13px"
                            }}
                        >

                            {assetList.map(
                                (asset) => (

                                    <option
                                        key={asset.id}
                                        value={asset.id}
                                    >
                                        {asset.id} —{" "}
                                        {asset.name}
                                        {asset.department
                                            ? ` (${asset.department})`
                                            : ""}
                                    </option>

                                )
                            )}

                        </select>

                        {/* PARAMETERS */}

                        <div
                            style={{
                                marginTop: "16px"
                            }}
                        >

                            <label
                                style={{
                                    fontWeight: 700,
                                    fontSize: "12px",
                                    color: "#475569",
                                    display: "block",
                                    marginBottom: "6px"
                                }}
                            >
                                Simulation Parameters:
                            </label>

                            <div
                                className="sim-slider-group"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "10px",
                                    marginTop: "0"
                                }}
                            >

                                {/* ATTACK SPEED */}

                                <div className="slider-item">

                                    <label>
                                        Propagation Speed:
                                    </label>

                                    <select
                                        value={attackSpeed}
                                        onChange={(e) => {
                                            setAttackSpeed(
                                                e.target.value
                                            );
                                            resetSimulationResult();
                                        }}
                                    >

                                        <option value="slow">
                                            Stealth / Slow (Hours)
                                        </option>

                                        <option value="moderate">
                                            Moderate Speed
                                        </option>

                                        <option value="rapid">
                                            Rapid Automated (Seconds)
                                        </option>

                                    </select>

                                </div>

                                {/* CONTAINMENT DELAY */}

                                <div className="slider-item">

                                    <label>
                                        SOC Quarantine Response Delay:
                                    </label>

                                    <select
                                        value={containmentDelay}
                                        onChange={(e) => {
                                            setContainmentDelay(
                                                e.target.value
                                            );
                                            resetSimulationResult();
                                        }}
                                    >

                                        <option value="0s">
                                            Automated Instant (0 sec)
                                        </option>

                                        <option value="30s">
                                            Standard AI Safety (30 sec)
                                        </option>

                                        <option value="2m">
                                            Manual Analyst Delay (2 min)
                                        </option>

                                    </select>

                                </div>

                                {/* SEGMENTATION */}

                                <div className="slider-item">

                                    <label>
                                        Subnet Isolation strictness:
                                    </label>

                                    <select
                                        value={segmentationMode}
                                        onChange={(e) => {
                                            setSegmentationMode(
                                                e.target.value
                                            );
                                            resetSimulationResult();
                                        }}
                                    >

                                        <option value="strict">
                                            Strict Zero-Trust Subnets
                                        </option>

                                        <option value="standard">
                                            Standard VLAN Rules
                                        </option>

                                        <option value="permissive">
                                            Permissive Cross-VLAN
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* SCENARIOS */}

                    <div className="config-item">

                        <label
                            style={{
                                fontWeight: 700,
                                fontSize: "12px",
                                color: "#475569",
                                display: "block",
                                marginBottom: "6px"
                            }}
                        >
                            Attack Scenario Type:
                        </label>

                        <div className="scenario-chips">

                            {scenarios.map(
                                (scenario) => (

                                    <button
                                        key={scenario.id}
                                        className={`scenario-chip ${
                                            selectedScenario ===
                                            scenario.id
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setSelectedScenario(
                                                scenario.id
                                            );
                                            resetSimulationResult();
                                        }}
                                    >

                                        <strong>
                                            {scenario.name}
                                        </strong>

                                        <small>
                                            {scenario.description}
                                        </small>

                                    </button>

                                )
                            )}

                        </div>

                    </div>

                </div>

                {/* ACTION */}

                <div className="sim-action-row">

                    {!isSimulated ? (

                        <button
                            className="primary-button sim-run-btn"
                            onClick={handleSimulate}
                            disabled={
                                isLoading ||
                                !selectedAssetId
                            }
                        >

                            <FlaskConical size={18} />

                            <span>
                                {isLoading
                                    ? "Running Simulation..."
                                    : "Run Scenario Simulation"}
                            </span>

                        </button>

                    ) : (

                        <button
                            className="secondary-button sim-run-btn"
                            onClick={handleReset}
                        >

                            <RefreshCw size={18} />

                            <span>
                                Reset Simulation
                            </span>

                        </button>

                    )}

                </div>

            </div>

            {/* RESULTS */}

            {isSimulated &&
                simulationResult && (

                    <div className="sim-results-container">

                        <div className="results-grid">

                            {/* CURRENT STATE */}

                            <div className="dashboard-card state-card current">

                                <h3>
                                    {t("whatIf.currentState")}
                                </h3>

                                <p className="card-subtitle">
                                    Normal Operational Topology Baseline
                                </p>

                                <div className="state-topology">

                                    <div className="topo-node normal">
                                        {selectedAsset?.name ||
                                            selectedAssetId}
                                        {" "}🟢 (Normal)
                                    </div>

                                    {coreSwitch && (
                                        <>
                                            <div className="topo-arrow">
                                                ↓
                                            </div>

                                            <div className="topo-node normal">
                                                {coreSwitch.name}
                                                {" "}🟢 (Normal)
                                            </div>
                                        </>
                                    )}

                                    {hisServer && (
                                        <>
                                            <div className="topo-arrow">
                                                ↓
                                            </div>

                                            <div className="topo-node normal">
                                                {hisServer.name}
                                                {" "}🟢 (Normal)
                                            </div>
                                        </>
                                    )}

                                    {dbServer && (
                                        <>
                                            <div className="topo-arrow">
                                                ↓
                                            </div>

                                            <div className="topo-node normal">
                                                {dbServer.name}
                                                {" "}🟢 (Normal)
                                            </div>
                                        </>
                                    )}

                                </div>

                            </div>

                            {/* SIMULATED STATE */}

                            <div className="dashboard-card state-card simulated">

                                <h3>
                                    {t("whatIf.simulatedState")}
                                </h3>

                                <p className="card-subtitle">
                                    Propagated Attack Blast Radius Graph
                                </p>

                                <div className="state-topology">

                                    <div
                                        className={`topo-node ${
                                            isIsolation
                                                ? "suspicious"
                                                : "compromised"
                                        }`}
                                    >
                                        {selectedAsset?.name ||
                                            selectedAssetId}

                                        {" "}

                                        {isIsolation
                                            ? "🟠 (Isolated)"
                                            : "🔴 (Patient Zero)"}
                                    </div>

                                    {coreSwitch && (
                                        <>
                                            <div className="topo-arrow">
                                                ↓
                                            </div>

                                            <div
                                                className={`topo-node ${
                                                    isIsolation
                                                        ? "normal"
                                                        : "suspicious"
                                                }`}
                                            >
                                                {coreSwitch.name}

                                                {" "}

                                                {isIsolation
                                                    ? "🟢 (Filtered)"
                                                    : "🟠 (Traffic Probed)"}
                                            </div>
                                        </>
                                    )}

                                    {hisServer && (
                                        <>
                                            <div className="topo-arrow">
                                                ↓
                                            </div>

                                            <div
                                                className={`topo-node ${
                                                    isIsolation
                                                        ? "normal"
                                                        : "compromised"
                                                }`}
                                            >
                                                {hisServer.name}

                                                {" "}

                                                {isIsolation
                                                    ? "🟢 (Protected)"
                                                    : "🔴 (Ransomware Target)"}
                                            </div>
                                        </>
                                    )}

                                    {dbServer && (
                                        <>
                                            <div className="topo-arrow">
                                                ↓
                                            </div>

                                            <div
                                                className={`topo-node ${
                                                    isIsolation
                                                        ? "normal"
                                                        : "suspicious"
                                                }`}
                                            >
                                                {dbServer.name}

                                                {" "}

                                                {isIsolation
                                                    ? "🟢 (Safe)"
                                                    : "🟠 (Secondary Exposure)"}
                                            </div>
                                        </>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* IMPACT */}

                        <div className="dashboard-card sim-impact-card">

                            <h3>
                                Projected Scenario Impact Analytics
                            </h3>

                            <div className="impact-stats-grid">

                                <div className="impact-stat">

                                    <span>
                                        Total Affected Assets:
                                    </span>

                                    <strong>
                                        {affectedCount}
                                        {" "}
                                        Infrastructure Systems
                                    </strong>

                                </div>

                                <div className="impact-stat">

                                    <span>
                                        Patient Care Disruption:
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                isIsolation
                                                    ? "#16a34a"
                                                    : "#dc2626"
                                        }}
                                    >
                                        {patientCareDisruption}
                                    </strong>

                                </div>

                                <div className="impact-stat">

                                    <span>
                                        Compliance Financial Risk:
                                    </span>

                                    <strong>
                                        {financialRisk}
                                        {" "}
                                        (HIPAA Exposure)
                                    </strong>

                                </div>

                                <div className="impact-stat">

                                    <span>
                                        Simulated Risk Score:
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                riskScore > 70
                                                    ? "#ef4444"
                                                    : "#10b981"
                                        }}
                                    >
                                        {riskScore} / 100
                                        {" "}
                                        (
                                        {riskScore > 70
                                            ? "HIGH RISK"
                                            : "CONTAINED"}
                                        )
                                    </strong>

                                </div>

                            </div>

                            {/* AI RECOMMENDATION */}

                            <div
                                style={{
                                    marginTop: "20px",
                                    padding: "16px",
                                    background: "#f8fafc",
                                    borderRadius: "10px",
                                    border:
                                        "1px solid #e2e8f0"
                                }}
                            >

                                <strong
                                    style={{
                                        color: "#176b87",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px"
                                    }}
                                >

                                    <ShieldCheck size={18} />

                                    AI Security Recommendation:

                                </strong>

                                <p
                                    style={{
                                        margin:
                                            "6px 0 0 0",
                                        fontSize: "13px",
                                        color: "#334155"
                                    }}
                                >
                                    {aiRecommendation}
                                </p>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}