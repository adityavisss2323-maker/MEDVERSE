const { pool } = require("../config/db");


// Get incident information
const getIncident = async (incidentId) => {
    const [rows] = await pool.query(
        `
        SELECT
            i.id,
            i.title,
            i.severity,
            i.status,
            i.asset_id AS assetId,
            i.threat_type AS threatType,
            i.description,
            i.confidence,
            i.created_at AS createdAt,
            a.name AS assetName,
            a.type AS assetType,
            a.ip_address AS assetIp,
            a.department AS assetDepartment
        FROM incidents i
        INNER JOIN assets a
            ON i.asset_id = a.id
        WHERE i.id = ?
        `,
        [incidentId]
    );

    return rows[0] || null;
};


// Build forensic timeline
const getForensicTimeline = async (incidentId) => {

    const incident = await getIncident(incidentId);

    if (!incident) {
        return null;
    }


    const timeline = [];


    // --------------------------------------------------
    // 1. Security events related to the asset
    // --------------------------------------------------

    const [securityEvents] = await pool.query(
        `
        SELECT
            se.id,
            se.event_type AS eventType,
            se.source,
            se.description,
            se.severity,
            se.source_ip AS sourceIp,
            se.destination_ip AS destinationIp,
            se.timestamp
        FROM security_events se
        WHERE se.asset_id = ?
          AND se.timestamp <= ?
        ORDER BY se.timestamp ASC
        `,
        [
            incident.assetId,
            incident.createdAt
        ]
    );


    for (const event of securityEvents) {

        timeline.push({
            id: `event-${event.id}`,

            type: "SECURITY_EVENT",

            timestamp: event.timestamp,

            title: event.eventType,

            severity: event.severity,

            source: event.source,

            description: event.description,

            sourceIp: event.sourceIp || "",

            destinationIp:
                event.destinationIp || "",

            status: "Detected"
        });
    }


    // --------------------------------------------------
    // 2. Alerts connected to this incident
    // --------------------------------------------------

    const [alerts] = await pool.query(
        `
        SELECT
            a.id,
            a.alert_name AS alertName,
            a.alert_type AS alertType,
            a.severity,
            a.status,
            a.description,
            a.confidence,
            a.detected_at AS detectedAt
        FROM incident_alerts ia

        INNER JOIN alerts a
            ON ia.alert_id = a.id

        WHERE ia.incident_id = ?

        ORDER BY a.detected_at ASC
        `,
        [incidentId]
    );


    for (const alert of alerts) {

        timeline.push({
            id: `alert-${alert.id}`,

            type: "ALERT",

            timestamp: alert.detectedAt,

            title: alert.alertName,

            severity: alert.severity,

            source: "Detection Engine",

            description: alert.description,

            confidence:
                Number(alert.confidence || 0),

            status: alert.status
        });
    }

    // --------------------------------------------------
// 3. Automated response actions
// --------------------------------------------------

const [responseActions] = await pool.query(
    `
    SELECT
        ra.id,
        ra.action_type AS actionType,
        ra.action_title AS actionTitle,
        ra.target,
        ra.description,
        ra.status,
        ra.executed_at AS executedAt
    FROM response_actions ra
    WHERE ra.incident_id = ?
    ORDER BY ra.executed_at ASC
    `,
    [incidentId]
);


for (const action of responseActions) {

    timeline.push({
        id: `response-${action.id}`,

        type: "RESPONSE_ACTION",

        timestamp: action.executedAt,

        title: action.actionTitle,

        severity: "High",

        source: "Automated Response Engine",

        description: action.description,

        target: action.target || "",

        actionType: action.actionType,

        status: action.status
    });
}

    // --------------------------------------------------
    // 4. Incident creation
    // --------------------------------------------------

    timeline.push({
        id: `incident-${incident.id}`,

        type: "INCIDENT",

        timestamp: incident.createdAt,

        title: incident.title,

        severity: incident.severity,

        source: "Incident Management",

        description: incident.description,

        confidence:
            Number(incident.confidence || 0),

        status: incident.status,

        threatType:
            incident.threatType || ""
    });


    // Sort complete timeline
    timeline.sort(
        (a, b) =>
            new Date(a.timestamp) -
            new Date(b.timestamp)
    );


    return {
        incident: {
            id: incident.id,

            title: incident.title,

            severity: incident.severity,

            status: incident.status,

            threatType:
                incident.threatType || "",

            confidence:
                Number(incident.confidence || 0)
        },

        asset: {
            id: incident.assetId,

            name: incident.assetName,

            type: incident.assetType,

            ip: incident.assetIp || "",

            department:
                incident.assetDepartment || ""
        },

        timeline,

        eventCount: timeline.length,

        startTime:
            timeline.length > 0
                ? timeline[0].timestamp
                : incident.createdAt,

        endTime:
            timeline.length > 0
                ? timeline[timeline.length - 1].timestamp
                : incident.createdAt
    };
};


// Get timelines for all incidents
const getAllForensicTimelines = async () => {

    const [incidents] = await pool.query(
        `
        SELECT id
        FROM incidents
        ORDER BY created_at DESC
        `
    );

    const results = [];

    for (const incident of incidents) {

        const timeline =
            await getForensicTimeline(
                incident.id
            );

        if (timeline) {
            results.push(timeline);
        }
    }

    return results;
};


module.exports = {
    getForensicTimeline,
    getAllForensicTimelines
};