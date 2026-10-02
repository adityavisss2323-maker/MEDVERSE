const {
    findAllAlerts,
    findAlertById,
    createNewAlert,
    updateExistingAlert,
    deleteExistingAlert,
    changeAlertStatus
} = require("../services/alertService");

const { mapAlert, mapAlerts } = require("../services/alertMapper");


// GET /api/alerts
const getAlerts = async (req, res) => {
    try {
        const alerts = await findAllAlerts();

        res.json({
            success: true,
            count: alerts.length,
            data: mapAlerts(alerts)
        });
    } catch (error) {
        console.error("Get Alerts Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch alerts"
        });
    }
};


// GET /api/alerts/:id
const getAlert = async (req, res) => {
    try {
        const alert = await findAlertById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        res.json({
            success: true,
            data: mapAlert(alert)
        });
    } catch (error) {
        console.error("Get Alert Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch alert"
        });
    }
};


// POST /api/alerts
const createAlert = async (req, res) => {
    try {
        const alert = await createNewAlert(req.body);

        res.status(201).json({
            success: true,
            message: "Alert created successfully",
            data: mapAlert(alert)
        });
    } catch (error) {
        console.error("Create Alert Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create alert",
            error: error.message
        });
    }
};


// PUT /api/alerts/:id
const updateAlert = async (req, res) => {
    try {
        const alert = await updateExistingAlert(
            req.params.id,
            req.body
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        res.json({
            success: true,
            message: "Alert updated successfully",
            data: mapAlert(alert)
        });
    } catch (error) {
        console.error("Update Alert Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update alert",
            error: error.message
        });
    }
};


// PATCH /api/alerts/:id/status
const updateAlertStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const alert = await changeAlertStatus(
            req.params.id,
            status
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        res.json({
            success: true,
            message: "Alert status updated successfully",
            data: mapAlert(alert)
        });
    } catch (error) {
        console.error("Update Alert Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update alert status",
            error: error.message
        });
    }
};


// DELETE /api/alerts/:id
const deleteAlert = async (req, res) => {
    try {
        const deleted = await deleteExistingAlert(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        res.json({
            success: true,
            message: "Alert deleted successfully"
        });
    } catch (error) {
        console.error("Delete Alert Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete alert",
            error: error.message
        });
    }
};


module.exports = {
    getAlerts,
    getAlert,
    createAlert,
    updateAlert,
    updateAlertStatus,
    deleteAlert
};