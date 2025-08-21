const authService = require("../../src/services/auth.service");
const userRepo = require("../../src/repositories/user.repository");
const otpRepo = require("../../src/repositories/otp.repository");

describe("AuthService", () => {
    const email = "service@example.com";
    const password = "abc123";

    beforeEach(() => {
        userRepo.usersByEmail.clear();
        otpRepo.otpByEmail.clear();
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
        // directly override OTP to be expired
        otpRepo.otpByEmail.set(email, { code: "123456", expiresAt: Date.now() - 1000, attempts: 0 });
        await expect(authService.verifyOtp(email, "123456")).rejects.toThrow("OTP_EXPIRED");
    });

    it("should throw OTP_TOO_MANY_ATTEMPTS", async () => {
        const { email, otp } = await authService.signup({ email: "lock@example.com", password: "123456" });
        otpRepo.otpByEmail.set(email, { code: otp, expiresAt: Date.now() + 60000, attempts: 5 });
        await expect(authService.verifyOtp(email, otp)).rejects.toThrow("OTP_TOO_MANY_ATTEMPTS");
    });

    it("should throw OTP_NOT_FOUND if no OTP requested", async () => {
        const { email } = await authService.signup({ email: "nootp@example.com", password: "123456" });
        // directly delete OTP to make it null
        otpRepo.delete(email);
        await expect(authService.verifyOtp(email, "123456")).rejects.toThrow("OTP_NOT_FOUND");
    });

    it("should signup without name parameter (cover line 32)", async () => {
        const result = await authService.signup({ email: "noname@example.com", password: "abc123" });
        expect(result.email).toBe("noname@example.com");
        expect(result.status).toBe("PENDING_VERIFICATION");

        // Verify user was created with null name
        const user = await userRepo.findByEmail("noname@example.com");
        expect(user.name).toBeNull();
    });

    it("should not return otp in production environment (cover line 53)", async () => {
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

    it("should return otp in non-production environment (cover branch true)", async () => {
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


});
