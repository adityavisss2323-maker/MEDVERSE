const express = require("express");

const {
    getAlerts,
    getAlert,
    createAlert,
    updateAlert,
    updateAlertStatus,
    deleteAlert
} = require("../controllers/alertController");

const router = express.Router();

router.get("/", getAlerts);

router.get("/:id", getAlert);

router.post("/", createAlert);

router.put("/:id", updateAlert);

router.patch("/:id/status", updateAlertStatus);

router.delete("/:id", deleteAlert);

module.exports = router;