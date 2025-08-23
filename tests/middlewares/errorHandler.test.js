const errorHandler = require("../../src/middlewares/errorHandler");

describe("errorHandler middleware", () => {
    it("should call console.error when NODE_ENV is not test", () => {
        const oldEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development"; // trigger the error block

        const spy = jest.spyOn(console, "error").mockImplementation(() => { });

        const err = new Error("SOME_ERROR");
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(spy).toHaveBeenCalledWith(err); // ✅ line 3 is covered
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "INTERNAL_ERROR" });

        spy.mockRestore();
        process.env.NODE_ENV = oldEnv; // restore
    });

    it("should return 500 and INTERNAL_ERROR when error message not in map", () => {
        const err = new Error("UNKNOWN_ERROR"); // with a message that's not in the map
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500); // ✅ falls back to 500
        expect(res.json).toHaveBeenCalledWith({ error: "INTERNAL_ERROR" });
    });

    it("should return 500 and INTERNAL_ERROR when error has no message", () => {
        const err = { message: undefined }; // error without a message
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "INTERNAL_ERROR" });
    });

    it("should return 409 for USER_ALREADY_EXISTS error", () => {
        const err = new Error("USER_ALREADY_EXISTS");
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({ error: "USER_ALREADY_EXISTS" });
    });

    it("should return 404 for USER_NOT_FOUND error", () => {
        const err = new Error("USER_NOT_FOUND");
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "USER_NOT_FOUND" });
    });

    it("should return 404 for OTP_NOT_FOUND error", () => {
        const err = new Error("OTP_NOT_FOUND");
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "OTP_NOT_FOUND" });
    });

    it("should return 400 for OTP_EXPIRED error", () => {
        const err = new Error("OTP_EXPIRED");
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "OTP_EXPIRED" });
    });

    it("should return 429 for OTP_TOO_MANY_ATTEMPTS error", () => {
        const err = new Error("OTP_TOO_MANY_ATTEMPTS");
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({ error: "OTP_TOO_MANY_ATTEMPTS" });
    });

    it("should return 400 for OTP_INVALID error", () => {
        const err = new Error("OTP_INVALID");
        const req = {};
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        const next = jest.fn();

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "OTP_INVALID" });
    });
});
