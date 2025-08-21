module.exports = (err, req, res, next) => {
    if (process.env.NODE_ENV !== "test") {
        console.error(err);
    }

    const errorMap = {
        USER_ALREADY_EXISTS: 409,
        USER_NOT_FOUND: 404,
        OTP_NOT_FOUND: 404,
        OTP_EXPIRED: 400,
        OTP_TOO_MANY_ATTEMPTS: 429,
        OTP_INVALID: 400,
    };

    const status = errorMap[err.message] || 500;
    res.status(status).json({ error: err.message || "INTERNAL_ERROR" });
};
