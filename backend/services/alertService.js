const { pool } = require("../config/db");

const parseJSON = (value) => {
    if (!value) return [];
    
    if (Array.isArray(value)) {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return [];
    }
};

const mapAlertRow = (row) => {
    return {
        id: row.id,

        alertName: row.alertName,
        alertType: row.alertType,

        asset: row.assetId
            ? {
                id: row.assetId,
                name: row.assetName,
                type: row.assetType,
                ipAddress: row.assetIp,
                department: row.assetDepartment,
                status: row.assetStatus,
                riskLevel: row.assetRiskLevel,
                criticality: row.assetCriticality
            }
            : null,

        severity: row.severity,
        status: row.status,
        description: row.description,

        sourceEvent: row.sourceEventId
            ? {
                id: row.sourceEventId,
                eventType: row.eventType,
                source: row.eventSource,
                description: row.eventDescription,
                severity: row.eventSeverity,
                sourceIp: row.sourceIp,
                destinationIp: row.destinationIp,
                timestamp: row.eventTimestamp
            }
            : null,

        confidence: Number(row.confidence || 0),

        detectionReason: parseJSON(row.detectionReason),
        potentialImpact: parseJSON(row.potentialImpact),
        recommendedActions: parseJSON(row.recommendedActions),

        detectedAt: row.detectedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
    };
};


const findAllAlerts = async () => {
    const [rows] = await pool.query(`
        SELECT
            a.id,
            a.alert_name AS alertName,
            a.alert_type AS alertType,
            a.asset_id AS assetId,
            a.severity,
            a.status,
            a.description,
            a.source_event_id AS sourceEventId,
            a.confidence,
            a.detection_reason AS detectionReason,
            a.potential_impact AS potentialImpact,
            a.recommended_actions AS recommendedActions,
            a.detected_at AS detectedAt,
            a.created_at AS createdAt,
            a.updated_at AS updatedAt,

            ast.name AS assetName,
            ast.type AS assetType,
            ast.ip_address AS assetIp,
            ast.department AS assetDepartment,
            ast.status AS assetStatus,
            ast.risk_level AS assetRiskLevel,
            ast.criticality AS assetCriticality,

            se.event_type AS eventType,
            se.source AS eventSource,
            se.description AS eventDescription,
            se.severity AS eventSeverity,
            se.source_ip AS sourceIp,
            se.destination_ip AS destinationIp,
            se.timestamp AS eventTimestamp

        FROM alerts a

        INNER JOIN assets ast
            ON a.asset_id = ast.id

        LEFT JOIN security_events se
            ON a.source_event_id = se.id

        ORDER BY a.detected_at DESC
    `);

    return rows.map(mapAlertRow);
};


const findAlertById = async (id) => {
    const [rows] = await pool.query(
        `
        SELECT
            a.id,
            a.alert_name AS alertName,
            a.alert_type AS alertType,
            a.asset_id AS assetId,
            a.severity,
            a.status,
            a.description,
            a.source_event_id AS sourceEventId,
            a.confidence,
            a.detection_reason AS detectionReason,
            a.potential_impact AS potentialImpact,
            a.recommended_actions AS recommendedActions,
            a.detected_at AS detectedAt,
            a.created_at AS createdAt,
            a.updated_at AS updatedAt,

            ast.name AS assetName,
            ast.type AS assetType,
            ast.ip_address AS assetIp,
            ast.department AS assetDepartment,
            ast.status AS assetStatus,
            ast.risk_level AS assetRiskLevel,
            ast.criticality AS assetCriticality,

            se.event_type AS eventType,
            se.source AS eventSource,
            se.description AS eventDescription,
            se.severity AS eventSeverity,
            se.source_ip AS sourceIp,
            se.destination_ip AS destinationIp,
            se.timestamp AS eventTimestamp

        FROM alerts a

        INNER JOIN assets ast
            ON a.asset_id = ast.id

        LEFT JOIN security_events se
            ON a.source_event_id = se.id

        WHERE a.id = ?
        `,
        [id]
    );

    return rows.length ? mapAlertRow(rows[0]) : null;
};


const createNewAlert = async (data) => {
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
            recommended_actions,
            detected_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.alertName,
            data.alertType,
            data.assetId,
            data.severity,
            data.status || "New",
            data.description,
            data.sourceEventId || null,
            data.confidence || 0,
            JSON.stringify(data.detectionReason || []),
            JSON.stringify(data.potentialImpact || []),
            JSON.stringify(data.recommendedActions || []),
            data.detectedAt || new Date()
        ]
    );

    return findAlertById(result.insertId);
};


const updateExistingAlert = async (id, data) => {
    const [result] = await pool.query(
        `
        UPDATE alerts
        SET
            alert_name = ?,
            alert_type = ?,
            asset_id = ?,
            severity = ?,
            status = ?,
            description = ?,
            source_event_id = ?,
            confidence = ?,
            detection_reason = ?,
            potential_impact = ?,
            recommended_actions = ?
        WHERE id = ?
        `,
        [
            data.alertName,
            data.alertType,
            data.assetId,
            data.severity,
            data.status,
            data.description,
            data.sourceEventId || null,
            data.confidence || 0,
            JSON.stringify(data.detectionReason || []),
            JSON.stringify(data.potentialImpact || []),
            JSON.stringify(data.recommendedActions || []),
            id
        ]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findAlertById(id);
};


const deleteExistingAlert = async (id) => {
    const [result] = await pool.query(
        `
        DELETE FROM alerts
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows > 0;
};


const changeAlertStatus = async (id, status) => {
    const [result] = await pool.query(
        `
        UPDATE alerts
        SET status = ?
        WHERE id = ?
        `,
        [status, id]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findAlertById(id);
};


const findActiveAlert = async (assetId, alertType) => {
    const [rows] = await pool.query(
        `
        SELECT id
        FROM alerts
        WHERE asset_id = ?
          AND alert_type = ?
          AND status IN ('New', 'Investigating', 'Contained')
        LIMIT 1
        `,
        [assetId, alertType]
    );

    return rows[0] || null;
};


module.exports = {
    findAllAlerts,
    findAlertById,
    createNewAlert,
    updateExistingAlert,
    deleteExistingAlert,
    changeAlertStatus,
    findActiveAlert
};