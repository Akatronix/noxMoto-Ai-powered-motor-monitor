const User = require("../../models/user/user.model");

async function updateUserInfo(req, res) {
  const userId = req.user.userId;

  const { username, email } = req.body;

  if (!username || typeof username !== "string" || username.trim() === "") {
    return res.status(400).json({ message: "A valid name is required" });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "A valid email is required" });
  }

  try {
    const existingUserWithEmail = await User.findOne({ email });
    if (
      existingUserWithEmail &&
      existingUserWithEmail._id.toString() !== userId.toString()
    ) {
      return res
        .status(409)
        .json({ message: "Email is already in use by another account" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User information updated successfully",

      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        hardwareID: updatedUser.hardwareID || null,
      },
    });
  } catch (error) {
    console.error("Error updating user information:", error);

    if (error.code === 11000) {
      return res.status(409).json({ message: "Email is already in use" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  updateUserInfo,
};
