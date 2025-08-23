module.exports = (err, req, res, next) => {
    console.error(err);

    const errorMap = {
        USER_ALREADY_EXISTS: 409,
        USER_NOT_FOUND: 404,
        OTP_NOT_FOUND: 404,
        OTP_EXPIRED: 400,
        OTP_TOO_MANY_ATTEMPTS: 429,
        OTP_INVALID: 400,
    };

    const status = errorMap[err.message] || 500;
    const errorResponse = errorMap[err.message] ? err.message : "INTERNAL_ERROR";
    res.status(status).json({ error: errorResponse });
};
