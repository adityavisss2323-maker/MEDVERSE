const Asset = require("../models/Asset");

// GET all assets
const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: assets.length,
            data: assets
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch assets",
            error: error.message
        });
    }
};


// GET single asset
const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.status(200).json({
            success: true,
            data: asset
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch asset",
            error: error.message
        });
    }
};


// CREATE asset
const createAsset = async (req, res) => {
    try {
        const asset = await Asset.create(req.body);

        res.status(201).json({
            success: true,
            message: "Asset created successfully",
            data: asset
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to create asset",
            error: error.message
        });
    }
};


// UPDATE asset
const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Asset updated successfully",
            data: asset
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update asset",
            error: error.message
        });
    }
};


// DELETE asset
const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findByIdAndDelete(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Asset deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete asset",
            error: error.message
        });
    }
};


// UPDATE asset status
const updateAssetStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const asset = await Asset.findByIdAndUpdate(
            req.params.id,
            {
                status,
                lastSeen: new Date()
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Asset status updated successfully",
            data: asset
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to update asset status",
            error: error.message
        });
    }
};


module.exports = {
    getAssets,
    getAssetById,
    createAsset,
    updateAsset,
    deleteAsset,
    updateAssetStatus
};