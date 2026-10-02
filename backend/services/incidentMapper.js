const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
};


const mapIncident = (incident) => {
    const assetName = incident.asset?.name || "";

    const confidence = Number(incident.confidence || 0);

    const recommendedActions = Array.isArray(
        incident.recommendedActions
    )
        ? incident.recommendedActions
        : [];

    return {
        // Basic information
        id: String(incident.id),
        title: incident.title || "",
        severity: incident.severity || "Low",
        status: incident.status || "Open",

        // Existing frontend asset fields
        assetId: assetName,
        assetName: assetName,
        department: incident.asset?.department || "",

        // Incident information
        threatType: incident.threatType || "",
        description: incident.description || "",

        // Frontend expects detectionTime
        detectionTime: formatTime(incident.createdAt),

        // Frontend expects aiConfidence
        aiConfidence: confidence,

        // Frontend expects summary
        summary: incident.description || "",

        // Frontend expects simpleSummary
        simpleSummary: incident.description || "",

        // Frontend expects a single recommended action
        recommendedAction:
            recommendedActions.length > 0
                ? recommendedActions.join(". ")
                : "",

        // Existing backend/frontend fields
        timestamp: formatTime(incident.createdAt),

        confidence: confidence,

        alertCount: Array.isArray(incident.alerts)
            ? incident.alerts.length
            : 0,

        alerts: incident.alerts || [],

        impact: incident.impact || [],

        recommendedActions: recommendedActions
    };
};


const mapIncidents = (incidents) => {
    return incidents.map(mapIncident);
};


module.exports = {
    mapIncident,
    mapIncidents
};