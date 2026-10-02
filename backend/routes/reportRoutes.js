const express = require("express");

const {
    getIncidentReport
} = require("../controllers/reportController");

const router = express.Router();

// Get generated report for one incident
router.get("/:incidentId", getIncidentReport);

module.exports = router;