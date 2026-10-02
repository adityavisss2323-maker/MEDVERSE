const express = require("express");

const {
    getAllResponseData,
    getAssetResponse,
    executeResponseAction
} = require("../controllers/responseController");

const router = express.Router();


// Get response actions for all assets
router.get("/", getAllResponseData);


// Get response actions for one asset
router.get("/:assetId", getAssetResponse);


// Execute a simulated response action
router.post(
    "/:assetId/execute",
    executeResponseAction
);


module.exports = router;