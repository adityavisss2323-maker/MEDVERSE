const {
    calculateSimulation
} = require("../services/whatIfService");


// POST /api/v1/what-if/simulate
const simulateWhatIf = async (req, res) => {
    try {

        const {
            assetId,
            scenario,
            attackSpeed,
            containmentDelay,
            segmentationMode
        } = req.body;


        // Basic validation
        if (
            assetId === undefined ||
            !scenario ||
            !attackSpeed ||
            !containmentDelay ||
            !segmentationMode
        ) {
            return res.status(400).json({
                success: false,
                message: "assetId, scenario, attackSpeed, containmentDelay and segmentationMode are required"
            });
        }


        const result = await calculateSimulation({
            assetId,
            scenario,
            attackSpeed,
            containmentDelay,
            segmentationMode
        });


        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Target asset not found"
            });
        }


        return res.json({
            success: true,
            data: result
        });

    } catch (error) {

        console.error(
            "What-If Simulation Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to run What-If simulation"
        });
    }
};


module.exports = {
    simulateWhatIf
};