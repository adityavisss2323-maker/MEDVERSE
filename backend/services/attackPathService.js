const { pool } = require("../config/db");


// --------------------------------------------------
// Map security event to MITRE ATT&CK technique
// --------------------------------------------------

const mapTechnique = (eventType) => {
    const type = String(eventType || "").toUpperCase();

    if (type.includes("FAILED_LOGIN") || type.includes("LOGIN")) {
        return "T1078 - Valid Accounts";
    }

    if (
        type.includes("RECON") ||
        type.includes("SCAN") ||
        type.includes("NETWORK")
    ) {
        return "T1046 - Network Service Scanning";
    }

    if (
        type.includes("LATERAL") ||
        type.includes("SMB")
    ) {
        return "T1021.002 - SMB/Windows Admin Shares";
    }

    if (
        type.includes("RANSOM") ||
        type.includes("FILE")
    ) {
        return "T1486 - Data Encrypted for Impact";
    }

    if (
        type.includes("PROCESS") ||
        type.includes("EXECUTION")
    ) {
        return "T1059 - Command and Scripting Interpreter";
    }

    return "T1059 - Command and Scripting Interpreter";
};


// --------------------------------------------------
// Get incident
// --------------------------------------------------

const getIncident = async (incidentId) => {

    const [rows] = await pool.query(
        `
        SELECT
            i.id,
            i.title,
            i.severity,
            i.status,
            i.threat_type AS threatType,
            i.description,
            i.confidence,
            i.created_at AS createdAt,
            a.id AS assetId,
            a.name AS assetName,
            a.department
        FROM incidents i

        INNER JOIN assets a
            ON i.asset_id = a.id

        WHERE i.id = ?
        `,
        [incidentId]
    );

    return rows[0] || null;
};


// --------------------------------------------------
// Build attack path for one incident
// --------------------------------------------------

const getAttackPath = async (incidentId) => {

    const incident = await getIncident(incidentId);

    if (!incident) {
        return null;
    }


    // ----------------------------------------------
    // Security events
    // ----------------------------------------------

    const [events] = await pool.query(
        `
        SELECT
            id,
            event_type AS eventType,
            source,
            description,
            severity,
            timestamp
        FROM security_events
        WHERE asset_id = ?
          AND timestamp <= ?
        ORDER BY timestamp ASC
        `,
        [
            incident.assetId,
            incident.createdAt
        ]
    );


    // ----------------------------------------------
    // Alerts connected with this incident
    // ----------------------------------------------

    const [alerts] = await pool.query(
        `
        SELECT
            a.id,
            a.alert_name AS alertName,
            a.alert_type AS alertType,
            a.severity,
            a.description,
            a.detected_at AS detectedAt
        FROM incident_alerts ia

        INNER JOIN alerts a
            ON ia.alert_id = a.id

        WHERE ia.incident_id = ?

        ORDER BY a.detected_at ASC
        `,
        [incidentId]
    );


    const nodes = [];

    let step = 1;


    // ----------------------------------------------
    // Add security events
    // ----------------------------------------------

    for (const event of events) {

        nodes.push({
            id: `event-${event.id}`,

            step,

            title: event.eventType,

            assetName: incident.assetName,

            department: incident.department || "",

            technique: mapTechnique(event.eventType),

            timestamp: new Date(event.timestamp)
                .toLocaleTimeString("en-US", {
                    hour12: false
                }),

            severity: event.severity || "Low",

            evidence: event.description || ""
        });

        step++;
    }


    // ----------------------------------------------
    // Add alerts
    // ----------------------------------------------

    for (const alert of alerts) {

        nodes.push({
            id: `alert-${alert.id}`,

            step,

            title: alert.alertName,

            assetName: incident.assetName,

            department: incident.department || "",

            technique: mapTechnique(alert.alertType),

            timestamp: new Date(alert.detectedAt)
                .toLocaleTimeString("en-US", {
                    hour12: false
                }),

            severity: alert.severity || "Medium",

            evidence: alert.description || ""
        });

        step++;
    }


    // ----------------------------------------------
    // Add incident as final attack stage
    // ----------------------------------------------

    nodes.push({
        id: `incident-${incident.id}`,

        step,

        title: incident.title,

        assetName: incident.assetName,

        department: incident.department || "",

        technique: mapTechnique(incident.threatType),

        timestamp: new Date(incident.createdAt)
            .toLocaleTimeString("en-US", {
                hour12: false
            }),

        severity: incident.severity || "High",

        evidence: incident.description || ""
    });


    // ----------------------------------------------
    // Return frontend-compatible structure
    // ----------------------------------------------

    return {
        id: `PATH-${String(incident.id).padStart(2, "0")}`,

        title: incident.title,

        incidentId: `INC-${incident.id}`,

        nodes
    };
};


// --------------------------------------------------
// Get attack paths for all incidents
// --------------------------------------------------

const getAllAttackPaths = async () => {

    const [incidents] = await pool.query(
        `
        SELECT id
        FROM incidents
        ORDER BY created_at DESC
        `
    );

    const results = [];

    for (const incident of incidents) {

        const path = await getAttackPath(
            incident.id
        );

        if (path) {
            results.push(path);
        }
    }

    return results;
};


module.exports = {
    getAttackPath,
    getAllAttackPaths
};