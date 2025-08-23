const userRepo = require("../../src/repositories/user.repository");

describe("UserRepository", () => {
    const email = "test@example.com";

    it("should create and find user", async () => {
        await userRepo.create({ email, name: "Test", passwordHash: "x", status: "PENDING_VERIFICATION" });
        const user = await userRepo.findByEmail(email);
        expect(user.email).toBe(email);
    });

    it("should throw original error for non-unique-violation database errors", async () => {
        // Mock the pool.query to throw a non-unique-violation error
        const originalQuery = userRepo.create.bind(userRepo);

        // Create a mock error with a different error code
        const mockError = new Error('Database connection failed');
        mockError.code = 'ECONNREFUSED'; // Not 23505 (unique_violation)

        // Temporarily replace pool.query with mock
        const pool = require('../../src/config/database');
        const originalPoolQuery = pool.query;
        pool.query = jest.fn().mockRejectedValue(mockError);

        try {
            await expect(userRepo.create({
                email: "error-test@example.com",
                name: "Error Test",
                passwordHash: "hashed123",
                status: "PENDING_VERIFICATION"
            })).rejects.toThrow('Database connection failed');
        } finally {
            // Restore original function
            pool.query = originalPoolQuery;
        }
    });


    it("should throw on duplicate", async () => {
        await userRepo.create({ email, name: "Test", passwordHash: "x", status: "PENDING_VERIFICATION" });
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

    it("should return mapped user object on successful creation", async () => {
        const userData = {
            email: "create-test@example.com",
            name: "Create Test",
            passwordHash: "hashed123",
            status: "PENDING_VERIFICATION"
        };

        const createdUser = await userRepo.create(userData);

        expect(createdUser).toBeDefined();
        expect(createdUser.email).toBe(userData.email.toLowerCase());
        expect(createdUser.name).toBe(userData.name);
        expect(createdUser.passwordHash).toBe(userData.passwordHash);
        expect(createdUser.status).toBe(userData.status);
        expect(createdUser.id).toBeDefined();
        expect(createdUser.createdAt).toBeDefined();
    });

    it("should handle optional name parameter in create", async () => {
        const userData = {
            email: "no-name-test@example.com",
            passwordHash: "hashed123",
            status: "PENDING_VERIFICATION"
        };

        const createdUser = await userRepo.create(userData);

        expect(createdUser).toBeDefined();
        expect(createdUser.email).toBe(userData.email.toLowerCase());
        expect(createdUser.name).toBeNull();
        expect(createdUser.passwordHash).toBe(userData.passwordHash);
        expect(createdUser.status).toBe(userData.status);
    });

    it("should handle verifiedAt parameter in create", async () => {
        const timestamp = Date.now();
        const userData = {
            email: "verified-test@example.com",
            name: "Verified Test",
            passwordHash: "hashed123",
            status: "VERIFIED",
            verifiedAt: timestamp
        };

        const createdUser = await userRepo.create(userData);

        expect(createdUser).toBeDefined();
        expect(Number(createdUser.verifiedAt)).toEqual(timestamp);
    });

    it("should update user successfully and return mapped user", async () => {
        await userRepo.create({
            email: "update-test@example.com",
            name: "Original Name",
            passwordHash: "original",
            status: "PENDING_VERIFICATION"
        });

        const updatedUser = await userRepo.update("update-test@example.com", {
            name: "Updated Name",
            status: "VERIFIED"
        });

        expect(updatedUser).toBeDefined();
        expect(updatedUser.name).toBe("Updated Name");
        expect(updatedUser.status).toBe("VERIFIED");
        expect(updatedUser.email).toBe("update-test@example.com");
    });

    it("should map database row to user object correctly", () => {
        const dbRow = {
            id: 1,
            email: "test@example.com",
            name: "Test User",
            password_hash: "hashed_password",
            created_at: "2023-01-01",
            verified_at: "2023-01-02",
            status: "VERIFIED"
        };

        const mappedUser = userRepo.mapDbToUser(dbRow);

        expect(mappedUser).toEqual({
            id: 1,
            email: "test@example.com",
            name: "Test User",
            passwordHash: "hashed_password",
            createdAt: "2023-01-01",
            verifiedAt: "2023-01-02",
            status: "VERIFIED"
        });
    });

    it("should map user object keys to database column names correctly", () => {
        expect(userRepo.mapUserKeyToDb("email")).toBe("email");
        expect(userRepo.mapUserKeyToDb("name")).toBe("name");
        expect(userRepo.mapUserKeyToDb("passwordHash")).toBe("password_hash");
        expect(userRepo.mapUserKeyToDb("createdAt")).toBe("created_at");
        expect(userRepo.mapUserKeyToDb("verifiedAt")).toBe("verified_at");
        expect(userRepo.mapUserKeyToDb("status")).toBe("status");
        expect(userRepo.mapUserKeyToDb("unknownKey")).toBe("unknownKey");
    });

    it("should handle all mapping cases for mapUserKeyToDb", () => {
        // Test all known mappings
        const mappings = {
            email: 'email',
            name: 'name',
            passwordHash: 'password_hash',
            createdAt: 'created_at',
            verifiedAt: 'verified_at',
            status: 'status'
        };

        Object.keys(mappings).forEach(key => {
            expect(userRepo.mapUserKeyToDb(key)).toBe(mappings[key]);
        });

        // Test unknown key
        expect(userRepo.mapUserKeyToDb('nonexistent')).toBe('nonexistent');
        expect(userRepo.mapUserKeyToDb('')).toBe('');
    });

    it("should handle null and undefined keys in mapUserKeyToDb", () => {
        expect(userRepo.mapUserKeyToDb(null)).toBe(null);
        expect(userRepo.mapUserKeyToDb(undefined)).toBe(undefined);
    });

    it("should handle edge cases in mapUserKeyToDb", () => {
        // Test the fallback behavior for non-string keys
        expect(userRepo.mapUserKeyToDb(0)).toBe(0);
        expect(userRepo.mapUserKeyToDb(false)).toBe(false);
        expect(userRepo.mapUserKeyToDb('')).toBe('');
        expect(userRepo.mapUserKeyToDb('nonexistent')).toBe('nonexistent');
    });

    it("should test the fallback behavior in mapUserKeyToDb", () => {
        // This test specifically targets line 32 to ensure the || userKey fallback is covered
        const result = userRepo.mapUserKeyToDb('completelyUnknownKey');
        expect(result).toBe('completelyUnknownKey');
    });

    it("should cover all branches in mapUserKeyToDb", () => {
        // Test all known mappings to ensure 100% branch coverage
        expect(userRepo.mapUserKeyToDb('email')).toBe('email');
        expect(userRepo.mapUserKeyToDb('name')).toBe('name');
        expect(userRepo.mapUserKeyToDb('passwordHash')).toBe('password_hash');
        expect(userRepo.mapUserKeyToDb('createdAt')).toBe('created_at');
        expect(userRepo.mapUserKeyToDb('verifiedAt')).toBe('verified_at');
        expect(userRepo.mapUserKeyToDb('status')).toBe('status');

        // Test the fallback for unknown keys
        expect(userRepo.mapUserKeyToDb('unknown')).toBe('unknown');
        expect(userRepo.mapUserKeyToDb('')).toBe('');

        // Test edge cases that trigger the fallback
        expect(userRepo.mapUserKeyToDb(null)).toBe(null);
        expect(userRepo.mapUserKeyToDb(undefined)).toBe(undefined);
        expect(userRepo.mapUserKeyToDb(123)).toBe(123);
        expect(userRepo.mapUserKeyToDb(false)).toBe(false);
    });

    it("should return null when mapping null database row", () => {
        expect(userRepo.mapDbToUser(null)).toBeNull();
    });

    it("should return null when mapping undefined database row", () => {
        expect(userRepo.mapDbToUser(undefined)).toBeNull();
    });

    it("should update user with passwordHash field", async () => {
        await userRepo.create({
            email: "password-update-test@example.com",
            name: "Original Name",
            passwordHash: "original",
            status: "PENDING_VERIFICATION"
        });

        const updatedUser = await userRepo.update("password-update-test@example.com", {
            passwordHash: "new_hashed_password"
        });

        expect(updatedUser).toBeDefined();
        expect(updatedUser.passwordHash).toBe("new_hashed_password");
    });

    it("should delete user successfully", async () => {
        await userRepo.create({
            email: "delete-test@example.com",
            name: "Delete Test",
            passwordHash: "hashed123",
            status: "VERIFIED"
        });

        const deletedUser = await userRepo.delete("delete-test@example.com");

        expect(deletedUser).toBeDefined();
        expect(deletedUser.email).toBe("delete-test@example.com");
        expect(deletedUser.name).toBe("Delete Test");

        // Verify user no longer exists
        const user = await userRepo.findByEmail("delete-test@example.com");
        expect(user).toBeNull();
    });

    it("should throw USER_NOT_FOUND when deleting non-existent user", async () => {
        await expect(userRepo.delete("nonexistent@example.com"))
            .rejects.toThrow("USER_NOT_FOUND");
    });

});
