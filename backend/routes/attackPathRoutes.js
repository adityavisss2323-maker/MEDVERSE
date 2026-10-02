const express = require("express");

const {
    getAllAttackPathData,
    getAttackPathData
} = require("../controllers/attackPathController");

const router = express.Router();


// GET all attack paths
router.get("/", getAllAttackPathData);


// GET attack path for one incident
router.get("/:incidentId", getAttackPathData);


module.exports = router;