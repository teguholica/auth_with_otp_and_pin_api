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
        expect(res.json).toHaveBeenCalledWith({ error: "SOME_ERROR" });

        spy.mockRestore();
        process.env.NODE_ENV = oldEnv; // restore
    });

    it("should return 500 and INTERNAL_ERROR when error message not in map", () => {
        const err = new Error(); // without message → undefined
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
});
