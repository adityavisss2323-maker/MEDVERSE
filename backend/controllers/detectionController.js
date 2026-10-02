const { analyzeAsset } = require("../services/detectionService");

// Run detection for an asset
const runDetection = async (req, res) => {
    try {
        const { assetId } = req.params;

        const result = await analyzeAsset(assetId);

        res.status(200).json({
            success: true,
            message: "Detection analysis completed",
            data: {
                asset: result.asset,
                eventsAnalyzed: result.eventsAnalyzed,
                alertsGenerated: result.alertsGenerated
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Detection analysis failed",
            error: error.message
        });
    }
};

module.exports = {
    runDetection
};