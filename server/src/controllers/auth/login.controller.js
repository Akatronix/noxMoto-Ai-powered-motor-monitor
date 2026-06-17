const { comparePassword } = require("../../lib/password/comparePassword");
const { generateToken } = require("../../lib/token/tokenGenerator");
const User = require("../../models/user/user.model");
const { loginSchema } = require("../../verifier/checkLogin");

async function loginHandler(req, res) {
  try {
    const data = loginSchema.safeParse(req.body);

    if (!data.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: data.error.errors });
    }

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await comparePassword(
      password,
      existingUser.passwordHash,
    );

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const accessToken = await generateToken(
      { userId: existingUser._id },
      process.env.JWT_ACCESS_SECRET,
      "1d",
    );

    const refreshToken = await generateToken(
      { userId: existingUser._id },
      process.env.JWT_REFRESH_SECRET,
      "7d",
    );

    const userData = {
      username: existingUser.username,
      email: existingUser.email,
      hardwareID: existingUser.hardwareID || null,
    };

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      password,
    });

    res
      .status(200)
      .json({ message: "Login successful", accessToken, user: userData });
  } catch (error) {
    console.error("Error logging-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  loginHandler,
};
