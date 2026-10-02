const {
    getAssetRisk,
    getAllAssetRisks
} = require("../services/riskService");


// GET /api/v1/risk
const getAllRisks = async (req, res) => {
    try {
        const risks = await getAllAssetRisks();

        res.json({
            success: true,
            count: risks.length,
            data: risks
        });

    } catch (error) {
        console.error("Get All Risks Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate asset risks"
        });
    }
};


// GET /api/v1/risk/:assetId
const getRisk = async (req, res) => {
    try {
        const risk = await getAssetRisk(req.params.assetId);

        if (!risk) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            data: risk
        });

    } catch (error) {
        console.error("Get Asset Risk Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate asset risk"
        });
    }
};


module.exports = {
    getAllRisks,
    getRisk
};