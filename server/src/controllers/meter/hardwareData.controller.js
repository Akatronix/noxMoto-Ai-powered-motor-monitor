const Motor = require("../../models/meter/meter.model");

async function hardwareData(req, res) {
  const { hardwareID, current, temperature, vibration, flow } = req.body;

  if (
    !hardwareID ||
    typeof hardwareID !== "string" ||
    hardwareID.trim() === ""
  ) {
    return res.status(400).json({ message: "Valid Hardware ID is required" });
  }

  try {
    // 3. Find the device document
    const device = await Motor.findOne({ hardwareId: hardwareID });

    if (!device) {
      return res.status(404).json({ message: "Device not found." });
    }

    const sensorData = {
      current: current ?? 0,
      temperature: temperature ?? 0,
      vibration: vibration ?? 0,
      flow: flow ?? 0,
      timestamp: new Date(),
    };

    await device.addReading(sensorData);

    // 6. Success Response
    return res.status(200).json({
      message: "Motor data updated successfully",
      state: device.isRunning,
      updatedFields: sensorData,
      lastUpdated: device.updatedAt,
    });
  } catch (error) {
    console.error("Error updating motor hardware data:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  hardwareData,
};
