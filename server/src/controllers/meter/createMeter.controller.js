const Motor = require("../../models/meter/meter.model");
const User = require("../../models/user/user.model");

async function createMotorData(req, res) {
  const userId = req.user.userId;
  const { hardwareID } = req.body;

  if (
    !hardwareID ||
    typeof hardwareID !== "string" ||
    hardwareID.trim() === ""
  ) {
    return res.status(400).json({ message: "A valid hardware ID is required" });
  }

  try {
    // 1. Check if the user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check if THIS USER already has a device assigned
    const userAlreadyHasDevice = await Motor.findOne({ userId: userId });
    if (userAlreadyHasDevice) {
      return res.status(400).json({
        message:
          "You have already registered a MotoX device. You cannot create more than one.",
      });
    }

    // 3. Check if this specific hardwareID is already registered to SOMEONE ELSE
    const hardwareTaken = await Motor.findOne({ hardwareId: hardwareID });
    if (hardwareTaken) {
      return res.status(400).json({
        message: "This hardware ID is already in use by another account.",
      });
    }

    // 4. Create the new motor device
    const newMotor = new Motor({
      userId: userId,
      hardwareId: hardwareID,

      current: 0,
      temperature: 0,
      vibration: 0,
      flow: 0,
      isRunning: false,

      // deviceName will default to "MotoX Unit" based on the schema
    });

    await newMotor.save();

    // 5. Update the user profile
    existingUser.hardwareID = hardwareID;
    await existingUser.save();

    const myUserDataInfo = {
      username: existingUser.username,
      email: existingUser.email,
      hardwareID: existingUser.hardwareID || null,
    };

    return res.status(201).json({
      message: "Motor device created successfully",
      motor: newMotor, // Changed from 'meter' to 'motor'
      user: myUserDataInfo,
    });
  } catch (error) {
    console.error("Error creating motor device:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { createMotorData };
