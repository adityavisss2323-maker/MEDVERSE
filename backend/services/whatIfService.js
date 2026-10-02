const { pool } = require("../config/db");

const calculateSimulation = async ({
    assetId,
    scenario,
    attackSpeed,
    containmentDelay,
    segmentationMode
}) => {

    // Support both MySQL numeric ID and frontend asset name
    const [assetRows] = await pool.query(
        `
        SELECT
            id,
            name,
            type,
            department,
            ip_address AS ipAddress,
            status,
            risk_level AS riskLevel,
            criticality
        FROM assets
        WHERE id = ? OR name = ?
        LIMIT 1
        `,
        [assetId, assetId]
    );

    if (assetRows.length === 0) {
        return null;
    }

    const asset = assetRows[0];

    /*
     * This is a SIMULATION ONLY.
     * No real hospital infrastructure is modified.
     */

    const isIsolation =
        scenario === "isolation" ||
        containmentDelay === "0s";

    let affectedCount;
    let riskScore;
    let financialRisk;
    let patientCareDisruption;

    if (isIsolation) {

        affectedCount = 1;
        riskScore = 22;
        financialRisk = "$12,000";
        patientCareDisruption = "Minimal (< 5%)";

    } else if (scenario === "ransomware") {

        affectedCount = 4;

        riskScore =
            attackSpeed === "rapid"
                ? 94
                : 78;

        financialRisk = "$480,000";
        patientCareDisruption = "High (88% Dept Impact)";

    } else {

        affectedCount = 3;
        riskScore = 65;
        financialRisk = "$120,000";
        patientCareDisruption = "High (88% Dept Impact)";
    }


    /*
     * Current baseline topology.
     * This matches the existing WhatIfPage UI.
     */
    const currentState = [
        {
            assetId: asset.id,
            assetName: asset.name,
            status: "Normal"
        },
        {
            assetId: "Core-Switch-01",
            assetName: "Core-Switch-01",
            status: "Normal"
        },
        {
            assetId: "HIS-Server-02",
            assetName: "HIS-Server-02",
            status: "Normal"
        },
        {
            assetId: "DB-Server-01",
            assetName: "DB-Server-01",
            status: "Normal"
        }
    ];


    /*
     * Simulated attack topology.
     */
    const simulatedState = [
        {
            assetId: asset.id,
            assetName: asset.name,
            status: isIsolation
                ? "Isolated"
                : "Patient Zero"
        },
        {
            assetId: "Core-Switch-01",
            assetName: "Core-Switch-01",
            status: isIsolation
                ? "Filtered"
                : "Traffic Probed"
        },
        {
            assetId: "HIS-Server-02",
            assetName: "HIS-Server-02",
            status: isIsolation
                ? "Protected"
                : "Ransomware Target"
        },
        {
            assetId: "DB-Server-01",
            assetName: "DB-Server-01",
            status: isIsolation
                ? "Safe"
                : "Secondary Exposure"
        }
    ];


    let recommendation;

    if (isIsolation) {

        recommendation =
            "Instant containment policy effectively isolates Patient Zero before SMB lateral probes hit core medical EHR databases.";

    } else {

        recommendation =
            "Enforce automated SOC containment rules to reduce blast radius from 4 servers to 1 workstation, saving an estimated $468,000 in regulatory downtime.";
    }


    return {
        simulationMode: "SIMULATION",

        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        department: asset.department || "",

        scenario,
        attackSpeed,
        containmentDelay,
        segmentationMode,

        isIsolation,

        affectedCount,
        riskScore,
        financialRisk,
        patientCareDisruption,

        currentState,
        simulatedState,

        aiRecommendation: recommendation
    };
};


module.exports = {
    calculateSimulation
};