const jwt = require("jsonwebtoken");
const { verifyToken } = require("../lib/token/verifyToken");

function verifyUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ message: "Access token is required" });
  }

  try {
    const decoded = verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }
}

module.exports = {
  verifyUser,
};
