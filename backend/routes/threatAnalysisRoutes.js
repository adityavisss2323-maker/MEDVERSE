const express = require("express");

const {
    getAllThreatAnalysis,
    getAssetThreatAnalysis
} = require("../controllers/threatAnalysisController");

const router = express.Router();

router.get("/", getAllThreatAnalysis);

router.get("/:assetId", getAssetThreatAnalysis);

module.exports = router;