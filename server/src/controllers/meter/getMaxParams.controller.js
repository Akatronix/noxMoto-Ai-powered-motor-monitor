const Motor = require("../../models/meter/meter.model");

async function getMaxParams(req, res){
  try {
    const motor = await Motor.findOne({ userId: req.user.userId });

    if (!motor) {
      return res.status(404).json({
        success: false,
        message: "Motor device not found for this user",
      });
    }

    const params = await Motor.getMaxParams(motor.hardwareId);

    res.status(200).json({
      success: true,
      data: params,
    });
  } catch (error) {
    console.error("[GET max-params] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch motor parameters",
      error: error.message,
    });
  }
};

module.exports = {  getMaxParams };
