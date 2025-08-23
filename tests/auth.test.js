const request = require("supertest");
const app = require("../src/app");
const userRepo = require("../src/repositories/user.repository");

describe("Auth API", () => {
    const email = "test@example.com";
    const password = "secret123";

    it("should signup a new user and return OTP (dev mode)", async () => {
        const res = await request(app)
            .post("/auth/signup")
            .send({ email, password, name: "Test User" });

        expect(res.status).toBe(201);
        expect(res.body.email).toBe(email);
        expect(res.body.status).toBe("PENDING_VERIFICATION");
        expect(res.body.otp).toHaveLength(6); // OTP is returned
    });

    it("should reject duplicate signup", async () => {
        await request(app)
            .post("/auth/signup")
            .send({ email, password, name: "Test User" });

        const res = await request(app)
            .post("/auth/signup")
            .send({ email, password });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe("USER_ALREADY_EXISTS");
    });

    it("should request new OTP", async () => {
        await request(app)
            .post("/auth/signup")
            .send({ email, password, name: "Test User" });

        const res = await request(app)
            .post("/auth/otp/request")
            .send({ email });

        expect(res.status).toBe(200);
        expect(res.body.email).toBe(email);
        expect(res.body.otp).toHaveLength(6);
    });

    it("should verify OTP successfully", async () => {
        const signup = await request(app)
            .post("/auth/signup")
            .send({ email, password, name: "Test User" });

        const otpCode = signup.body.otp;

        const res = await request(app)
            .post("/auth/otp/verify")
            .send({ email, code: otpCode });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("VERIFIED");
        expect(res.body.email).toBe(email);
        expect(res.body.verifiedAt).toBeDefined();
    });

    it("should reject signup with short password", async () => {
        const res = await request(app)
            .post("/auth/signup")
            .send({ email: "shortpass@example.com", password: "123" });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_PASSWORD");
    });

    it("should return USER_NOT_FOUND on verify unknown email", async () => {
        const res = await request(app)
            .post("/auth/otp/verify")
            .send({ email: "nouser@example.com", code: "123456" });
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("USER_NOT_FOUND");
    });

    it("should reject signup with invalid email", async () => {
        const res = await request(app)
            .post("/auth/signup")
            .send({ email: "invalidemail", password: "123456" });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_EMAIL");
    });

    it("should return USER_NOT_FOUND when verifying OTP for non-existent user", async () => {
        const res = await request(app)
            .post("/auth/otp/verify")
            .send({ email: "nouser@example.com", code: "123456" });
        expect(res.status).toBe(404);
        expect(res.body.error).toBe("USER_NOT_FOUND");
    });

    it("should return USER_NOT_FOUND when requesting OTP for unregistered email", async () => {
        const res = await request(app)
            .post("/auth/otp/request")
            .send({ email: "notfound@example.com" });

        expect(res.status).toBe(404);
        expect(res.body.error).toBe("USER_NOT_FOUND");
    });

    it("should login successfully with valid credentials", async () => {
        // First signup a user
        const signupRes = await request(app)
            .post("/auth/signup")
            .send({ email, password, name: "Test User" });

        // Get the OTP from signup response
        const otpCode = signupRes.body.otp;
        
        // Then verify the user with the OTP
        await request(app)
            .post("/auth/otp/verify")
            .send({ email, code: otpCode });

        // Now login
        const res = await request(app)
            .post("/auth/login")
            .send({ email, password });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("LOGIN_SUCCESS");
        expect(res.body.token).toBeDefined();
        expect(res.body.user).toBeDefined();
        expect(res.body.user.email).toBe(email);
        expect(res.body.user.name).toBe("Test User");
    });

    it("should reject login with invalid email", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "invalidemail", password });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_EMAIL");
    });

    it("should reject login with invalid password", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email, password: "123" });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe("INVALID_PASSWORD");
    });

    it("should reject login with wrong password", async () => {
        // First signup a user
        const signupRes = await request(app)
            .post("/auth/signup")
            .send({ email, password, name: "Test User" });

        // Get the OTP from signup response
        const otpCode = signupRes.body.otp;
        
        // Then verify the user with the OTP
        await request(app)
            .post("/auth/otp/verify")
            .send({ email, code: otpCode });

        // Now try to login with wrong password
        const res = await request(app)
            .post("/auth/login")
            .send({ email, password: "wrongpassword" });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe("INVALID_CREDENTIALS");
    });

    it("should reject login for unverified user", async () => {
        // First signup a user but don't verify
        await request(app)
            .post("/auth/signup")
            .send({ email: "unverified@example.com", password, name: "Test User" });

        // Try to login without verification
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "unverified@example.com", password });

        expect(res.status).toBe(403);
        expect(res.body.error).toBe("USER_NOT_VERIFIED");
    });

    it("should pass unexpected errors to error handler", async () => {
        // Mock userRepo.findByEmail to throw an unexpected error
        const originalFindByEmail = userRepo.findByEmail;
        userRepo.findByEmail = jest.fn().mockRejectedValue(new Error("Unexpected database error"));

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "test@example.com", password: "secret123" });

        // Restore original function
        userRepo.findByEmail = originalFindByEmail;

        // The error handler should catch this and return 500
        expect(res.status).toBe(500);
        expect(res.body.error).toBe("INTERNAL_ERROR");
    });
});
