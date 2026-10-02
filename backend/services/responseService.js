const { pool } = require("../config/db");


// ============================================================
// GET ASSET
// Accept SQL ID OR frontend asset name
// ============================================================

const getAsset = async (assetIdentifier) => {

    const [rows] = await pool.query(
        `
        SELECT
            id,
            name,
            type,
            ip_address AS ipAddress,
            department,
            status,
            risk_level AS riskLevel,
            criticality
        FROM assets
        WHERE id = ?
           OR name = ?
        LIMIT 1
        `,
        [
            assetIdentifier,
            assetIdentifier
        ]
    );

    return rows[0] || null;
};


// ============================================================
// GET ACTIVE THREAT INFORMATION
// ============================================================

const getThreatContext = async (assetId) => {

    const [alerts] = await pool.query(
        `
        SELECT
            id,
            alert_name AS alertName,
            alert_type AS alertType,
            severity,
            status,
            confidence,
            description
        FROM alerts
        WHERE asset_id = ?
          AND status IN (
              'New',
              'Investigating',
              'Contained'
          )
        ORDER BY detected_at DESC
        `,
        [assetId]
    );


    const [incidents] = await pool.query(
        `
        SELECT
            id,
            title,
            severity,
            status,
            threat_type AS threatType,
            confidence,
            description
        FROM incidents
        WHERE asset_id = ?
          AND status IN (
              'Open',
              'Investigating',
              'Contained'
          )
        ORDER BY created_at DESC
        `,
        [assetId]
    );


    return {
        alerts,
        incidents
    };
};


// ============================================================
// GENERATE SIMULATED RESPONSE ACTIONS
// ============================================================

const generateResponseActions = (
    asset,
    alerts,
    incidents
) => {

    const actions = [];


    // --------------------------------------------------------
    // Severity priority
    // --------------------------------------------------------

    const priority = {
        Low: 1,
        Medium: 2,
        High: 3,
        Critical: 4
    };


    const highestSeverity = [
        ...alerts.map(
            item => item.severity
        ),
        ...incidents.map(
            item => item.severity
        )
    ].reduce(
        (highest, current) => {

            return (
                (priority[current] || 0) >
                (priority[highest] || 0)
            )
                ? current
                : highest;

        },
        "Low"
    );


    // --------------------------------------------------------
    // QUARANTINE DEVICE
    //
    // Allow quarantine when:
    // 1. High/Critical security activity exists
    // OR
    // 2. Asset itself has High/Critical risk
    // --------------------------------------------------------

    const highRiskAsset =
        asset.riskLevel === "High" ||
        asset.riskLevel === "Critical";

    const highThreat =
        highestSeverity === "High" ||
        highestSeverity === "Critical";


    if (highThreat || highRiskAsset) {

        actions.push({

            action:
                "QUARANTINE_DEVICE",

            title:
                "Quarantine Device",

            target:
                asset.name,

            description:
                `Simulate network isolation of ${asset.name}.`,

            status:
                "Simulated",

            reason:
                highThreat
                    ? "High or Critical security activity detected."
                    : "Asset has High or Critical risk level."

        });
    }


    // --------------------------------------------------------
    // DISABLE COMPROMISED ACCOUNT
    // --------------------------------------------------------

    const authenticationThreat =
        [
            ...alerts,
            ...incidents
        ].some(item => {

            const type =
                item.alertType ||
                item.threatType ||
                "";

            return String(type)
                .toLowerCase()
                .includes("authentication");

        });


    if (authenticationThreat) {

        actions.push({

            action:
                "DISABLE_COMPROMISED_ACCOUNT",

            title:
                "Disable Compromised Account",

            target:
                asset.name,

            description:
                "Simulate disabling the suspected compromised account.",

            status:
                "Simulated",

            reason:
                "Suspicious authentication activity detected."

        });
    }


    // --------------------------------------------------------
    // BLOCK SUSPICIOUS IP
    // --------------------------------------------------------

    const networkThreat =
        [
            ...alerts,
            ...incidents
        ].some(item => {

            const type =
                item.alertType ||
                item.threatType ||
                "";

            return String(type)
                .toLowerCase()
                .match(
                    /network|reconnaissance|lateral movement/
                );

        });


    if (networkThreat) {

        actions.push({

            action:
                "BLOCK_SUSPICIOUS_IP",

            title:
                "Block Suspicious IP",

            target:
                asset.ipAddress ||
                "Unknown IP",

            description:
                "Simulate blocking the suspicious network source.",

            status:
                "Simulated",

            reason:
                "Network-related threat activity detected."

        });
    }


    // --------------------------------------------------------
    // NOTIFY SOC
    // --------------------------------------------------------

    if (
        alerts.length > 0 ||
        incidents.length > 0
    ) {

        actions.push({

            action:
                "NOTIFY_SOC",

            title:
                "Notify SOC Team",

            target:
                "SOC Team",

            description:
                "Generate a simulated SOC notification.",

            status:
                "Simulated",

            reason:
                "Active security activity requires analyst attention."

        });
    }


    // --------------------------------------------------------
    // GENERATE INCIDENT REPORT
    // --------------------------------------------------------

    if (incidents.length > 0) {

        actions.push({

            action:
                "GENERATE_INCIDENT_REPORT",

            title:
                "Generate Incident Report",

            target:
                `Incident #${incidents[0].id}`,

            description:
                "Generate a simulated incident report containing the security timeline and response details.",

            status:
                "Simulated",

            reason:
                "An active incident exists for this asset."

        });
    }


    return actions;
};


// ============================================================
// GET RESPONSE FOR ONE ASSET
// ============================================================

