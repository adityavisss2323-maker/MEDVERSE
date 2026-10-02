const { pool } = require("../config/db");
const {
    createNewIncident,
    findIncidentById
} = require("./incidentService");

// Detection time window
const DETECTION_WINDOW_MINUTES = 10;


// ============================================================
// GET ASSET FROM MYSQL
// ============================================================
const getAsset = async (assetId) => {
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
        LIMIT 1
        `,
        [assetId]
    );

    return rows[0] || null;
};


// ============================================================
// GET RECENT SECURITY EVENTS
// ============================================================
const getRecentEvents = async (assetId) => {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            event_type AS eventType,
            asset_id AS assetId,
            source,
            description,
            severity,
            source_ip AS sourceIp,
            destination_ip AS destinationIp,
            timestamp
        FROM security_events
        WHERE asset_id = ?
          AND timestamp >= DATE_SUB(
              CURRENT_TIMESTAMP,
              INTERVAL ? MINUTE
          )
        ORDER BY timestamp DESC
        `,
        [assetId, DETECTION_WINDOW_MINUTES]
    );

    return rows;
};


// ============================================================
// CHECK WHETHER SIMILAR ALERT ALREADY EXISTS
// ============================================================
const alertAlreadyExists = async (assetId, alertType) => {
    const [rows] = await pool.query(
        `
        SELECT
            id,
            alert_name AS alertName,
            alert_type AS alertType,
            asset_id AS assetId,
            severity,
            status,
            description,
            source_event_id AS sourceEventId,
            confidence,
            detection_reason AS detectionReason,
            potential_impact AS potentialImpact,
            recommended_actions AS recommendedActions,
            detected_at AS detectedAt
        FROM alerts
        WHERE asset_id = ?
          AND alert_type = ?
          AND status IN (
              'New',
              'Investigating',
              'Contained'
          )
        ORDER BY detected_at DESC
        LIMIT 1
        `,
        [assetId, alertType]
    );

    return rows[0] || null;
};


