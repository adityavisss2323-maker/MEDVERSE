// Convert asset criticality into the score
// expected by the frontend
const mapCriticalityToScore = (criticality) => {
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


// Convert one database Asset into
// the frontend-compatible Asset structure
const mapAsset = (asset) => {
    return {
        // Frontend asset ID
        id: asset.name,

        // Basic information
        name: asset.name,
        type: asset.type,
        department: asset.department || "",

        // Network information
        ip: asset.ipAddress || "",
        mac: asset.macAddress || "",

        // Security status
        status: asset.status
            ? asset.status.toLowerCase()
            : "normal",

        risk: asset.riskLevel
            ? asset.riskLevel.toLowerCase()
            : "low",

        criticalityScore:
            mapCriticalityToScore(asset.criticality),

        // Last activity
        lastSeen: asset.lastSeen || null,

        // Asset information
        location: asset.location || "",
        vendor: asset.vendor || "",
        os: asset.os || "",

        // Network relationships
        connections: asset.connections || [],

        // Cyber DNA
        cyberDNADeviation:
            asset.cyberDNADeviation || 0,

        // Alert and incident information
        activeAlertsCount:
            asset.activeAlertsCount || 0,

        incidentsCount:
            asset.incidentsCount || 0,

        // Threat information
        threatGravityImpact:
            asset.threatGravityImpact || [],

        // Simple explanation for frontend
        simpleDescription:
            asset.simpleDescription || ""
    };
};


// Convert multiple assets
const mapAssets = (assets) => {
    return assets.map(mapAsset);
};


// Export mapper functions
module.exports = {
    mapAsset,
    mapAssets
};