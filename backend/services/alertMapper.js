const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-US", {
        hour12: false
    });
};

const mapAlertStatus = (status) => {
    switch (status) {
        case "New":
            return "Active";

        case "Investigating":
            return "Investigating";

        case "Contained":
            return "Active";

        case "Resolved":
            return "Acknowledged";

        case "Closed":
            return "Acknowledged";

        default:
            return status || "Active";
    }
};

const mapAlert = (alert) => {
    const assetName = alert.asset?.name || "";

    const source =
        alert.sourceEvent?.source ||
        "Security Detection Engine";

    const evidence = [
        ...(alert.detectionReason || []),
        alert.sourceEvent?.description || ""
    ]
        .filter(Boolean)
        .join(". ");

    return {
        // MySQL ID
        id: String(alert.id),

        severity: alert.severity,

        title: alert.alertName,

        assetId: assetName,

        assetName: assetName,

        department: alert.asset?.department || "",

        source: source,

        timestamp: formatTime(alert.detectedAt),

        status: mapAlertStatus(alert.status),

        confidence: alert.confidence || 0,

        threatType: alert.alertType,

        evidence: evidence,

        // MySQL source event ID
        correlationId: alert.sourceEvent?.id
            ? String(alert.sourceEvent.id)
            : "",

        simpleExplanation: alert.description || ""
    };
};

const mapAlerts = (alerts) => {
    return alerts.map(mapAlert);
};

module.exports = {
    mapAlert,
    mapAlerts
};