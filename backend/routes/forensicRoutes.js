const express = require("express");

const {
    getAllForensicData,
    getForensicData
} = require("../controllers/forensicController");

const router = express.Router();


// Get all forensic timelines
router.get("/", getAllForensicData);


// Get forensic timeline for one incident
router.get("/:incidentId", getForensicData);


module.exports = router;