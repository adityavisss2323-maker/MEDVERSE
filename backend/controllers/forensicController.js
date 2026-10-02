const {
    getForensicTimeline,
    getAllForensicTimelines
} = require("../services/forensicService");


// GET /api/v1/forensic
const getAllForensicData = async (req, res) => {
    try {
        const timelines = await getAllForensicTimelines();

        res.json({
            success: true,
            count: timelines.length,
            data: timelines
        });

    } catch (error) {
        console.error(
            "Get All Forensic Timelines Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch forensic timelines"
        });
    }
};


// GET /api/v1/forensic/:incidentId
const getForensicData = async (req, res) => {
    try {
        const timeline = await getForensicTimeline(
            req.params.incidentId
        );

        if (!timeline) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.json({
            success: true,
            data: timeline
        });

    } catch (error) {
        console.error(
            "Get Forensic Timeline Error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch forensic timeline"
        });
    }
};


module.exports = {
    getAllForensicData,
    getForensicData
};