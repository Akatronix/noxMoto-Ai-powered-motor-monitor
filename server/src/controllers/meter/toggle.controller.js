const Motor = require("../../models/meter/meter.model");

async function toggleMotor(req, res) {
  // 1. Extract state from request body (true or false)
  const { state } = req.body;
  const userId = req.user.userId;

  // 2. Validation
  if (typeof state !== "boolean") {
    return res.status(400).json({ message: "State must be true or false" });
  }

  try {
    // 3. Find the motor associated with this user
    const motor = await Motor.findOne({ userId });

    if (!motor) {
      return res.status(404).json({ message: "Motor device not found." });
    }

    // 4. Call the Schema Instance Method
    // We pass 'updateStateOnly: true' so we update the status and history,
    // but we don't push empty chart data.
    await motor.addReading({ isRunning: state }, { updateStateOnly: true });

    // 5. Success Response
    return res.status(200).json({
      message: state
        ? "Pump started successfully"
        : "Pump stopped successfully",
      isRunning: motor.isRunning,
      lastStartTime: motor.lastStartTime,
    });
  } catch (error) {
    console.error("Error toggling motor:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  toggleMotor,
};
