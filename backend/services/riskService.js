const { pool } = require("../config/db");


// Severity → numerical weight
const severityWeight = {
    Low: 10,
    Medium: 25,
    High: 50,
    Critical: 75
};


// Calculate risk level from score
const getRiskLevel = (score) => {
    if (score >= 75) return "Critical";
    if (score >= 50) return "High";
    if (score >= 25) return "Medium";
    return "Low";
};


// Calculate risk for one asset
const calculateAssetRisk = async (assetId) => {

    const [assetRows] = await pool.query(
        `
        SELECT
            id,
            name,
            criticality,
            risk_level AS storedRiskLevel
        FROM assets
        WHERE id = ?
        `,
        [assetId]
    );

    if (assetRows.length === 0) {
        return null;
    }

    const asset = assetRows[0];


    // Active alerts
    const [alertRows] = await pool.query(
        `
        SELECT
            severity,
            COUNT(*) AS count
        FROM alerts
        WHERE asset_id = ?
          AND status IN ('New', 'Investigating', 'Contained')
        GROUP BY severity
        `,
        [assetId]
    );


    // Active incidents
    const [incidentRows] = await pool.query(
        `
        SELECT
            severity,
            COUNT(*) AS count
        FROM incidents
        WHERE asset_id = ?
          AND status IN ('Open', 'Investigating', 'Contained')
        GROUP BY severity
        `,
        [assetId]
    );


    let score = 0;

    const factors = [];


    // Add alert risk
    for (const alert of alertRows) {

        const count = Number(alert.count || 0);

        const weight =
            severityWeight[alert.severity] || 0;

        score += count * weight;

        if (count > 0) {
            factors.push(
                `${count} active ${alert.severity} alert(s)`
            );
        }
    }


    // Add incident risk
    for (const incident of incidentRows) {

        const count = Number(incident.count || 0);

        const weight =
            severityWeight[incident.severity] || 0;

        // Incidents have higher impact than individual alerts
        score += count * weight * 1.5;

        if (count > 0) {
            factors.push(
                `${count} active ${incident.severity} incident(s)`
            );
        }
    }


    // Critical assets receive additional risk weight
    if (asset.criticality === "Critical") {

        score += 20;

        factors.push(
            "Asset has Critical business importance"
        );

    } else if (asset.criticality === "High") {

        score += 10;

        factors.push(
            "Asset has High business importance"
        );
    }


    // Keep score within 0–100
    score = Math.min(
        Math.round(score),
        100
    );


    const riskLevel = getRiskLevel(score);


    return {
        assetId: asset.id,

        assetName: asset.name,

        riskScore: score,

        riskLevel,

        activeAlerts:
            alertRows.reduce(
                (total, item) =>
                    total + Number(item.count || 0),
                0
            ),

        activeIncidents:
            incidentRows.reduce(
                (total, item) =>
                    total + Number(item.count || 0),
                0
            ),

        factors
    };
};


// Calculate risk for all assets
const calculateAllAssetRisks = async () => {

    const [assets] = await pool.query(
        `
        SELECT id
        FROM assets
        ORDER BY id ASC
        `
    );

    const results = [];

    for (const asset of assets) {

        const risk =
            await calculateAssetRisk(asset.id);

        if (risk) {
            results.push(risk);
        }
    }

    return results;
};


// Get risk for one asset
const getAssetRisk = async (assetId) => {
    return calculateAssetRisk(assetId);
};


// Get risk for all assets
const getAllAssetRisks = async () => {
    return calculateAllAssetRisks();
};


module.exports = {
    calculateAssetRisk,
    calculateAllAssetRisks,
    getAssetRisk,
    getAllAssetRisks,
    getRiskLevel
};