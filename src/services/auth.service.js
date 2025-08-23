const bcrypt = require("bcryptjs");
const userRepo = require("../repositories/user.repository");
const otpRepo = require("../repositories/otp.repository");
const { generateOtp } = require("../utils/otp");
const { generateToken } = require("../utils/jwt");

class AuthService {
  async signup({ email, password, name }) {
    const hash = await bcrypt.hash(password, 10);
    const now = Date.now();

    const user = await userRepo.create({
      email: email.toLowerCase(),
      name: name || null,
      passwordHash: hash,
      verifiedAt: null,
      status: "PENDING_VERIFICATION",
    });

    const code = generateOtp();
    const ttlMs = 5 * 60 * 1000; // 5 minutes
    await otpRepo.upsert(user.email, {
      code,
      expiresAt: now + ttlMs,
      attempts: 0,
    });

    return {
      message: "SIGNUP_OK",
      email: user.email,
      status: user.status,
      otp: process.env.NODE_ENV !== "production" ? code : undefined,
    };
  }

  async requestOtp(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("USER_NOT_FOUND");

    const code = generateOtp();
    const now = Date.now();
    const ttlMs = 5 * 60 * 1000;

    await otpRepo.upsert(user.email, {
      code,
      expiresAt: now + ttlMs,
      attempts: 0,
    });

    return {
      message: "OTP_SENT",
      email: user.email,
      otp: process.env.NODE_ENV !== "production" ? code : undefined,
    };
  }

  async verifyOtp(email, code) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("USER_NOT_FOUND");

    const rec = await otpRepo.get(email);
    if (!rec) throw new Error("OTP_NOT_FOUND");

    const now = Date.now();
    if (rec.expiresAt < now) {
      await otpRepo.delete(email);
      throw new Error("OTP_EXPIRED");
    }

    if (rec.attempts >= 5) {
      await otpRepo.delete(email);
      throw new Error("OTP_TOO_MANY_ATTEMPTS");
    }

    rec.attempts += 1;
    if (rec.code !== code) {
      await otpRepo.upsert(email, rec);
      throw new Error("OTP_INVALID");
    }

    // Success
    await otpRepo.delete(email);
    await userRepo.update(email, {
      verifiedAt: now,
      status: "VERIFIED",
    });

    return { message: "VERIFIED", email: user.email, verifiedAt: now };
  }

  async login({ email, password }) {
    // Find user by email
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    // Check if user is verified
    if (user.status !== "VERIFIED") {
      throw new Error("USER_NOT_VERIFIED");
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      message: "LOGIN_SUCCESS",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}

module.exports = new AuthService();
