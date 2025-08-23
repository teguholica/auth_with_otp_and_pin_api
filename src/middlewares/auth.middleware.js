const { verifyToken } = require("../utils/jwt");
const userRepo = require("../repositories/user.repository");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "MISSING_AUTH_TOKEN" });
  }

  try {
    const decoded = verifyToken(token);
    const user = await userRepo.findByEmail(decoded.email);
    
    if (!user) {
      return res.status(401).json({ error: "USER_NOT_FOUND" });
    }
    
    // Attach user info to request for use in controllers
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (err) {
    if (err.message === "INVALID_TOKEN") {
      return res.status(403).json({ error: "INVALID_TOKEN" });
    }
    next(err);
  }
}

module.exports = { authenticateToken };
