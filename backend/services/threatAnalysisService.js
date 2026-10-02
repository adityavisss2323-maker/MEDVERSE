const { pool } = require("../config/db");

const getThreatAnalysis = async (assetId) => {
    // --------------------------------------------------
    // 1. Get asset
    // --------------------------------------------------
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
        `,
        [assetId]
    );

    if (assetRows.length === 0) {
        return null;
    }

    const asset = assetRows[0];


    // --------------------------------------------------
    // 2. Get active alerts
    // --------------------------------------------------
    const [alertRows] = await pool.query(
        `
        SELECT
            id,
            alert_name AS alertName,
            alert_type AS alertType,
            severity,
            status,
            description,
            confidence,
            detection_reason AS detectionReason,
            potential_impact AS potentialImpact,
            recommended_actions AS recommendedActions,
            detected_at AS detectedAt
        FROM alerts
        WHERE asset_id = ?
          AND status IN ('New', 'Investigating', 'Contained')
        ORDER BY detected_at DESC
        `,
        [assetId]
    );


    // --------------------------------------------------
    // 3. Get active incidents
    // --------------------------------------------------
    const [incidentRows] = await pool.query(
        `
        SELECT
            id,
            title,
            severity,
            status,
            threat_type AS threatType,
            description,
            confidence,
            impact,
            recommended_actions AS recommendedActions,
            created_at AS createdAt
        FROM incidents
        WHERE asset_id = ?
          AND status IN ('Open', 'Investigating', 'Contained')
        ORDER BY created_at DESC
        `,
        [assetId]
    );


    // --------------------------------------------------
    // 4. Cyber DNA
    // --------------------------------------------------
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
        [assetId]
    );


    const statistics = eventRows[0];

    const totalEvents =
        Number(statistics.totalEvents || 0);

    const highEvents =
        Number(statistics.highEvents || 0);

    const criticalEvents =
        Number(statistics.criticalEvents || 0);


    let cyberDNADeviation = 0;

    cyberDNADeviation += totalEvents * 5;
    cyberDNADeviation += highEvents * 10;
    cyberDNADeviation += criticalEvents * 20;

    cyberDNADeviation =
        Math.min(cyberDNADeviation, 100);


    // --------------------------------------------------
    // 5. Calculate threat gravity
    // --------------------------------------------------
    let threatScore = 0;

    const severityWeight = {
        Low: 10,
        Medium: 25,
        High: 50,
        Critical: 75
    };


    for (const alert of alertRows) {
        threatScore +=
            severityWeight[alert.severity] || 0;
    }


    for (const incident of incidentRows) {
        threatScore +=
            (severityWeight[incident.severity] || 0) * 1.5;
    }


    threatScore += cyberDNADeviation;


    if (asset.criticality === "Critical") {
        threatScore += 20;
    } else if (asset.criticality === "High") {
        threatScore += 10;
    }


    threatScore = Math.min(
        Math.round(threatScore),
        100
    );


    // --------------------------------------------------
    // 6. Determine threat level
    // --------------------------------------------------
    let threatLevel = "Low";

    if (threatScore >= 75) {
        threatLevel = "Critical";
    } else if (threatScore >= 50) {
        threatLevel = "High";
    } else if (threatScore >= 25) {
        threatLevel = "Medium";
    }


    // --------------------------------------------------
    // 7. Determine primary threat type
    // --------------------------------------------------
    let threatType = "No Active Threat";

    if (incidentRows.length > 0) {
        threatType =
            incidentRows[0].threatType ||
            "Unknown Threat";
    } else if (alertRows.length > 0) {
        threatType =
            alertRows[0].alertType ||
            "Unknown Threat";
    }


    // --------------------------------------------------
    // 8. Build explanation
    // --------------------------------------------------
    const reasons = [];

    if (alertRows.length > 0) {
        reasons.push(
            `${alertRows.length} active security alert(s)`
        );
    }

    if (incidentRows.length > 0) {
        reasons.push(
            `${incidentRows.length} active incident(s)`
        );
    }

    if (cyberDNADeviation > 0) {
        reasons.push(
            `Cyber DNA deviation detected: ${cyberDNADeviation}%`
        );
    }

    if (reasons.length === 0) {
        reasons.push(
            "No active security indicators detected"
        );
    }


    // --------------------------------------------------
    // 9. Potential impact
    // --------------------------------------------------
    const potentialImpact = [];

    for (const alert of alertRows) {
        if (alert.potentialImpact) {
            try {
                const impact =
                    typeof alert.potentialImpact === "string"
                        ? JSON.parse(alert.potentialImpact)
                        : alert.potentialImpact;

                if (Array.isArray(impact)) {
                    potentialImpact.push(...impact);
                }
            } catch {
                // Ignore invalid JSON
            }
        }
    }


    for (const incident of incidentRows) {
        if (incident.impact) {
            try {
                const impact =
                    typeof incident.impact === "string"
                        ? JSON.parse(incident.impact)
                        : incident.impact;

                if (Array.isArray(impact)) {
                    potentialImpact.push(...impact);
                }
            } catch {
                // Ignore invalid JSON
            }
        }
    }


    // Remove duplicate impact items
    const uniqueImpact = [
        ...new Set(potentialImpact)
    ];


    // --------------------------------------------------
    // 10. Recommended actions
    // --------------------------------------------------
    const recommendedActions = [];

    for (const alert of alertRows) {
        if (alert.recommendedActions) {
            try {
                const actions =
                    typeof alert.recommendedActions === "string"
                        ? JSON.parse(alert.recommendedActions)
                        : alert.recommendedActions;

                if (Array.isArray(actions)) {
                    recommendedActions.push(...actions);
                }
            } catch {
                // Ignore invalid JSON
            }
        }
    }


    for (const incident of incidentRows) {
        if (incident.recommendedActions) {
            try {
                const actions =
                    typeof incident.recommendedActions === "string"
                        ? JSON.parse(incident.recommendedActions)
                        : incident.recommendedActions;

                if (Array.isArray(actions)) {
                    recommendedActions.push(...actions);
                }
            } catch {
                // Ignore invalid JSON
            }
        }
    }


    const uniqueActions = [
        ...new Set(recommendedActions)
    ];


    // --------------------------------------------------
    // Final Threat Analysis
    // --------------------------------------------------
    return {
        asset: {
            id: asset.id,
            name: asset.name,
            type: asset.type,
            ipAddress: asset.ipAddress || "",
            department: asset.department || "",
            status: asset.status,
            riskLevel: asset.riskLevel,
            criticality: asset.criticality
        },

        threat: {
            type: threatType,
            level: threatLevel,
            score: threatScore,
            confidence:
                alertRows.length > 0
                    ? Math.max(
                        ...alertRows.map(
                            alert =>
                                Number(alert.confidence || 0)
                        )
                    )
                    : 0
        },

        cyberDNA: {
            deviationScore: cyberDNADeviation,
            totalSecurityEvents: totalEvents,
            highSeverityEvents: highEvents,
            criticalSeverityEvents: criticalEvents
        },

        alerts: alertRows,

        incidents: incidentRows,

        potentialImpact: uniqueImpact,

        recommendedActions: uniqueActions,

        explanation: reasons
    };
};


const getAllThreatAnalyses = async () => {
    const [assets] = await pool.query(
        `
        SELECT id
        FROM assets
        ORDER BY id ASC
        `
    );

    const results = [];

    for (const asset of assets) {
        const analysis =
            await getThreatAnalysis(asset.id);

        if (analysis) {
            results.push(analysis);
        }
    }

    return results;
};


module.exports = {
    getThreatAnalysis,
    getAllThreatAnalyses
};