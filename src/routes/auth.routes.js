const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/otp/request", authController.requestOtp);
router.post("/otp/verify", authController.verifyOtp);

module.exports = router;
