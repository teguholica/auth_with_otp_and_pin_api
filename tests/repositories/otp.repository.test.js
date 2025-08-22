const otpRepo = require("../../src/repositories/otp.repository");

describe("OtpRepository", () => {
  const testEmail = "test@example.com";
  const testOtpRecord = {
    code: "123456",
    expiresAt: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now (Unix timestamp)
    attempts: 0
  };

  beforeEach(async () => {
    // Clean up before each test
    await otpRepo.delete(testEmail);
  });

  afterAll(async () => {
    // Clean up after all tests
    await otpRepo.delete(testEmail);
  });

  describe("upsert", () => {
    it("should create new OTP record", async () => {
      const result = await otpRepo.upsert(testEmail, testOtpRecord);
      
      expect(result).toEqual({
        email: testEmail.toLowerCase(),
        code: testOtpRecord.code,
        expiresAt: testOtpRecord.expiresAt,
        attempts: testOtpRecord.attempts
      });
    });

    it("should update existing OTP record", async () => {
      // First insert
      await otpRepo.upsert(testEmail, testOtpRecord);
      
      // Update with new values
      const updatedRecord = {
        code: "654321",
        expiresAt: Math.floor(Date.now() / 1000) + 600, // 10 minutes from now (Unix timestamp)
        attempts: 1
      };
      
      const result = await otpRepo.upsert(testEmail, updatedRecord);
      
      expect(result).toEqual({
        email: testEmail.toLowerCase(),
        code: updatedRecord.code,
        expiresAt: updatedRecord.expiresAt,
        attempts: updatedRecord.attempts
      });
    });

    it("should handle default attempts value", async () => {
      const recordWithoutAttempts = {
        code: "123456",
        expiresAt: Math.floor(Date.now() / 1000) + 300 // Unix timestamp
      };
      
      const result = await otpRepo.upsert(testEmail, recordWithoutAttempts);
      
      expect(result.attempts).toBe(0);
    });

    it("should convert email to lowercase", async () => {
      const mixedCaseEmail = "Test@Example.COM";
      
      const result = await otpRepo.upsert(mixedCaseEmail, testOtpRecord);
      
      expect(result.email).toBe("test@example.com");
    });
  });

  describe("get", () => {
    it("should return OTP record when exists", async () => {
      // First create a record
      await otpRepo.upsert(testEmail, testOtpRecord);
      
      const result = await otpRepo.get(testEmail);
      
      expect(result).toEqual({
        email: testEmail.toLowerCase(),
        code: testOtpRecord.code,
        expiresAt: testOtpRecord.expiresAt,
        attempts: testOtpRecord.attempts
      });
    });

    it("should return null when OTP record does not exist", async () => {
      const result = await otpRepo.get("nonexistent@example.com");
      
      expect(result).toBeNull();
    });

    it("should convert email to lowercase", async () => {
      // First create a record with lowercase email
      await otpRepo.upsert(testEmail, testOtpRecord);
      
      // Try to get with mixed case
      const mixedCaseEmail = "Test@Example.COM";
      const result = await otpRepo.get(mixedCaseEmail);
      
      expect(result).not.toBeNull();
      expect(result.email).toBe("test@example.com");
    });
  });

  describe("delete", () => {
    it("should delete existing OTP record", async () => {
      // First create a record
      await otpRepo.upsert(testEmail, testOtpRecord);
      
      // Verify it exists
      let result = await otpRepo.get(testEmail);
      expect(result).not.toBeNull();
      
      // Delete it
      await otpRepo.delete(testEmail);
      
      // Verify it's gone
      result = await otpRepo.get(testEmail);
      expect(result).toBeNull();
    });

    it("should delete non-existing OTP without error", async () => {
      await expect(otpRepo.delete("nouser@example.com")).resolves.not.toThrow();
    });

    it("should convert email to lowercase", async () => {
      // First create a record
      await otpRepo.upsert(testEmail, testOtpRecord);
      
      // Delete with mixed case
      const mixedCaseEmail = "Test@Example.COM";
      await otpRepo.delete(mixedCaseEmail);
      
      // Verify it's gone
      const result = await otpRepo.get(testEmail);
      expect(result).toBeNull();
    });
  });

  describe("mapDbToOtp", () => {
    it("should map database row to OTP object correctly", () => {
      const dbRow = {
        email: "test@example.com",
        code: "123456",
        expires_at: 1735689600, // Unix timestamp for 2025-01-01 00:00:00 UTC
        attempts: 2
      };
      
      const result = otpRepo.mapDbToOtp(dbRow);
      
      expect(result).toEqual({
        email: "test@example.com",
        code: "123456",
        expiresAt: 1735689600,
        attempts: 2
      });
    });

    it("should return null when dbRow is null", () => {
      const result = otpRepo.mapDbToOtp(null);
      
      expect(result).toBeNull();
    });

    it("should return null when dbRow is undefined", () => {
      const result = otpRepo.mapDbToOtp(undefined);
      
      expect(result).toBeNull();
    });
  });
});
