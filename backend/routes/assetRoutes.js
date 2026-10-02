const express = require("express");

const {
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    updateAssetStatus
} = require("../controllers/assetController");

const router = express.Router();

// Get all assets
router.get("/", getAssets);

// Get single asset
router.get("/:id", getAsset);

// Create asset
router.post("/", createAsset);

// Update asset
router.put("/:id", updateAsset);

// Update asset status
router.patch("/:id/status", updateAssetStatus);

// Delete asset
router.delete("/:id", deleteAsset);

module.exports = router;