// ============================================================
// CREATE ALERT IN MYSQL
// ============================================================
const createDetectionAlert = async ({
    asset,
    alertType,
    severity,
    description,
    sourceEvent,
    confidence,
    detectionReason,
    potentialImpact,
    recommendedActions
}) => {

    // Prevent duplicate active alerts
    const existingAlert = await alertAlreadyExists(
        asset.id,
        alertType
    );

    if (existingAlert) {
        return existingAlert;
    }

    const [result] = await pool.query(
        `
        INSERT INTO alerts
        (
            alert_name,
            alert_type,
            asset_id,
            severity,
            status,
            description,
            source_event_id,
            confidence,
            detection_reason,
            potential_impact,
            recommended_actions
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            alertType,
            alertType,
            asset.id,
            severity,
            "New",
            description,
            sourceEvent || null,
            confidence || 0,
            JSON.stringify(detectionReason || []),
            JSON.stringify(potentialImpact || []),
            JSON.stringify(recommendedActions || [])
        ]
    );

    const [rows] = await pool.query(
        `
        SELECT
            id,
            alert_name AS alertName,
            alert_type AS alertType,
            asset_id AS assetId,
            severity,
            status,
            description,
            source_event_id AS sourceEventId,
            confidence,
            detection_reason AS detectionReason,
            potential_impact AS potentialImpact,
            recommended_actions AS recommendedActions,
            detected_at AS detectedAt
        FROM alerts
        WHERE id = ?
        `,
        [result.insertId]
    );

    return rows[0];
};


// ============================================================
// CREATE INCIDENT FROM ALERT
// ============================================================
const createIncidentFromAlert = async (alert) => {

    // Check whether this alert is already linked to an incident
    const [existingLinks] = await pool.query(
        `
        SELECT incident_id
        FROM incident_alerts
        WHERE alert_id = ?
        LIMIT 1
        `,
        [alert.id]
    );

    if (existingLinks.length > 0) {
        return await findIncidentById(
            existingLinks[0].incident_id
        );
    }

    return await createNewIncident({
        title: `${alert.alertType} Incident`,
        severity: alert.severity,
        status: "Open",
        assetId: alert.assetId,
        threatType: alert.alertType,
        description: alert.description,
        confidence: Number(alert.confidence || 0),
        impact: parseJSON(alert.potentialImpact),
        recommendedActions: parseJSON(alert.recommendedActions),
        alertIds: [alert.id]
    });
};


// ============================================================
// JSON HELPER
// ============================================================
const parseJSON = (value) => {
    if (!value) {
        return [];
    }

    if (Array.isArray(value)) {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return [];
    }
};


// ============================================================
// DETECT SUSPICIOUS AUTHENTICATION
// ============================================================
const detectSuspiciousAuthentication = async (
    asset,
    events
) => {

    const failedLogins = events.filter(
        event => event.eventType === "FAILED_LOGIN"
    );

    // 3 or more failed login attempts
    if (failedLogins.length >= 3) {

        return await createDetectionAlert({

            asset,

            alertType: "Suspicious Authentication",

            severity: "High",

            description:
                "Multiple failed authentication attempts detected on the same asset.",

            sourceEvent:
                failedLogins[0].id,

            confidence: Math.min(
                95,
                60 + failedLogins.length * 5
            ),

            detectionReason: [
                `${failedLogins.length} failed login attempts detected`,
                "Events occurred within the detection window",
                "Repeated authentication failures may indicate credential abuse"
            ],

            potentialImpact: [
                "Unauthorized account access",
                "Credential compromise",
                "Privilege escalation"
            ],

            recommendedActions: [
                "Investigate the source IP",
                "Verify the affected account",
                "Review authentication logs",
                "Consider temporarily disabling the account"
            ]
        });
    }

    return null;
};


// ============================================================
// DETECT NETWORK RECONNAISSANCE
// ============================================================
const detectNetworkReconnaissance = async (
    asset,
    events
) => {

    const portScans = events.filter(
        event => event.eventType === "PORT_SCAN"
    );

    if (portScans.length >= 3) {

        return await createDetectionAlert({

            asset,

            alertType: "Network Reconnaissance",

            severity: "High",

            description:
                "Repeated port scanning activity detected against the asset.",

            sourceEvent:
                portScans[0].id,

            confidence: Math.min(
                95,
                65 + portScans.length * 5
            ),

            detectionReason: [
                `${portScans.length} port scan events detected`,
                "Repeated network probing detected",
                "Activity indicates possible reconnaissance"
            ],

            potentialImpact: [
                "Network topology discovery",
                "Service enumeration",
                "Preparation for further attack"
            ],

            recommendedActions: [
                "Investigate source IP",
                "Review firewall logs",
                "Check exposed services",
                "Monitor related assets"
            ]
        });
    }

    return null;
};


// ============================================================
// DETECT RANSOMWARE / MALWARE ACTIVITY
// ============================================================
const detectRansomware = async (
    asset,
    events
) => {

    const hasMalware = events.some(
        event => event.eventType === "MALWARE_ACTIVITY"
    );

    const hasFileActivity = events.some(
        event => event.eventType === "FILE_ACTIVITY"
    );

    const hasLateralMovement = events.some(
        event => event.eventType === "LATERAL_MOVEMENT"
    );

    const hasUnusualTraffic = events.some(
        event => event.eventType === "UNUSUAL_TRAFFIC"
    );

    let score = 0;
    const reasons = [];

    if (hasMalware) {
        score += 30;
        reasons.push("Malware activity detected");
    }

    if (hasFileActivity) {
        score += 25;
        reasons.push("Suspicious file activity detected");
    }

    if (hasLateralMovement) {
        score += 25;
        reasons.push("Lateral movement detected");
    }

    if (hasUnusualTraffic) {
        score += 20;
        reasons.push("Unusual network traffic detected");
    }

    // Require at least two indicators
    if (score >= 50) {

        return await createDetectionAlert({

            asset,

            alertType: "Ransomware",

            severity: "Critical",

            description:
                "Multiple indicators associated with ransomware or malware activity were detected.",

            sourceEvent:
                events[0]?.id || null,

            confidence: Math.min(score, 98),

            detectionReason: reasons,

            potentialImpact: [
                "Patient service disruption",
                "Data encryption or destruction",
                "Lateral spread across hospital systems",
                "Potential loss of system availability"
            ],

            recommendedActions: [
                "Isolate the affected asset",
                "Investigate related assets",
                "Review file activity",
                "Preserve forensic evidence",
                "Escalate the incident to the SOC team"
            ]
        });
    }

    return null;
};


// ============================================================
// MAIN DETECTION FUNCTION
// ============================================================
const analyzeAsset = async (assetId) => {

    const asset = await getAsset(assetId);

    if (!asset) {
        throw new Error("Asset not found");
    }

    const events = await getRecentEvents(assetId);

    if (events.length === 0) {
        return {
            asset,
            eventsAnalyzed: 0,
            alertsGenerated: []
        };
    }

    const alerts = [];

    // --------------------------------------------------------
    // Suspicious Authentication
    // --------------------------------------------------------
    const authenticationAlert =
        await detectSuspiciousAuthentication(
            asset,
            events
        );

    if (authenticationAlert) {

        alerts.push(authenticationAlert);

        await createIncidentFromAlert(
            authenticationAlert
        );
    }


    // --------------------------------------------------------
    // Network Reconnaissance
    // --------------------------------------------------------
    const reconnaissanceAlert =
        await detectNetworkReconnaissance(
            asset,
            events
        );

    if (reconnaissanceAlert) {

        alerts.push(reconnaissanceAlert);

        await createIncidentFromAlert(
            reconnaissanceAlert
        );
    }


    // --------------------------------------------------------
    // Ransomware
    // --------------------------------------------------------
    const ransomwareAlert =
        await detectRansomware(
            asset,
            events
        );

    if (ransomwareAlert) {

        alerts.push(ransomwareAlert);

        await createIncidentFromAlert(
            ransomwareAlert
        );
    }


    return {
        asset,
        eventsAnalyzed: events.length,
        alertsGenerated: alerts
    };
};


module.exports = {
    analyzeAsset,
    createIncidentFromAlert
};