const { authenticateToken } = require("../../src/middlewares/auth.middleware");
const { verifyToken } = require("../../src/utils/jwt");
const userRepo = require("../../src/repositories/user.repository");

jest.mock("../../src/utils/jwt");
jest.mock("../../src/repositories/user.repository");

describe("AuthMiddleware", () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        
        mockNext = jest.fn();
        
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe("authenticateToken", () => {
        it("should return 401 if no authorization header is present", async () => {
            await authenticateToken(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "MISSING_AUTH_TOKEN" });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should return 401 if token is missing from authorization header", async () => {
            mockReq.headers.authorization = "Bearer ";
            
            await authenticateToken(mockReq, mockRes, mockNext);
            
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "MISSING_AUTH_TOKEN" });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should return 403 if token verification fails", async () => {
            mockReq.headers.authorization = "Bearer invalid-token";
            verifyToken.mockImplementation(() => {
                throw new Error("INVALID_TOKEN");
            });
            
            await authenticateToken(mockReq, mockRes, mockNext);
            
            expect(verifyToken).toHaveBeenCalledWith("invalid-token");
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "INVALID_TOKEN" });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should return 401 if user is not found", async () => {
            mockReq.headers.authorization = "Bearer valid-token";
            verifyToken.mockReturnValue({ email: "test@example.com" });
            userRepo.findByEmail.mockResolvedValue(null);
            
            await authenticateToken(mockReq, mockRes, mockNext);
            
            expect(verifyToken).toHaveBeenCalledWith("valid-token");
            expect(userRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ error: "USER_NOT_FOUND" });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it("should call next() and attach user to request if token is valid", async () => {
            const mockUser = {
                id: 1,
                email: "test@example.com",
                name: "Test User"
            };
            
            mockReq.headers.authorization = "Bearer valid-token";
            verifyToken.mockReturnValue({ email: "test@example.com" });
            userRepo.findByEmail.mockResolvedValue(mockUser);
            
            await authenticateToken(mockReq, mockRes, mockNext);
            
            expect(verifyToken).toHaveBeenCalledWith("valid-token");
            expect(userRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
            expect(mockReq.user).toEqual({
                id: 1,
                email: "test@example.com",
                name: "Test User"
            });
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        it("should call next(err) if an unexpected error occurs", async () => {
            const unexpectedError = new Error("Database connection failed");
            
            mockReq.headers.authorization = "Bearer valid-token";
            verifyToken.mockReturnValue({ email: "test@example.com" });
            userRepo.findByEmail.mockRejectedValue(unexpectedError);
            
            await authenticateToken(mockReq, mockRes, mockNext);
            
            expect(verifyToken).toHaveBeenCalledWith("valid-token");
            expect(userRepo.findByEmail).toHaveBeenCalledWith("test@example.com");
            expect(mockNext).toHaveBeenCalledWith(unexpectedError);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });
});
