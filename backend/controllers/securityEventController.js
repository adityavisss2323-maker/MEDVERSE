const {
    findAllSecurityEvents,
    findSecurityEventById,
    createNewSecurityEvent,
    deleteSecurityEvent
} = require("../services/securityEventService");

const getSecurityEvents = async (req, res) => {
    try {
        const events = await findAllSecurityEvents();

        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error("Get Security Events Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch security events"
        });
    }
};

const getSecurityEvent = async (req, res) => {
    try {
        const event = await findSecurityEventById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Security event not found"
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error("Get Security Event Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch security event"
        });
    }
};

const createSecurityEvent = async (req, res) => {
    try {
        const event = await createNewSecurityEvent(req.body);

        res.status(201).json({
            success: true,
            message: "Security event created successfully",
            data: event
        });
    } catch (error) {
        console.error("Create Security Event Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create security event",
            error: error.message
        });
    }
};

const deleteSecurityEventController = async (req, res) => {
    try {
        const deleted = await deleteSecurityEvent(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Security event not found"
            });
        }

        res.json({
            success: true,
            message: "Security event deleted successfully"
        });
    } catch (error) {
        console.error("Delete Security Event Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete security event",
            error: error.message
        });
    }
};

module.exports = {
    getSecurityEvents,
    getSecurityEvent,
    createSecurityEvent,
    deleteSecurityEventController
};