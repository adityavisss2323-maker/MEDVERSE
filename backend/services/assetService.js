const { pool } = require("../config/db");

const findAllAssets = async () => {
    const [rows] = await pool.query(`
        SELECT
            id,
            name,
            type,
            ip_address AS ipAddress,
            department,
            status,
            risk_level AS riskLevel,
            criticality,
            last_seen AS lastSeen,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM assets
        ORDER BY created_at DESC
    `);

    return rows;
};

const findAssetById = async (id) => {
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
            criticality,
            last_seen AS lastSeen,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM assets
        WHERE id = ?
        `,
        [id]
    );

    return rows[0] || null;
};

const createNewAsset = async (data) => {
    const [result] = await pool.query(
        `
        INSERT INTO assets
        (
            name,
            type,
            ip_address,
            department,
            status,
            risk_level,
            criticality
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            data.name,
            data.type,
            data.ipAddress || null,
            data.department || null,
            data.status || "Normal",
            data.riskLevel || "Low",
            data.criticality || "Medium"
        ]
    );

    return findAssetById(result.insertId);
};

const updateExistingAsset = async (id, data) => {
    const [result] = await pool.query(
        `
        UPDATE assets
        SET
            name = ?,
            type = ?,
            ip_address = ?,
            department = ?,
            status = ?,
            risk_level = ?,
            criticality = ?
        WHERE id = ?
        `,
        [
            data.name,
            data.type,
            data.ipAddress || null,
            data.department || null,
            data.status || "Normal",
            data.riskLevel || "Low",
            data.criticality || "Medium",
            id
        ]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findAssetById(id);
};

const deleteExistingAsset = async (id) => {
    const [result] = await pool.query(
        `DELETE FROM assets WHERE id = ?`,
        [id]
    );

    return result.affectedRows > 0;
};

const changeAssetStatus = async (id, status) => {
    const [result] = await pool.query(
        `
        UPDATE assets
        SET
            status = ?,
            last_seen = CURRENT_TIMESTAMP
        WHERE id = ?
        `,
        [status, id]
    );

    if (result.affectedRows === 0) {
        return null;
    }

    return findAssetById(id);
};

module.exports = {
    findAllAssets,
    findAssetById,
    createNewAsset,
    updateExistingAsset,
    deleteExistingAsset,
    changeAssetStatus
};