const mongoose = require("mongoose");

const securityEventSchema = new mongoose.Schema(
    {
        eventType: {
            type: String,
            required: true,
            enum: [
                "FAILED_LOGIN",
                "SUCCESSFUL_LOGIN",
                "PORT_SCAN",
                "UNUSUAL_TRAFFIC",
                "MALWARE_ACTIVITY",
                "UNKNOWN_DEVICE",
                "LATERAL_MOVEMENT",
                "FILE_ACTIVITY",
                "OTHER"
            ]
        },

        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true
        },

        source: {
            type: String,
            enum: [
                "Firewall",
                "Network",
                "Active Directory",
                "Database",
                "HIS",
                "EHR",
                "PACS",
                "SNMP",
                "Other"
            ],
            required: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        severity: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
                "Critical"
            ],
            default: "Low"
        },

        sourceIp: {
            type: String,
            trim: true
        },

        destinationIp: {
            type: String,
            trim: true
        },

        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SecurityEvent", securityEventSchema);