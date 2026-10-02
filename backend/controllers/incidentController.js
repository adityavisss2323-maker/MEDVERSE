const {
    findAllIncidents,
    findIncidentById,
    createNewIncident,
    updateExistingIncident,
    deleteExistingIncident,
    changeIncidentStatus
} = require("../services/incidentService");

const {
    mapIncident,
    mapIncidents
} = require("../services/incidentMapper");


// GET /api/v1/incidents
const getIncidents = async (req, res) => {
    try {
        const incidents = await findAllIncidents();

        res.json({
            success: true,
            count: incidents.length,
            data: mapIncidents(incidents)
        });

    } catch (error) {
        console.error("Get Incidents Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch incidents"
        });
    }
};


// GET /api/v1/incidents/:id
const getIncident = async (req, res) => {
    try {
        const incident = await findIncidentById(req.params.id);

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.json({
            success: true,
            data: mapIncident(incident)
        });

    } catch (error) {
        console.error("Get Incident Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch incident"
        });
    }
};


// POST /api/v1/incidents
const createIncident = async (req, res) => {
    try {
        const incident = await createNewIncident(req.body);

        res.status(201).json({
            success: true,
            message: "Incident created successfully",
            data: mapIncident(incident)
        });

    } catch (error) {
        console.error("Create Incident Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create incident",
            error: error.message
        });
    }
};


// PUT /api/v1/incidents/:id
const updateIncident = async (req, res) => {
    try {
        const incident = await updateExistingIncident(
            req.params.id,
            req.body
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.json({
            success: true,
            message: "Incident updated successfully",
            data: mapIncident(incident)
        });

    } catch (error) {
        console.error("Update Incident Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update incident",
            error: error.message
        });
    }
};


// PATCH /api/v1/incidents/:id/status
const updateIncidentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const incident = await changeIncidentStatus(
            req.params.id,
            status
        );

        if (!incident) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.json({
            success: true,
            message: "Incident status updated successfully",
            data: mapIncident(incident)
        });

    } catch (error) {
        console.error("Update Incident Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update incident status"
        });
    }
};


// DELETE /api/v1/incidents/:id
const deleteIncident = async (req, res) => {
    try {
        const deleted = await deleteExistingIncident(
            req.params.id
        );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.json({
            success: true,
            message: "Incident deleted successfully"
        });

    } catch (error) {
        console.error("Delete Incident Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete incident"
        });
    }
};


module.exports = {
    getIncidents,
    getIncident,
    createIncident,
    updateIncident,
    updateIncidentStatus,
    deleteIncident
};