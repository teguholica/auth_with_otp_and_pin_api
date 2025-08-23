const authService = require("../../src/services/auth.service");
const userRepo = require("../../src/repositories/user.repository");
const otpRepo = require("../../src/repositories/otp.repository");
const pool = require("../../src/config/database");
const bcrypt = require("bcryptjs");

describe("AuthService", () => {
    const email = "service@example.com";
    const password = "abc123";

    // Clean up between tests
    afterEach(async () => {
        // Clear test data but keep structure
        try {
            await pool.query('DELETE FROM otps');
            await pool.query('DELETE FROM users');
        } catch (error) {
            console.error('Test cleanup failed:', error);
        }
    });

    it("should signup user and return otp", async () => {
        const result = await authService.signup({ email, password });
        expect(result.email).toBe(email);
        expect(result.status).toBe("PENDING_VERIFICATION");
        expect(result.otp).toHaveLength(6);
    });

    it("should verify OTP correctly", async () => {
        const { otp } = await authService.signup({ email, password });
        const result = await authService.verifyOtp(email, otp);
        expect(result.message).toBe("VERIFIED");
        expect(result.email).toBe(email);
    });

    it("should fail on wrong OTP", async () => {
        await authService.signup({ email, password });
        await expect(authService.verifyOtp(email, "000000"))
            .rejects.toThrow("OTP_INVALID");
    });

    it("should throw OTP_EXPIRED", async () => {
        const { email } = await authService.signup({ email: "exp@example.com", password: "123456" });
        
        // Manually update the OTP to be expired using repository
        const expiredOtp = {
            code: "123456",
            expiresAt: Date.now() - 1000,
            attempts: 0
        };
        await otpRepo.upsert(email, expiredOtp);
        
        await expect(authService.verifyOtp(email, "123456")).rejects.toThrow("OTP_EXPIRED");
    });

    it("should throw OTP_TOO_MANY_ATTEMPTS", async () => {
        const { email, otp } = await authService.signup({ email: "lock@example.com", password: "123456" });
        
        // Manually update the OTP to have max attempts using repository
        const lockedOtp = {
            code: otp,
            expiresAt: Date.now() + 60000,
            attempts: 5
        };
        await otpRepo.upsert(email, lockedOtp);
        
        await expect(authService.verifyOtp(email, otp)).rejects.toThrow("OTP_TOO_MANY_ATTEMPTS");
    });

    it("should throw OTP_NOT_FOUND if no OTP requested", async () => {
        const { email } = await authService.signup({ email: "nootp@example.com", password: "123456" });
        
        // Manually delete the OTP using repository
        await otpRepo.delete(email);
        
        await expect(authService.verifyOtp(email, "123456")).rejects.toThrow("OTP_NOT_FOUND");
    });

    it("should signup without name parameter", async () => {
        const result = await authService.signup({ email: "noname@example.com", password: "abc123" });
        expect(result.email).toBe("noname@example.com");
        expect(result.status).toBe("PENDING_VERIFICATION");

        // Verify user was created with null name
        const user = await userRepo.findByEmail("noname@example.com");
        expect(user.name).toBeNull();
    });

    it("should not return otp in production environment", async () => {
        // Set NODE_ENV to production
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";

        try {
            const result = await authService.signup({ email: "prod@example.com", password: "abc123" });
            expect(result.email).toBe("prod@example.com");
            expect(result.otp).toBeUndefined(); // Should not return OTP in production
        } finally {
            // Restore original NODE_ENV
            process.env.NODE_ENV = originalEnv;
        }
    });

    it("should return otp in non-production environment", async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";

        try {
            const result = await authService.signup({ email: "dev@example.com", password: "abc123" });
            expect(result.otp).toBeDefined();
            expect(result.otp).toHaveLength(6);
        } finally {
            process.env.NODE_ENV = originalEnv;
        }
    });

    it("should return otp in requestOtp for non-production environment", async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";

        try {
            await authService.signup({ email: "dev2@example.com", password: "abc123" });
            const result = await authService.requestOtp("dev2@example.com");
            expect(result.otp).toBeDefined();
            expect(result.otp).toHaveLength(6);
        } finally {
            process.env.NODE_ENV = originalEnv;
        }
    });

    it("should not return otp in requestOtp for production environment", async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";

        try {
            await authService.signup({ email: "prod2@example.com", password: "abc123" });
            const result = await authService.requestOtp("prod2@example.com");
            expect(result.otp).toBeUndefined(); // Should not return OTP in production
            expect(result.message).toBe("OTP_SENT");
        } finally {
            process.env.NODE_ENV = originalEnv;
        }
    });

    it("should throw USER_NOT_FOUND in requestOtp for non-existent user", async () => {
        await expect(authService.requestOtp("nonexistent@example.com"))
            .rejects.toThrow("USER_NOT_FOUND");
    });

    it("should throw USER_NOT_FOUND in verifyOtp for non-existent user", async () => {
        await expect(authService.verifyOtp("nonexistent@example.com", "123456"))
            .rejects.toThrow("USER_NOT_FOUND");
    });

    it("should handle duplicate email signup", async () => {
        await authService.signup({ email, password });
        await expect(authService.signup({ email, password }))
            .rejects.toThrow("USER_ALREADY_EXISTS");
    });

    it("should handle unexpected errors during user update", async () => {
        // First signup a user
        const { otp } = await authService.signup({ email: "error@example.com", password: "abc123" });
        
        // Mock userRepo.update to throw an unexpected error
        const originalUpdate = userRepo.update;
        userRepo.update = jest.fn().mockRejectedValue(new Error("Unexpected database error"));
        
        await expect(authService.verifyOtp("error@example.com", otp))
            .rejects.toThrow("Unexpected database error");
        
        // Restore original function
        userRepo.update = originalUpdate;
    });

    it("should handle bcrypt compare errors", async () => {
        // First signup a user
        await authService.signup({ email: "bcrypt@example.com", password: "abc123" });
        
        // Verify the user
        const { otp } = await authService.signup({ email: "bcrypt2@example.com", password: "abc123" });
        await authService.verifyOtp("bcrypt2@example.com", otp);
        
        // Mock bcrypt.compare to throw an error
        const originalCompare = bcrypt.compare;
        bcrypt.compare = jest.fn().mockImplementation(() => {
            throw new Error("Bcrypt error");
        });
        
        await expect(authService.login({ email: "bcrypt2@example.com", password: "abc123" }))
            .rejects.toThrow("Bcrypt error");
        
        // Restore original function
        bcrypt.compare = originalCompare;
    });

    it("should handle bcrypt compare returning false", async () => {
        // First signup a user
        await authService.signup({ email: "bcrypt3@example.com", password: "abc123" });
        
        // Verify the user
        const { otp } = await authService.signup({ email: "bcrypt4@example.com", password: "abc123" });
        await authService.verifyOtp("bcrypt4@example.com", otp);
        
        // Mock bcrypt.compare to return false
        const originalCompare = bcrypt.compare;
        bcrypt.compare = jest.fn().mockResolvedValue(false);
        
        await expect(authService.login({ email: "bcrypt4@example.com", password: "wrongpassword" }))
            .rejects.toThrow("INVALID_CREDENTIALS");
        
        // Restore original function
        bcrypt.compare = originalCompare;
    });

    it("should throw INVALID_CREDENTIALS for non-existent user", async () => {
        await expect(authService.login({ email: "nonexistent@example.com", password: "any" }))
            .rejects.toThrow("INVALID_CREDENTIALS");
    });
});
