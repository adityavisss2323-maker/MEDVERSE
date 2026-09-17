const express = require("express");

const {
    getSecurityEvents,
    getSecurityEventById,
    createSecurityEvent,
    deleteSecurityEvent
} = require("../controllers/securityEventController");

const router = express.Router();

// GET all security events
router.get("/", getSecurityEvents);

// GET single security event
router.get("/:id", getSecurityEventById);

// CREATE security event
router.post("/", createSecurityEvent);

// DELETE security event
router.delete("/:id", deleteSecurityEvent);

module.exports = router;