const {
    getAttackPath,
    getAllAttackPaths
} = require("../services/attackPathService");


// GET /api/v1/attack-paths
const getAllAttackPathData = async (req, res) => {

    try {

        const data = await getAllAttackPaths();

        res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (error) {

        console.error(
            "Get All Attack Paths Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate attack paths"
        });
    }
};


// GET /api/v1/attack-paths/:incidentId
const getAttackPathData = async (req, res) => {

    try {

        const data = await getAttackPath(
            req.params.incidentId
        );

        if (!data) {

            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.json({
            success: true,
            data
        });

    } catch (error) {

        console.error(
            "Get Attack Path Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to generate attack path"
        });
    }
};


module.exports = {
    getAllAttackPathData,
    getAttackPathData
};