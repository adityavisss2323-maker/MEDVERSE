const { pool } = require("../config/db");
const { findIncidentById } = require("./incidentService");
const { getForensicTimeline } = require("./forensicService");

const generateIncidentReport = async (incidentId, language = "en") => {
    const incident = await findIncidentById(incidentId);

    if (!incident) {
        return null;
    }

    const forensic = await getForensicTimeline(incidentId);

    const titles = {
        en: "SECURITY INCIDENT EXECUTIVE & FORENSIC AUDIT REPORT",
        hi: "सुरक्षा घटना कार्यकारी और फोरेंसिक ऑडिट रिपोर्ट",
        gu: "સુરક્ષા ઘટના એક્ઝિક્યુટિવ અને ફોરેન્સિક ઓડિટ રિપોર્ટ"
    };

    const classifications = {
        en: "CONFIDENTIAL — HOSPITAL BOARD & AUDIT ONLY",
        hi: "गोपनीय — केवल अस्पताल बोर्ड और ऑडिट",
        gu: "ગોપનીય — માત્ર હોસ્પિટલ બોર્ડ અને ઓડિટ"
    };

    /*
     * Build forensic timeline
     */
    const timeline = (forensic?.timeline || []).map((event) => ({
        time: event.timestamp
            ? new Date(event.timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            })
            : "",
        event: event.title
            ? `${event.title}${event.description ? ` — ${event.description}` : ""}`
            : event.description || ""
    }));

    /*
     * Extract telemetry information
     * from security events in the forensic timeline.
     */
    const telemetryLogs = (forensic?.timeline || [])
        .filter((event) => event.type === "SECURITY_EVENT")
        .map((event) => ({
            timestamp: event.timestamp
                ? new Date(event.timestamp).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                })
                : "",
            sourceIp: event.sourceIp || "",
            target: event.destinationIp || forensic?.asset?.name || "",
            logEvent: event.description || event.title || "",
            status: event.status || "Detected"
        }));

    /*
     * Generate root cause from actual incident data.
     */
    const rootCause =
        incident.description ||
        `Security incident detected on ${incident.assetName || "affected asset"} involving ${incident.threatType || "suspicious activity"}.`;

    /*
     * Build impact assessment from actual database data.
     */
    const impactAssessment = {
        estimatedFinancialExposure:
            incident.impact?.length > 0
                ? incident.impact.join(". ")
                : "Impact assessment requires further investigation.",

        patientCareDisruption:
            incident.status === "Open"
                ? "Potential operational impact requires investigation."
                : "No active operational disruption recorded.",

        dataExfiltrationRisk:
            incident.threatType === "Data Exfiltration"
                ? "Potential data exposure identified."
                : "No confirmed data exfiltration recorded.",

        downtimePrevented:
            "Not calculated from current telemetry."
    };

    /*
     * Compliance information is kept as a
     * demonstration section for the prototype.
     */
    const complianceAudit = [
        {
            standard: "HIPAA",
            status: "AUDIT REQUIRED",
            detail:
                "Review access control, authentication and protected health information safeguards."
        },
        {
            standard: "DPDP Act 2023",
            status: "AUDIT REQUIRED",
            detail:
                "Review personal data protection and security controls related to the incident."
        },
        {
            standard: "ISO 27001",
            status: "AUDIT REQUIRED",
            detail:
                "Review incident management, monitoring and information security controls."
        }
    ];

    /*
     * Recommendations come from the incident's
     * existing recommended actions.
     */
    const recommendations =
        Array.isArray(incident.recommendedActions) &&
        incident.recommendedActions.length > 0
            ? incident.recommendedActions
            : [
                "Investigate the affected asset.",
                "Review related authentication and security logs.",
                "Monitor connected hospital assets.",
                "Document and close the incident after verification."
            ];

    /*
     * Generate unique report ID.
     */
    const reportId = `REP-${Date.now()}`;

    return {
        reportId,

        title: titles[language] || titles.en,

        classification:
            classifications[language] || classifications.en,

        generatedAt: new Date().toLocaleString(),

        incidentId: String(incident.id),

        incidentTitle: incident.title,

        severity: incident.severity,

        department: incident.department || "",

        affectedAssets: forensic?.asset
            ? [forensic.asset.name]
            : incident.assetName
                ? [incident.assetName]
                : [],

        summary:
            incident.summary ||
            incident.description ||
            "Security incident detected and recorded by MED-VERSE.",

        aiConfidence: Number(
            incident.aiConfidence ||
            incident.confidence ||
            0
        ),

        rootCause,

        impactAssessment,

        complianceAudit,

        telemetryLogs,

        timeline,

        recommendations
    };
};

module.exports = {
    generateIncidentReport
};