const { pool } = require("../config/db");

const findAllSecurityEvents = async () => {
    const [rows] = await pool.query(`
        SELECT
            se.id,
            se.event_type AS eventType,
            se.asset_id AS assetId,
            se.source,
            se.description,
            se.severity,
            se.source_ip AS sourceIp,
            se.destination_ip AS destinationIp,
            se.timestamp,
            se.created_at AS createdAt,
            se.updated_at AS updatedAt,

            a.name AS assetName,
            a.type AS assetType,
            a.ip_address AS assetIp,
            a.department AS assetDepartment

        FROM security_events se

        INNER JOIN assets a
            ON se.asset_id = a.id

        ORDER BY se.timestamp DESC
    `);

    return rows;
};

const findSecurityEventById = async (id) => {
    const [rows] = await pool.query(
        `
        SELECT
            se.id,
            se.event_type AS eventType,
            se.asset_id AS assetId,
            se.source,
            se.description,
            se.severity,
            se.source_ip AS sourceIp,
            se.destination_ip AS destinationIp,
            se.timestamp,
            se.created_at AS createdAt,
            se.updated_at AS updatedAt,

            a.name AS assetName,
            a.type AS assetType,
            a.ip_address AS assetIp,
            a.department AS assetDepartment

        FROM security_events se

        INNER JOIN assets a
            ON se.asset_id = a.id

        WHERE se.id = ?
        `,
        [id]
    );

    return rows[0] || null;
};

const createNewSecurityEvent = async (data) => {
    const [result] = await pool.query(
        `
        INSERT INTO security_events
        (
            event_type,
            asset_id,
            source,
            description,
            severity,
            source_ip,
            destination_ip
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.eventType,
            data.assetId,
            data.source,
            data.description,
            data.severity || "Low",
            data.sourceIp || null,
            data.destinationIp || null
        ]
    );

    return findSecurityEventById(result.insertId);
};

const deleteSecurityEvent = async (id) => {
    const [result] = await pool.query(
        `
        DELETE FROM security_events
        WHERE id = ?
        `,
        [id]
    );

    return result.affectedRows > 0;
};

module.exports = {
    findAllSecurityEvents,
    findSecurityEventById,
    createNewSecurityEvent,
    deleteSecurityEvent
};