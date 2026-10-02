const {
    getCyberDNA,
    getAllCyberDNA
} = require("../services/cyberDnaService");


// GET /api/v1/cyber-dna
const getAllCyberDNAData = async (req, res) => {
    try {
        const data = await getAllCyberDNA();

        res.json({
            success: true,
            count: data.length,
            data
        });

    } catch (error) {
        console.error("Get All Cyber DNA Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate Cyber DNA"
        });
    }
};


// GET /api/v1/cyber-dna/:assetId
const getCyberDNAData = async (req, res) => {
    try {
        const data = await getCyberDNA(
            req.params.assetId
        );

        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });
        }

        res.json({
            success: true,
            data
        });

    } catch (error) {
        console.error("Get Cyber DNA Error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to calculate Cyber DNA"
        });
    }
};


module.exports = {
    getAllCyberDNAData,
    getCyberDNAData
};