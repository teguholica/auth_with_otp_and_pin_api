const authController = require("../../src/controllers/auth.controller");
const authService = require("../../src/services/auth.service");

describe("AuthController", () => {
    // Test data
    const mockReq = {
        body: {}
    };
    
    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
    };
    
    const mockNext = jest.fn();

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe("signup", () => {
        it("should call next(err) when authService.signup throws an unexpected error", async () => {
            // Setup
            mockReq.body = { email: "test@example.com", password: "password123", name: "Test User" };
            
            // Mock authService to throw an unexpected error
            const unexpectedError = new Error("Unexpected database error");
            jest.spyOn(authService, "signup").mockRejectedValue(unexpectedError);
            
            // Execute
            await authController.signup(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.signup).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
                name: "Test User"
            });
            expect(mockNext).toHaveBeenCalledWith(unexpectedError);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        it("should handle USER_ALREADY_EXISTS error specifically and not call next", async () => {
            // Setup
            mockReq.body = { email: "test@example.com", password: "password123", name: "Test User" };
            
            // Mock authService to throw USER_ALREADY_EXISTS error
            const userExistsError = new Error("USER_ALREADY_EXISTS");
            jest.spyOn(authService, "signup").mockRejectedValue(userExistsError);
            
            // Execute
            await authController.signup(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.signup).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
                name: "Test User"
            });
            expect(mockRes.status).toHaveBeenCalledWith(409);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "USER_ALREADY_EXISTS" });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe("login", () => {
        it("should call next(err) when authService.login throws an unexpected error", async () => {
            // Setup
            mockReq.body = { email: "test@example.com", password: "password123" };
            
            // Mock authService to throw an unexpected error
            const unexpectedError = new Error("Unexpected database error");
            jest.spyOn(authService, "login").mockRejectedValue(unexpectedError);
            
            // Execute
            await authController.login(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.login).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123"
            });
            expect(mockNext).toHaveBeenCalledWith(unexpectedError);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        it("should handle INVALID_CREDENTIALS error specifically and not call next", async () => {
            // Setup
            mockReq.body = { email: "test@example.com", password: "password123" };
            
            // Mock authService to throw INVALID_CREDENTIALS error
            const invalidCredentialsError = new Error("INVALID_CREDENTIALS");
            jest.spyOn(authService, "login").mockRejectedValue(invalidCredentialsError);
            
            // Execute
            await authController.login(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.login).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123"
            });
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "INVALID_CREDENTIALS" });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should handle USER_NOT_VERIFIED error specifically and not call next", async () => {
            // Setup
            mockReq.body = { email: "test@example.com", password: "password123" };
            
            // Mock authService to throw USER_NOT_VERIFIED error
            const userNotVerifiedError = new Error("USER_NOT_VERIFIED");
            jest.spyOn(authService, "login").mockRejectedValue(userNotVerifiedError);
            
            // Execute
            await authController.login(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.login).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123"
            });
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "USER_NOT_VERIFIED" });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe("requestOtp", () => {
        it("should call next(err) when authService.requestOtp throws an unexpected error", async () => {
            // Setup
            mockReq.body = { email: "test@example.com" };
            
            // Mock authService to throw an unexpected error
            const unexpectedError = new Error("Unexpected database error");
            jest.spyOn(authService, "requestOtp").mockRejectedValue(unexpectedError);
            
            // Execute
            await authController.requestOtp(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.requestOtp).toHaveBeenCalledWith("test@example.com");
            expect(mockNext).toHaveBeenCalledWith(unexpectedError);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        it("should handle USER_NOT_FOUND error specifically and not call next", async () => {
            // Setup
            mockReq.body = { email: "test@example.com" };
            
            // Mock authService to throw USER_NOT_FOUND error
            const userNotFoundError = new Error("USER_NOT_FOUND");
            jest.spyOn(authService, "requestOtp").mockRejectedValue(userNotFoundError);
            
            // Execute
            await authController.requestOtp(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.requestOtp).toHaveBeenCalledWith("test@example.com");
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "USER_NOT_FOUND" });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe("verifyOtp", () => {
        it("should call next(err) when authService.verifyOtp throws an unexpected error", async () => {
            // Setup
            mockReq.body = { email: "test@example.com", code: "123456" };
            
            // Mock authService to throw an unexpected error
            const unexpectedError = new Error("Unexpected database error");
            jest.spyOn(authService, "verifyOtp").mockRejectedValue(unexpectedError);
            
            // Execute
            await authController.verifyOtp(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.verifyOtp).toHaveBeenCalledWith("test@example.com", "123456");
            expect(mockNext).toHaveBeenCalledWith(unexpectedError);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        it("should handle USER_NOT_FOUND error specifically and not call next", async () => {
            // Setup
            mockReq.body = { email: "test@example.com", code: "123456" };
            
            // Mock authService to throw USER_NOT_FOUND error
            const userNotFoundError = new Error("USER_NOT_FOUND");
            jest.spyOn(authService, "verifyOtp").mockRejectedValue(userNotFoundError);
            
            // Execute
            await authController.verifyOtp(mockReq, mockRes, mockNext);
            
            // Assert
            expect(authService.verifyOtp).toHaveBeenCalledWith("test@example.com", "123456");
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "USER_NOT_FOUND" });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
