const {
    findAllAssets,
    findAssetById,
    createNewAsset,
    updateExistingAsset,
    deleteExistingAsset,
    changeAssetStatus
} = require("../services/assetService");

const { mapAsset, mapAssets } = require("../services/assetMapper");

const getAssets = async (req, res) => {
    try {
        const assets = await findAllAssets();

        res.json({
            success: true,
            count: assets.length,
            data: mapAssets(assets)
        });
    } catch (error) {
        console.error("Get Assets Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch assets"
        });
    }
};

const getAsset = async (req, res) => {
    try {
        const asset = await findAssetById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            data: mapAsset(asset)
        });
    } catch (error) {
        console.error("Get Asset Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch asset"
        });
    }
};

const createAsset = async (req, res) => {
    try {
        const asset = await createNewAsset(req.body);

        res.status(201).json({
            success: true,
            message: "Asset created successfully",
            data: mapAsset(asset)
        });
    } catch (error) {
        console.error("Create Asset Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create asset",
            error: error.message
        });
    }
};

const updateAsset = async (req, res) => {
    try {
        const asset = await updateExistingAsset(
            req.params.id,
            req.body
        );

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            message: "Asset updated successfully",
            data: mapAsset(asset)
        });
    } catch (error) {
        console.error("Update Asset Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update asset",
            error: error.message
        });
    }
};

const deleteAsset = async (req, res) => {
    try {
        const deleted = await deleteExistingAsset(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            message: "Asset deleted successfully"
        });
    } catch (error) {
        console.error("Delete Asset Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete asset",
            error: error.message
        });
    }
};

const updateAssetStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const asset = await changeAssetStatus(
            req.params.id,
            status
        );

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            message: "Asset status updated successfully",
            data: mapAsset(asset)
        });
    } catch (error) {
        console.error("Update Asset Status Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update asset status",
            error: error.message
        });
    }
};

module.exports = {
    getAssets,
    getAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    updateAssetStatus
};