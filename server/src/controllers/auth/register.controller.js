const { hashPassword } = require("../../lib/password/Hash");
const { signUpSchema } = require("../../verifier/checkSignUp");
const User = require("../../models/user/user.model");

async function registerController(req, res) {
  try {
    const data = signUpSchema.safeParse(req.body);

    if (!data.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", errors: data.error.errors });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const passwordHash = await hashPassword(password);

    const newUser = new User({
      username,
      email,
      passwordHash,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  registerController,
};
