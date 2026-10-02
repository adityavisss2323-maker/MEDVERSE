const mapDigitalTwinAsset = (asset) => {
    return {
        id: asset.name,

        name: asset.name,

        type: asset.type,

        department: asset.department || "",

        ip: asset.ipAddress || "",

        mac: asset.macAddress || "",

        status: asset.status
            ? asset.status.toLowerCase()
            : "normal",

        risk: asset.riskLevel
            ? asset.riskLevel.toLowerCase()
            : "low",

        criticalityScore: asset.criticalityScore || 0,

        lastSeen: asset.lastSeen || null,

        location: asset.location || "",

        vendor: asset.vendor || "",

        os: asset.os || "",

        connections: asset.connections || [],

        cyberDNADeviation: asset.cyberDNADeviation || 0,

        activeAlertsCount:
            Number(asset.activeAlertsCount || 0),

        incidentsCount:
            Number(asset.incidentsCount || 0),

        threatGravityImpact:
            asset.threatGravityImpact || [],

        simpleDescription:
            asset.simpleDescription || ""
    };
};


const mapDigitalTwinAssets = (assets) => {
    return assets.map(mapDigitalTwinAsset);
};


module.exports = {
    mapDigitalTwinAsset,
    mapDigitalTwinAssets
};