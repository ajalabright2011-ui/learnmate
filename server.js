const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Allow LearnMate to receive JSON data
app.use(express.json());

// Serve the frontend files
app.use(express.static(__dirname));

// Basic API test
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        message: "LearnMate backend is running!",
        app: "LearnMate",
        version: "1.0"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`LearnMate is running at http://localhost:${PORT}`);
});