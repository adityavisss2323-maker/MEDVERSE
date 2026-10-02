const express = require("express");

const {
    runDetection
} = require("../controllers/detectionController");

const router = express.Router();

// Run detection for a specific asset
router.post("/asset/:assetId", runDetection);

module.exports = router;