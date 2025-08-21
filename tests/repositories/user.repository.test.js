const userRepo = require("../../src/repositories/user.repository");

describe("UserRepository", () => {
    const email = "test@example.com";

    it("should create and find user", async () => {
        await userRepo.create({ email, name: "Test", passwordHash: "x", status: "PENDING_VERIFICATION" });
        const user = await userRepo.findByEmail(email);
        expect(user.email).toBe(email);
    });

    it("should throw on duplicate", async () => {
        await expect(userRepo.create({ email, name: "Test", passwordHash: "x", status: "PENDING_VERIFICATION" }))
            .rejects.toThrow("USER_ALREADY_EXISTS");
    });

    it("should return null if user not found", async () => {
        const user = await userRepo.findByEmail("notfound@example.com");
        expect(user).toBeNull();
    });

    it("should throw if update user not found", async () => {
        await expect(userRepo.update("notfound@example.com", {}))
            .rejects.toThrow("USER_NOT_FOUND");
    });

});
