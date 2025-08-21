const authService = require("../services/auth.service");

function isValidEmail(email) {
    return /.+@.+\..+/.test(email);
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
        next(err);
    }
};

exports.requestOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.requestOtp(email);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};

exports.verifyOtp = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        const result = await authService.verifyOtp(email, code);
        return res.json(result);
    } catch (err) {
        next(err);
    }
};
