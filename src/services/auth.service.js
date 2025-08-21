const bcrypt = require("bcryptjs");
const userRepo = require("../repositories/user.repository");
const otpRepo = require("../repositories/otp.repository");
const { generateOtp } = require("../utils/otp");

class AuthService {
  async signup({ email, password, name }) {
    const hash = await bcrypt.hash(password, 10);
    const now = Date.now();

    const user = await userRepo.create({
      email: email.toLowerCase(),
      name: name || null,
      passwordHash: hash,
      createdAt: now,
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
}

module.exports = new AuthService();
