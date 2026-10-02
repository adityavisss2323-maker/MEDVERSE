const express = require("express");

const {
    getAllRisks,
    getRisk
} = require("../controllers/riskController");

const router = express.Router();

router.get("/", getAllRisks);

router.get("/:assetId", getRisk);

module.exports = router;