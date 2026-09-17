const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            required: true,
            enum: [
                "Doctor PC",
                "Nurse Station",
                "MRI",
                "CT",
                "X-Ray",
                "Patient Monitor",
                "Ventilator",
                "IoMT Device",
                "HIS Server",
                "EHR Server",
                "PACS Server",
                "LIS Server",
                "Database Server",
                "Firewall",
                "Router",
                "Core Switch",
                "Other"
            ]
        },

        ipAddress: {
            type: String,
            trim: true
        },

        department: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "Normal",
                "Suspicious",
                "Compromised",
                "Quarantined",
                "Offline"
            ],
            default: "Normal"
        },

        riskLevel: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
                "Critical"
            ],
            default: "Low"
        },

        criticality: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
                "Critical"
            ],
            default: "Medium"
        },

        lastSeen: {
            type: Date,
            default: Date.now
        }
    },

    {
        timestamps: true
    }
);

module.exports = mongoose.model("Asset", assetSchema);