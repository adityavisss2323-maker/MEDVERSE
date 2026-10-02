const express = require("express");

const {
    getIncidents,
    getIncident,
    createIncident,
    updateIncident,
    updateIncidentStatus,
    deleteIncident
} = require("../controllers/incidentController");

const router = express.Router();

router.get("/", getIncidents);

router.get("/:id", getIncident);

router.post("/", createIncident);

router.put("/:id", updateIncident);

router.patch("/:id/status", updateIncidentStatus);

router.delete("/:id", deleteIncident);

module.exports = router;