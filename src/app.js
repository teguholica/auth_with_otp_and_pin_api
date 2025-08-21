const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.use("/health", async (req, res) => {
  try {
    const pool = require("./config/database");
    await pool.query("SELECT 1");
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      database: "connected"
    });
  } catch (error) {
    res.status(503).json({ 
      ok: false, 
      timestamp: new Date().toISOString(),
      database: "disconnected",
      error: error.message
    });
  }
});
app.use(errorHandler); // global error handler

module.exports = app;
