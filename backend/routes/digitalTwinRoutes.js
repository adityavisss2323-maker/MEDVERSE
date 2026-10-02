const express = require("express");

const {
    getDigitalTwinData,
    getDigitalTwinAssetData
} = require("../controllers/digitalTwinController");

const router = express.Router();

router.get("/", getDigitalTwinData);

router.get("/:id", getDigitalTwinAssetData);

module.exports = router;