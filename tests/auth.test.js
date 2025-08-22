const request = require("supertest");
const app = require("../src/app");

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



});
