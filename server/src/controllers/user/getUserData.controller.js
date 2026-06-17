const Motor = require("../../models/meter/meter.model");
const User = require("../../models/user/user.model");

async function getUserData(req, res) {
  const userID = req.user.userId;

  if (!userID) {
    return res.status(400).json({ message: "User ID is required" });
  }

  if (typeof userID !== "string" || userID.trim() === "") {
    return res.status(400).json({ message: "Invalid User ID" });
  }

  try {
    const user = await User.findById(userID).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.hardwareID) {
      return res
        .status(404)
        .json({ message: "No hardware data found for this user" });
    }

    const hardwareData = await Motor.find({ userId: userID });
    if (!hardwareData || hardwareData.length === 0) {
      return res
        .status(404)
        .json({ message: "No hardware data found for this user" });
    }

    const chart = hardwareData[0].chartData;
    const myhistory = hardwareData[0].history;

    const { history, chartData, ...hardwareDataWithoutHistory } =
      hardwareData[0].toObject();

    res.status(200).json({
      message: "Data retrieved successfully",
      user,
      chart,
      myhistory,
      myData: hardwareDataWithoutHistory,
    });
  } catch (error) {
    console.error("Error creating meter data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getUserData,
};