const getResponseForAsset = async (
    assetIdentifier
) => {

    const asset =
        await getAsset(assetIdentifier);


    if (!asset) {
        return null;
    }


    const {
        alerts,
        incidents
    } =
        await getThreatContext(
            asset.id
        );


    const actions =
        generateResponseActions(
            asset,
            alerts,
            incidents
        );


    return {

        asset: {

            id:
                asset.name,

            databaseId:
                asset.id,

            name:
                asset.name,

            type:
                asset.type,

            ipAddress:
                asset.ipAddress || "",

            department:
                asset.department || "",

            status:
                asset.status,

            riskLevel:
                asset.riskLevel,

            criticality:
                asset.criticality
        },

        activeAlerts:
            alerts.length,

        activeIncidents:
            incidents.length,

        responseMode:
            "SIMULATION",

        actions
    };
};


// ============================================================
// GET RESPONSE FOR ALL ASSETS
// ============================================================

const getAllResponses = async () => {

    const [assets] = await pool.query(
        `
        SELECT id FROM assets ORDER BY id ASC
        `
    );

    const results = [];

    for (const asset of assets) {
        const response = await getResponseForAsset(asset.id);

        if (response) {
            // Fetch execution history for the asset
            const [history] = await pool.query(
                `SELECT id, action_type AS action, action_title AS title, target, description, status, executed_at AS executedAt 
                 FROM response_actions 
                 WHERE asset_id = ? 
                 ORDER BY executed_at DESC`,
                [asset.id]
            );
            
            response.executedActions = history;
            results.push(response);
        }
    }

    return results;
};


// ============================================================
// EXECUTE SIMULATED ACTION
// ============================================================

const executeSimulatedAction = async (
    assetIdentifier,
    actionName
) => {

    // --------------------------------------------------------
    // Find asset
    // --------------------------------------------------------

    const asset =
        await getAsset(assetIdentifier);


    if (!asset) {
        return null;
    }


    // --------------------------------------------------------
    // Get threat context
    // --------------------------------------------------------

    const {
        alerts,
        incidents
    } =
        await getThreatContext(
            asset.id
        );


    // --------------------------------------------------------
    // Generate available actions
    // --------------------------------------------------------

    const availableActions =
        generateResponseActions(
            asset,
            alerts,
            incidents
        );


    // --------------------------------------------------------
    // Find requested action
    // --------------------------------------------------------

    const selectedAction =
        availableActions.find(
            item =>
                item.action === actionName
        );


    if (!selectedAction) {

        throw new Error(
            `Requested response action '${actionName}' is not available for this asset`
        );
    }


    // ========================================================
    // FIND ACTIVE INCIDENT
    // ========================================================

    const [incidentRows] =
        await pool.query(
            `
            SELECT
                id
            FROM incidents
            WHERE asset_id = ?
              AND status IN (
                  'Open',
                  'Investigating',
                  'Contained'
              )
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [asset.id]
        );


    let incidentId = null;


    // ========================================================
    // USE ACTIVE INCIDENT IF AVAILABLE
    // ========================================================

    if (incidentRows.length > 0) {

        incidentId =
            incidentRows[0].id;

    } else {

        // ====================================================
        // LOOK FOR ANY EXISTING INCIDENT
        // ====================================================

        const [existingIncidentRows] =
            await pool.query(
                `
                SELECT
                    id
                FROM incidents
                WHERE asset_id = ?
                ORDER BY created_at DESC
                LIMIT 1
                `,
                [asset.id]
            );


        if (
            existingIncidentRows.length > 0
        ) {

            incidentId =
                existingIncidentRows[0].id;

        } else {

            // =================================================
            // CREATE SIMULATED INCIDENT
            // =================================================

            const [newIncident] =
                await pool.query(
                    `
                    INSERT INTO incidents
                    (
                        title,
                        severity,
                        status,
                        asset_id,
                        threat_type,
                        description,
                        confidence
                    )
                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?
                    )
                    `,
                    [
                        `${selectedAction.title} - ${asset.name}`,
                        "High",
                        "Open",
                        asset.id,
                        "Simulated Response",
                        `Simulated security response initiated for ${asset.name}.`,
                        100
                    ]
                );


            incidentId =
                newIncident.insertId;
        }
    }


    // ========================================================
    // STORE RESPONSE ACTION
    // ========================================================

    const [result] =
        await pool.query(
            `
            INSERT INTO response_actions
            (
                incident_id,
                asset_id,
                action_type,
                action_title,
                target,
                description,
                status,
                executed_at
            )
            VALUES
            (
                ?,
                ?,
                ?,
                ?,
                ?,
                ?,
                'Simulated',
                CURRENT_TIMESTAMP
            )
            `,
            [
                incidentId,
                asset.id,
                selectedAction.action,
                selectedAction.title,
                selectedAction.target ||
                    asset.name,
                selectedAction.description ||
                    ""
            ]
        );


    // ========================================================
    // RETURN RESULT
    // ========================================================

    return {

        success:
            true,

        mode:
            "SIMULATION",

        id:
            result.insertId,

        incidentId,

        assetId:
            asset.name,

        databaseAssetId:
            asset.id,

        action:
            selectedAction.action,

        title:
            selectedAction.title,

        target:
            selectedAction.target ||
            asset.name,

        description:
            selectedAction.description ||
            "",

        status:
            "Simulated",

        message:
            `${selectedAction.title} simulated successfully for ${asset.name}.`,

        executedAt:
            new Date()
    };
};


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getResponseForAsset,

    getAllResponses,

    executeSimulatedAction
};