const Motor = require("../../models/meter/meter.model");



async function updateMaxParams(req, res){
  try {
    const { current, temperature, vibration, flow } = req.body;

    const limits = {};
    if (current !== undefined) {
      if (typeof current !== "number" || current < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid current limit: must be a non-negative number",
        });
      }
      limits.current = current;
    }
    if (temperature !== undefined) {
      if (typeof temperature !== "number" || temperature < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid temperature limit: must be a non-negative number",
        });
      }
      limits.temperature = temperature;
    }
    if (vibration !== undefined) {
      if (typeof vibration !== "number" || vibration < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid vibration limit: must be a non-negative number",
        });
      }
      limits.vibration = vibration;
    }
    if (flow !== undefined) {
      if (typeof flow !== "number" || flow < 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid flow limit: must be a non-negative number",
        });
      }
      limits.flow = flow;
    }

    const motor = await Motor.findOne({ userId: req.user.userId });
    if (!motor) {
      return res.status(404).json({
        success: false,
        message: "Motor device not found for this user",
      });
    }

    const updatedMotor = await Motor.updateMaxParams(motor.hardwareId, limits);

    updatedMotor.history.push({
      title: "Thresholds Updated",
      description: "Motor safety limits updated via settings page",
      category: "action",
      timestamp: new Date(),
    });
    await updatedMotor.save();

    res.status(200).json({
      success: true,
      message: "Motor max parameters updated successfully",
      data: {
        current: updatedMotor.maxCurrent,
        temperature: updatedMotor.maxTemperature,
        vibration: updatedMotor.maxVibration,
        flow: updatedMotor.maxFlow,
      },
    });
  } catch (error) {
    console.error("[POST max-params] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update motor parameters",
      error: error.message,
    });
  }
};

 module.exports = { updateMaxParams };
