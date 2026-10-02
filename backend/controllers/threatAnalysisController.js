const {
    getThreatAnalysis,
    getAllThreatAnalyses
} = require("../services/threatAnalysisService");


// GET /api/v1/threat-analysis
const getAllThreatAnalysis = async (req, res) => {
    try {
        const analyses = await getAllThreatAnalyses();

        res.json({
            success: true,
            count: analyses.length,
            data: analyses
        });

    } catch (error) {
        console.error(
            "Get All Threat Analysis Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to perform threat analysis"
        });
    }
};


// GET /api/v1/threat-analysis/:assetId
const getAssetThreatAnalysis = async (req, res) => {
    try {
        const analysis = await getThreatAnalysis(
            req.params.assetId
        );

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            data: analysis
        });

    } catch (error) {
        console.error(
            "Get Threat Analysis Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to perform threat analysis"
        });
    }
};


module.exports = {
    getAllThreatAnalysis,
    getAssetThreatAnalysis
};