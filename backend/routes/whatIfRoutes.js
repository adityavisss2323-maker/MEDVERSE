const express = require("express");

const {
    simulateWhatIf
} = require("../controllers/whatIfController");

const router = express.Router();

router.post("/simulate", simulateWhatIf);

module.exports = router;