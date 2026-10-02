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

const formatDetectionTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
};

const mapIncidentRow = (row) => {
    const impact = parseJSON(row.impact);
    const recommendedActions = parseJSON(row.recommendedActions);

    return {
        // Basic incident information
        id: String(row.id),
        title: row.title || "",
        severity: row.severity || "Low",
        status: row.status || "Open",

        // Frontend asset fields
        assetName: row.assetName || "",
        department: row.assetDepartment || "",

        // Frontend expects this name
        detectionTime: formatDetectionTime(row.createdAt),

        // Frontend expects aiConfidence
        aiConfidence: Number(row.confidence || 0),

        // Technical summary
        summary: row.description || "",

        // Simple/Executive summary
        simpleSummary: row.description || "",

        // Frontend expects one recommended action
        recommendedAction:
            recommendedActions.length > 0
                ? recommendedActions.join(". ")
                : "",

        // Additional incident information
        threatType: row.threatType || "",

        description: row.description || "",

        confidence: Number(row.confidence || 0),

        impact,

        recommendedActions,

        createdAt: row.createdAt,

        updatedAt: row.updatedAt,

        // Keep the existing backend asset structure
        // so other backend consumers are not broken.
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

        alerts: []
    };
};


// Get all incidents
const findAllIncidents = async () => {
    const [rows] = await pool.query(`
        SELECT
            i.id,
            i.title,
            i.severity,
            i.status,
            i.asset_id AS assetId,
            i.threat_type AS threatType,
            i.description,
            i.confidence,
            i.impact,
            i.recommended_actions AS recommendedActions,
            i.created_at AS createdAt,
            i.updated_at AS updatedAt,

            ast.name AS assetName,
            ast.type AS assetType,
            ast.ip_address AS assetIp,
            ast.department AS assetDepartment,
            ast.status AS assetStatus,
            ast.risk_level AS assetRiskLevel,
            ast.criticality AS assetCriticality

        FROM incidents i

        INNER JOIN assets ast
            ON i.asset_id = ast.id

        ORDER BY i.created_at DESC
    `);

    const incidents = rows.map(mapIncidentRow);

    for (const incident of incidents) {
        incident.alerts = await findAlertsForIncident(incident.id);
    }

    return incidents;
};


// Get single incident
const findIncidentById = async (id) => {
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
            i.impact,
            i.recommended_actions AS recommendedActions,
            i.created_at AS createdAt,
            i.updated_at AS updatedAt,

            ast.name AS assetName,
            ast.type AS assetType,
            ast.ip_address AS assetIp,
            ast.department AS assetDepartment,
            ast.status AS assetStatus,
            ast.risk_level AS assetRiskLevel,
            ast.criticality AS assetCriticality

        FROM incidents i

        INNER JOIN assets ast
            ON i.asset_id = ast.id

        WHERE i.id = ?
        `,
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    const incident = mapIncidentRow(rows[0]);

    incident.alerts = await findAlertsForIncident(id);

    return incident;
};


// Get alerts belonging to an incident
const findAlertsForIncident = async (incidentId) => {
    const [rows] = await pool.query(
        `
        SELECT
            a.id,
            a.alert_name AS alertName,
            a.alert_type AS alertType,
            a.severity,
            a.status,
            a.description,
            a.confidence,
            a.detected_at AS detectedAt,

            ast.name AS assetName

        FROM incident_alerts ia

        INNER JOIN alerts a
            ON ia.alert_id = a.id

        INNER JOIN assets ast
            ON a.asset_id = ast.id

        WHERE ia.incident_id = ?

        ORDER BY a.detected_at DESC
        `,
        [incidentId]
    );

    return rows;
};


// Create incident
const createNewIncident = async (data) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `
            INSERT INTO incidents
            (
                title,
                severity,
                status,
                asset_id,
                threat_type,
                description,
                confidence,
                impact,
                recommended_actions
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                data.title,
                data.severity,
                data.status || "Open",
                data.assetId,
                data.threatType || null,
                data.description || "",
                data.confidence || 0,
                JSON.stringify(data.impact || []),
                JSON.stringify(data.recommendedActions || [])
            ]
        );

        const incidentId = result.insertId;

        // Attach alerts if supplied
        if (Array.isArray(data.alertIds)) {
            for (const alertId of data.alertIds) {
                await connection.query(
                    `
                    INSERT INTO incident_alerts
                    (
                        incident_id,
                        alert_id
                    )
                    VALUES (?, ?)
                    `,
                    [incidentId, alertId]
                );
            }
        }

        await connection.commit();

        return findIncidentById(incidentId);

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};


// Update incident
const updateExistingIncident = async (id, data) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [result] = await connection.query(
            `
            UPDATE incidents
            SET
                title = ?,
                severity = ?,
                status = ?,
                asset_id = ?,
                threat_type = ?,
                description = ?,
                confidence = ?,
                impact = ?,
                recommended_actions = ?
            WHERE id = ?
            `,
            [
                data.title,
                data.severity,
                data.status,
                data.assetId,
                data.threatType || null,
                data.description || "",
                data.confidence || 0,
                JSON.stringify(data.impact || []),
                JSON.stringify(data.recommendedActions || []),
                id
            ]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return null;
        }

        // Update alert relationships if alertIds were supplied
        if (Array.isArray(data.alertIds)) {

            await connection.query(
                `
                DELETE FROM incident_alerts
                WHERE incident_id = ?
                `,
                [id]
            );

            for (const alertId of data.alertIds) {
                await connection.query(
                    `
                    INSERT INTO incident_alerts
                    (
                        incident_id,
                        alert_id
                    )
                    VALUES (?, ?)
                    `,
                    [id, alertId]
                );
            }
        }

        await connection.commit();

        return findIncidentById(id);

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
};


// Delete incident
const deleteExistingIncident = async (id) => {
    const [result] = await pool.query(
        `
        DELETE FROM incidents
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows > 0;
};


// Change incident status
const changeIncidentStatus = async (id, status) => {
    const [result] = await pool.query(
        `
        UPDATE incidents
        SET status = ?
        WHERE id = ?
        `,
        [status, id]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findIncidentById(id);
};


module.exports = {
    findAllIncidents,
    findIncidentById,
    createNewIncident,
    updateExistingIncident,
    deleteExistingIncident,
    changeIncidentStatus,
    findAlertsForIncident
};