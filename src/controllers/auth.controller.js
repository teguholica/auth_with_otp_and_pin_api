const authService = require("../services/auth.service");

function isValidEmail(email) {
    return /.+@.+\..+/.test(email);
}

function isValidPassword(password) {
    return password && String(password).length >= 6;
}

exports.signup = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "INVALID_EMAIL" });
        }
        if (!password || String(password).length < 6) {
            return res
                .status(400)
                .json({ error: "INVALID_PASSWORD", detail: "min 6 chars" });
        }

        const result = await authService.signup({ email, password, name });
        return res.status(201).json(result);
    } catch (err) {
        // Handle specific error cases
        if (err.message === "USER_ALREADY_EXISTS") {
            return res.status(409).json({ error: "USER_ALREADY_EXISTS" });
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ error: "INVALID_EMAIL" });
        }
        if (!password || !isValidPassword(password)) {
            return res.status(400).json({ error: "INVALID_PASSWORD" });
        }

        const result = await authService.login({ email, password });
        return res.json(result);
    } catch (err) {
        // Handle specific error cases
        if (err.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ error: "INVALID_CREDENTIALS" });
        }
        if (err.message === "USER_NOT_VERIFIED") {
            return res.status(403).json({ error: "USER_NOT_VERIFIED" });
        }
        next(err);
    }
};

exports.requestOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.requestOtp(email);
        return res.json(result);
    } catch (err) {
        // Handle specific error cases
        if (err.message === "USER_NOT_FOUND") {
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        }
        next(err);
    }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const result = await authService.verifyOtp(email, code);
        return res.json(result);
    } catch (err) {
        // Handle specific error cases
        if (err.message === "USER_NOT_FOUND") {
            return res.status(404).json({ error: "USER_NOT_FOUND" });
        }
        next(err);
    }
};
