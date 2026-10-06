const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/db");

const assetRoutes = require("./routes/assetRoutes");

const securityEventRoutes = require("./routes/securityEventRoutes");

const detectionRoutes = require("./routes/detectionRoutes");

const alertRoutes = require("./routes/alertRoutes");

const incidentRoutes = require("./routes/incidentRoutes");

const digitalTwinRoutes = require("./routes/digitalTwinRoutes");

const threatAnalysisRoutes = require("./routes/threatAnalysisRoutes");

const responseRoutes = require("./routes/responseRoutes");

const riskRoutes = require("./routes/riskRoutes");

const cyberDnaRoutes = require("./routes/cyberDnaRoutes");

const forensicRoutes = require("./routes/forensicRoutes");

const attackPathRoutes = require("./routes/attackPathRoutes");

const whatIfRoutes = require("./routes/whatIfRoutes");

const reportRoutes = require("./routes/reportRoutes");

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MED-VERSE Backend is running"
    });
});

app.use("/api/assets", assetRoutes);
app.use("/api/v1/assets", assetRoutes);

app.use("/api/security-events", securityEventRoutes);
app.use("/api/v1/security-events", securityEventRoutes);

app.use("/api/detection", detectionRoutes);
app.use("/api/v1/detection", detectionRoutes);

app.use("/api/alerts", alertRoutes);
app.use("/api/v1/alerts", alertRoutes);

app.use("/api/incidents", incidentRoutes);
app.use("/api/v1/incidents", incidentRoutes);

app.use("/api/digital-twin", digitalTwinRoutes);
app.use("/api/v1/digital-twin", digitalTwinRoutes);

app.use("/api/threat-analysis", threatAnalysisRoutes);
app.use("/api/v1/threat-analysis", threatAnalysisRoutes);

app.use("/api/response", responseRoutes);
app.use("/api/v1/response", responseRoutes);

app.use("/api/risk", riskRoutes);
app.use("/api/v1/risk", riskRoutes);

app.use("/api/cyber-dna", cyberDnaRoutes);
app.use("/api/v1/cyber-dna", cyberDnaRoutes);

app.use("/api/forensic", forensicRoutes);
app.use("/api/v1/forensic", forensicRoutes);

app.use("/api/attack-paths", attackPathRoutes);
app.use("/api/v1/attack-paths", attackPathRoutes);

app.use("/api/what-if", whatIfRoutes);
app.use("/api/v1/what-if", whatIfRoutes);

app.use("/api/reports", reportRoutes);
app.use("/api/v1/reports", reportRoutes);

console.log("Cyber DNA routes loaded");

// Global 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `API endpoint '${req.originalUrl}' not found.`
    });
});

// Global Centralized Error Handler Middleware
app.use((err, req, res, next) => {
    console.error("Backend Error:", err.stack || err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await testConnection();
    } catch (error) {
        console.warn("⚠️ MySQL Connection Notice:", error.message);
        console.warn("⚠️ Backend is running, but database features require a running MySQL database.");
    }

    app.listen(PORT, () => {
        console.log(`MED-VERSE Backend running on http://localhost:${PORT}`);
    });
};

startServer();