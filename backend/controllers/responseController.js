const {
    getResponseForAsset,
    getAllResponses,
    executeSimulatedAction
} = require("../services/responseService");


// GET /api/v1/response
const getAllResponseData = async (req, res) => {
    try {
        const responses = await getAllResponses();

        res.json({
            success: true,
            count: responses.length,
            data: responses
        });

    } catch (error) {
        console.error(
            "Get All Response Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate response actions"
        });
    }
};


// GET /api/v1/response/:assetId
const getAssetResponse = async (req, res) => {
    try {
        const response = await getResponseForAsset(
            req.params.assetId
        );

        if (!response) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            data: response
        });

    } catch (error) {
        console.error(
            "Get Asset Response Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate response actions"
        });
    }
};


// POST /api/v1/response/:assetId/execute
const executeResponseAction = async (req, res) => {
    try {
        const { action } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "Action is required"
            });
        }

        const result =
            await executeSimulatedAction(
                req.params.assetId,
                action
            );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            message: "Response action simulated successfully",
            data: result
        });

    } catch (error) {
        console.error(
            "Execute Response Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to execute response action"
        });
    }
};


module.exports = {
    getAllResponseData,
    getAssetResponse,
    executeResponseAction
};