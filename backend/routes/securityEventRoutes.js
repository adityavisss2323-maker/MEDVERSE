const express = require("express");

const {
    getSecurityEvents,
    getSecurityEvent,
    createSecurityEvent,
    deleteSecurityEventController
} = require("../controllers/securityEventController");

const router = express.Router();

// Get all security events
router.get("/", getSecurityEvents);

// Get single security event
router.get("/:id", getSecurityEvent);

// Create security event
router.post("/", createSecurityEvent);

// Delete security event
router.delete("/:id", deleteSecurityEventController);

module.exports = router;