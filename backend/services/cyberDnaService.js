const { pool } = require("../config/db");

/* =========================================
   CALCULATE CYBER DNA DEVIATION
   ========================================= */

const calculateDeviation = (
    eventCount,
    highCount,
    criticalCount
) => {
    let score = 0;

    score += eventCount * 5;
    score += highCount * 10;
    score += criticalCount * 20;

    return Math.min(score, 100);
};


/* =========================================
   GET CYBER DNA FOR ONE ASSET
   Accepts:
   - MySQL numeric asset ID
   - Asset name
   ========================================= */

const getCyberDNA = async (assetId) => {

    /* =========================================
       FIND ASSET
       ========================================= */

    const [assetRows] = await pool.query(
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
        [assetId, assetId]
    );

    /* Asset not found */

    if (assetRows.length === 0) {
        return null;
    }

    const asset = assetRows[0];

    /* =========================================
       IMPORTANT:
       Use the REAL MySQL asset ID for
       security_events queries.
       ========================================= */

    const actualAssetId = asset.id;


    /* =========================================
       GET SECURITY EVENT STATISTICS
       LAST 24 HOURS
       ========================================= */

    const [eventRows] = await pool.query(
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
        [actualAssetId]
    );


    /* =========================================
       NORMALIZE STATISTICS
       ========================================= */

    const statistics = eventRows[0] || {};

    const totalEvents =
        Number(statistics.totalEvents || 0);

    const highEvents =
        Number(statistics.highEvents || 0);

    const criticalEvents =
        Number(statistics.criticalEvents || 0);


    /* =========================================
       CALCULATE DEVIATION
       ========================================= */

    const deviation = calculateDeviation(
        totalEvents,
        highEvents,
        criticalEvents
    );


    /* =========================================
       DETERMINE BEHAVIOR STATUS
       ========================================= */

    let behaviorStatus = "Normal";

    if (deviation >= 75) {

        behaviorStatus =
            "Critical Deviation";

    } else if (deviation >= 50) {

        behaviorStatus =
            "High Deviation";

    } else if (deviation >= 25) {

        behaviorStatus =
            "Moderate Deviation";
    }


    /* =========================================
       RETURN FRONTEND-COMPATIBLE RESPONSE
       ========================================= */

    return {

        assetId: asset.id,

        assetName: asset.name,

        assetType: asset.type,

        department:
            asset.department || "",

        deviationScore:
            deviation,

        behaviorStatus,

        analysisWindow:
            "Last 24 Hours",

        statistics: {

            totalSecurityEvents:
                totalEvents,

            highSeverityEvents:
                highEvents,

            criticalSeverityEvents:
                criticalEvents
        }
    };
};


/* =========================================
   GET CYBER DNA FOR ALL ASSETS
   ========================================= */

const getAllCyberDNA = async () => {

    const [assets] = await pool.query(
        `
        SELECT
            id
        FROM assets
        ORDER BY id ASC
        `
    );

    const results = [];

    for (const asset of assets) {

        const dna =
            await getCyberDNA(asset.id);

        if (dna) {
            results.push(dna);
        }
    }

    return results;
};


/* =========================================
   EXPORT
   ========================================= */

module.exports = {
    getCyberDNA,
    getAllCyberDNA
};