const { pool } = require("../config/db");

const calculateCriticalityScore = (criticality) => {
    switch (criticality) {
        case "Critical":
            return 100;
        case "High":
            return 75;
        case "Medium":
            return 50;
        case "Low":
            return 25;
        default:
            return 0;
    }
};

const getDigitalTwinAssets = async () => {
    const [rows] = await pool.query(`
        SELECT
            a.id,
            a.name,
            a.type,
            a.ip_address AS ipAddress,
            a.department,
            a.status,
            a.risk_level AS riskLevel,
            a.criticality,
            a.last_seen AS lastSeen,

            COUNT(DISTINCT CASE
                WHEN al.status IN ('New', 'Investigating', 'Contained')
                THEN al.id
            END) AS activeAlertsCount,

            COUNT(DISTINCT CASE
                WHEN i.status IN ('Open', 'Investigating', 'Contained')
                THEN i.id
            END) AS incidentsCount

        FROM assets a

        LEFT JOIN alerts al
            ON a.id = al.asset_id

        LEFT JOIN incidents i
            ON a.id = i.asset_id

        GROUP BY
            a.id,
            a.name,
            a.type,
            a.ip_address,
            a.department,
            a.status,
            a.risk_level,
            a.criticality,
            a.last_seen

        ORDER BY a.name ASC
    `);

    return rows;
};


const getAssetConnections = async (assetId) => {
    /*
     * Network connection relationships will be populated
     * when the telemetry/network relationship module is added.
     *
     * For now return an empty array so the frontend contract
     * remains stable.
     */
    return [];
};


const getThreatGravityImpact = async (assetId) => {
    const [rows] = await pool.query(
        `
        SELECT
            i.id,
            i.title,
            i.severity,
            i.status,
            i.threat_type AS threatType
        FROM incidents i
        WHERE i.asset_id = ?
          AND i.status IN ('Open', 'Investigating', 'Contained')
        ORDER BY i.created_at DESC
        `,
        [assetId]
    );

    return rows.map((incident) => ({
        incidentId: String(incident.id),
        title: incident.title,
        severity: incident.severity,
        status: incident.status,
        threatType: incident.threatType || ""
    }));
};


const getCyberDNADeviation = async (assetId) => {
    const [rows] = await pool.query(
        `
        SELECT
            COUNT(*) AS totalEvents,

            SUM(
                CASE
                    WHEN severity = 'High'
                    THEN 1
                    ELSE 0
                END
            ) AS highEvents,

            SUM(
                CASE
                    WHEN severity = 'Critical'
                    THEN 1
                    ELSE 0
                END
            ) AS criticalEvents

        FROM security_events

        WHERE asset_id = ?

          AND timestamp >= DATE_SUB(
              CURRENT_TIMESTAMP,
              INTERVAL 24 HOUR
          )
        `,
        [assetId]
    );

    const statistics = rows[0];

    const totalEvents =
        Number(statistics.totalEvents || 0);

    const highEvents =
        Number(statistics.highEvents || 0);

    const criticalEvents =
        Number(statistics.criticalEvents || 0);

    let deviation = 0;

    deviation += totalEvents * 5;

    deviation += highEvents * 10;

    deviation += criticalEvents * 20;

    return Math.min(deviation, 100);
};


const buildDigitalTwinAsset = async (asset) => {
    const connections = await getAssetConnections(asset.id);

    const threatGravityImpact =
        await getThreatGravityImpact(asset.id);

    const cyberDNADeviation =
        await getCyberDNADeviation(asset.id);

    return {
        id: asset.id,
        name: asset.name,
        type: asset.type,
        department: asset.department || "",
        ipAddress: asset.ipAddress || "",

        status: asset.status,

        riskLevel: asset.riskLevel,

        criticality: asset.criticality,

        criticalityScore:
            calculateCriticalityScore(asset.criticality),

        lastSeen: asset.lastSeen,

        connections,

        cyberDNADeviation,

        activeAlertsCount:
            Number(asset.activeAlertsCount || 0),

        incidentsCount:
            Number(asset.incidentsCount || 0),

        threatGravityImpact
    };
};


const getDigitalTwin = async () => {
    const assets = await getDigitalTwinAssets();

    const digitalTwinAssets = [];

    for (const asset of assets) {
        digitalTwinAssets.push(
            await buildDigitalTwinAsset(asset)
        );
    }

    return digitalTwinAssets;
};


const getDigitalTwinAsset = async (id) => {
    const [rows] = await pool.query(
        `
        SELECT
            a.id,
            a.name,
            a.type,
            a.ip_address AS ipAddress,
            a.department,
            a.status,
            a.risk_level AS riskLevel,
            a.criticality,
            a.last_seen AS lastSeen,

            COUNT(DISTINCT CASE
                WHEN al.status IN ('New', 'Investigating', 'Contained')
                THEN al.id
            END) AS activeAlertsCount,

            COUNT(DISTINCT CASE
                WHEN i.status IN ('Open', 'Investigating', 'Contained')
                THEN i.id
            END) AS incidentsCount

        FROM assets a

        LEFT JOIN alerts al
            ON a.id = al.asset_id

        LEFT JOIN incidents i
            ON a.id = i.asset_id

        WHERE a.id = ?

        GROUP BY
            a.id,
            a.name,
            a.type,
            a.ip_address,
            a.department,
            a.status,
            a.risk_level,
            a.criticality,
            a.last_seen
        `,
        [id]
    );

    if (rows.length === 0) {
        return null;
    }

    return buildDigitalTwinAsset(rows[0]);
};


module.exports = {
    getDigitalTwin,
    getDigitalTwinAsset
};