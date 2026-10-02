const {
    getDigitalTwin,
    getDigitalTwinAsset
} = require("../services/digitalTwinService");

const {
    mapDigitalTwinAsset,
    mapDigitalTwinAssets
} = require("../services/digitalTwinMapper");


// GET /api/v1/digital-twin
const getDigitalTwinData = async (req, res) => {
    try {
        const assets = await getDigitalTwin();

        res.json({
            success: true,
            count: assets.length,
            data: mapDigitalTwinAssets(assets)
        });

    } catch (error) {
        console.error("Get Digital Twin Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch digital twin data"
        });
    }
};


// GET /api/v1/digital-twin/:id
const getDigitalTwinAssetData = async (req, res) => {
    try {
        const asset = await getDigitalTwinAsset(req.params.id);

        if (!asset) {
            return res.status(404).json({
                success: false,
                message: "Digital twin asset not found"
            });
        }

        res.json({
            success: true,
            data: mapDigitalTwinAsset(asset)
        });

    } catch (error) {
        console.error("Get Digital Twin Asset Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch digital twin asset"
        });
    }
};


module.exports = {
    getDigitalTwinData,
    getDigitalTwinAssetData
};