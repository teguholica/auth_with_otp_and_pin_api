const { generateToken, verifyToken } = require("../../src/utils/jwt");

describe("JWT Utils", () => {
    const payload = { id: 1, email: "test@example.com", name: "Test User" };

    it("should generate a valid token", () => {
        const token = generateToken(payload);
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
    });

    it("should verify a valid token", () => {
        const token = generateToken(payload);
        const decoded = verifyToken(token);
        expect(decoded).toBeDefined();
        expect(decoded.id).toBe(payload.id);
        expect(decoded.email).toBe(payload.email);
        expect(decoded.name).toBe(payload.name);
    });

    it("should throw error for invalid token", () => {
        expect(() => {
            verifyToken("invalid.token.string");
        }).toThrow("INVALID_TOKEN");
    });
});
