const { generateToken } = require("../../lib/token/tokenGenerator");
const { verifyToken } = require("../../lib/token/verifyToken");

async function refreshTokenController(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      console.log("No refresh token found in cookies");
      return res.status(401).json({ message: "Refresh token is required" });
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
    const userId = decoded.userId;

    // Generate new access token
    const newAccessToken = await generateToken(
      { userId: userId },
      process.env.JWT_ACCESS_SECRET,
      "1m",
    );

    res.status(200).json({
      accessToken: newAccessToken,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { refreshTokenController };
