const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const assetRoutes = require("./routes/assetRoutes");

const app = express();

// Connect to MongoDB
connectDB();

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

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`MED-VERSE Backend running on http://localhost:${PORT}`);
});