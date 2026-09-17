const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
    {
        alertName: {
            type: String,
            required: true,
            trim: true
        },

        alertType: {
            type: String,
            required: true,
            enum: [
                "Suspicious Authentication",
                "Ransomware",
                "Network Reconnaissance",
                "Unauthorized Device",
                "Lateral Movement",
                "Malware Activity",
                "Other"
            ]
        },

        asset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Asset",
            required: true
        },

        severity: {
            type: String,
            enum: [
                "Low",
                "Medium",
                "High",
                "Critical"
            ],
            required: true
        },

        status: {
            type: String,
            enum: [
                "New",
                "Investigating",
                "Contained",
                "Resolved",
                "Closed"
            ],
            default: "New"
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        sourceEvent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SecurityEvent"
        },

        confidence: {
            type: Number,
            min: 0,
            max: 100
        },

        detectionReason: {
            type: [String],
            default: []
        },

        potentialImpact: {
            type: [String],
            default: []
        },

        recommendedActions: {
            type: [String],
            default: []
        },

        detectedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

alertSchema.index({ severity: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ detectedAt: -1 });

module.exports = mongoose.model("Alert", alertSchema);