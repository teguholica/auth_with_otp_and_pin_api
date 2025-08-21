const express = require("express");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());
app.use("/auth", authRoutes);

app.use("/health", (req, res) => res.json({ ok: true }));
app.use(errorHandler); // global error handler

module.exports = app;
