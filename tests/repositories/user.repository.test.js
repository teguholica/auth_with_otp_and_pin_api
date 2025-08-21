const userRepo = require("../../src/repositories/user.repository");

describe("UserRepository", () => {
    it("should create and find user", async () => {
        const email = "repo@example.com";
        await userRepo.create({ email, name: "Repo", passwordHash: "x" });
        const user = await userRepo.findByEmail(email);
        expect(user.email).toBe(email);
    });

    it("should throw on duplicate", async () => {
        const email = "dup@example.com";
        await userRepo.create({ email, name: "Dup", passwordHash: "y" });
        await expect(userRepo.create({ email, name: "Dup2", passwordHash: "z" }))
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
