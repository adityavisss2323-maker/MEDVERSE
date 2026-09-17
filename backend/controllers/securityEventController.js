const SecurityEvent = require("../models/SecurityEvent");

// GET all security events
const getSecurityEvents = async (req, res) => {
    try {
        const events = await SecurityEvent.find()
            .populate("asset", "name type ipAddress status riskLevel")
            .sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch security events",
            error: error.message
        });
    }
};


// GET single security event
const getSecurityEventById = async (req, res) => {
    try {
        const event = await SecurityEvent.findById(req.params.id)
            .populate("asset", "name type ipAddress status riskLevel");

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Security event not found"
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch security event",
            error: error.message
        });
    }
};


// CREATE security event
const createSecurityEvent = async (req, res) => {
    try {
        const event = await SecurityEvent.create(req.body);

        const populatedEvent = await SecurityEvent.findById(event._id)
            .populate("asset", "name type ipAddress status riskLevel");

        res.status(201).json({
            success: true,
            message: "Security event created successfully",
            data: populatedEvent
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create security event",
            error: error.message
        });
    }
};


// DELETE security event
const deleteSecurityEvent = async (req, res) => {
    try {
        const event = await SecurityEvent.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Security event not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Security event deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete security event",
            error: error.message
        });
    }
};


module.exports = {
    getSecurityEvents,
    getSecurityEventById,
    createSecurityEvent,
    deleteSecurityEvent
};