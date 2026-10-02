const express = require("express");

const {
    getAllCyberDNAData,
    getCyberDNAData
} = require("../controllers/cyberDnaController");

const router = express.Router();

router.get("/", getAllCyberDNAData);

router.get("/:assetId", getCyberDNAData);

module.exports = router;