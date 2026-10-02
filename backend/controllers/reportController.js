const {
    generateIncidentReport
} = require("../services/reportService");

// GET /api/v1/reports/:incidentId
const getIncidentReport = async (req, res) => {
    try {
        const { incidentId } = req.params;
        const language = req.query.language || "en";

        const report = await generateIncidentReport(
            incidentId,
            language
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Incident not found"
            });
        }

        res.json({
            success: true,
            data: report
        });

    } catch (error) {
        console.error("Generate Incident Report Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to generate incident report"
        });
    }
};

module.exports = {
    getIncidentReport
};