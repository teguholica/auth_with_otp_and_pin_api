const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/otp/request", authController.requestOtp);
router.post("/otp/verify", authController.verifyOtp);
router.delete("/account", authenticateToken, authController.deleteAccount);

module.exports = router;
