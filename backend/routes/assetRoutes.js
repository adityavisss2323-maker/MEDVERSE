const express = require("express");

const {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    updateAssetStatus
} = require("../controllers/assetController");

const router = express.Router();

router.get("/", getAssets);

router.get("/:id", getAssetById);

router.post("/", createAsset);

router.put("/:id", updateAsset);

router.delete("/:id", deleteAsset);

router.patch("/:id/status", updateAssetStatus);

module.exports = router;