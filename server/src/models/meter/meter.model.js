// const mongoose = require("mongoose");

// // ─── Sub-schemas ───

// const chartDataSchema = new mongoose.Schema(
//   {
//     timestamp: { type: Date, default: Date.now },

//     // Motor Metrics (Matches the MOTOR_DATA structure in the React component)
//     current: { type: Number, default: 0 }, // Amperes (A)
//     temperature: { type: Number, default: 0 }, // Celsius (°C)
//     vibration: { type: Number, default: 0 }, // mm/s
//     flow: { type: Number, default: 0 }, // L/min
//   },
//   { _id: false },
// );

// const historySchema = new mongoose.Schema(
//   {
//     timestamp: { type: Date, default: Date.now },
//     title: { type: String, trim: true, required: true },
//     description: { type: String, trim: true },
//     category: {
//       type: String,
//       enum: ["alert", "info", "action", "prediction"],
//       default: "info",
//     },
//   },
//   { _id: false },
// );

// // ─── Main Schema ───

// const motorSchema = new mongoose.Schema(
//   {
//     // User & Device Identification
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//       index: true,
//     },
//     hardwareId: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },

//     // Device Metadata
//     deviceName: { type: String, default: "MotoX Unit" },
//     location: { type: String, trim: true, default: "" },
//     isActive: { type: Boolean, default: true },
//     lastSeen: { type: Date, default: Date.now },

//     // Power Logic State (Matches the "Power Logic" UI section)
//     isRunning: { type: Boolean, default: false }, // Defaults to false on creation
//     lastStartTime: { type: Date }, // Used to calculate "Uptime"

//     // Latest Sensor Values (Real-time Cache for Metric Cards)
//     current: {
//       type: Number,
//       min: 0,
//       default: 0,
//     }, // Amperes
//     temperature: {
//       type: Number,
//       min: -20,
//       max: 150,
//       default: 0,
//     }, // Celsius
//     vibration: {
//       type: Number,
//       min: 0,
//       default: 0,
//     }, // mm/s
//     flow: {
//       type: Number,
//       min: 0,
//       default: 0,
//     }, // L/min

//     // Time-series data
//     chartData: [chartDataSchema],

//     // Logs / events (e.g., "Temperature threshold alert")
//     history: [historySchema],
//   },
//   {
//     timestamps: true, // createdAt, updatedAt
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   },
// );

// // ─── Indexes ───
// motorSchema.index({ userId: 1, isActive: -1 });

// // ─── Instance Methods ───

// /**
//  * Adds a new motor reading.
//  * Updates 'latest' fields, handles 'isRunning' state, and pushes to chart history.
//  */
// motorSchema.methods.addReading = function (data, options = {}) {
//   const { updateStateOnly = false } = options;

//   // 1. Update Latest Values
//   this.current = data.current ?? this.current;
//   this.temperature = data.temperature ?? this.temperature;
//   this.vibration = data.vibration ?? this.vibration;
//   this.flow = data.flow ?? this.flow;

//   this.lastSeen = new Date();

//   // 2. Update Power State Logic (Optional, if sensor confirms on/off)
//   if (data.isRunning !== undefined) {
//     // If state changed from false to true, record start time
//     if (data.isRunning === true && this.isRunning === false) {
//       this.lastStartTime = new Date();
//       // Add to history
//       this.history.push({
//         title: "System Started",
//         description: "Motor activated via toggle or scheduler",
//         category: "action",
//         timestamp: new Date(),
//       });
//     }
//     // If state changed from true to false
//     else if (data.isRunning === false && this.isRunning === true) {
//       // Add to history
//       this.history.push({
//         title: "System Stopped",
//         description: "Motor deactivated",
//         category: "action",
//         timestamp: new Date(),
//       });
//     }
//     this.isRunning = data.isRunning;
//   }

//   // 3. Check Thresholds (Matches Frontend Alerts)
//   const tempWarning = this.temperature >= 55;
//   const vibrationWarning = this.vibration > 3.0;

//   if (tempWarning) {
//     this.history.push({
//       title: "Temperature Alert",
//       description: `High temp detected: ${this.temperature}°C`,
//       category: "alert",
//     });
//   }

//   if (vibrationWarning) {
//     this.history.push({
//       title: "Vibration Alert",
//       description: `High vibration detected: ${this.vibration} mm/s`,
//       category: "alert",
//     });
//   }

//   // 4. Push to Chart Data (Skip if only updating state, e.g., Toggle button)
//   if (!updateStateOnly) {
//     // Limit array size (e.g., keep last 2000 points to prevent 16MB doc limit)
//     if (this.chartData.length >= 2000) {
//       this.chartData.shift();
//     }

//     this.chartData.push({
//       timestamp: data.timestamp || new Date(),
//       current: this.current,
//       temperature: this.temperature,
//       vibration: this.vibration,
//       flow: this.flow,
//     });
//   }

//   // Limit history size
//   if (this.history.length > 100) {
//     this.history.shift();
//   }

//   return this.save();
// };

// // Renamed model from 'Soil' to 'Motor' to match the MotoX context
// const Motor = mongoose.model("Motor", motorSchema);

// module.exports = Motor;








const mongoose = require("mongoose");

// ─── Sub-schemas ───

const chartDataSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },

    // Motor Metrics (Matches the MOTOR_DATA structure in the React component)
    current: { type: Number, default: 0 }, // Amperes (A)
    temperature: { type: Number, default: 0 }, // Celsius (°C)
    vibration: { type: Number, default: 0 }, // mm/s
    flow: { type: Number, default: 0 }, // L/min
  },
  { _id: false },
);

const historySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    category: {
      type: String,
      enum: ["alert", "info", "action", "prediction"],
      default: "info",
    },
  },
  { _id: false },
);

// ─── Main Schema ───

const motorSchema = new mongoose.Schema(
  {
    // User & Device Identification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hardwareId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Device Metadata
    deviceName: { type: String, default: "MotoX Unit" },
    location: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    lastSeen: { type: Date, default: Date.now },

    // Power Logic State (Matches the "Power Logic" UI section)
    isRunning: { type: Boolean, default: false }, // Defaults to false on creation
    lastStartTime: { type: Date }, // Used to calculate "Uptime"

    // Latest Sensor Values (Real-time Cache for Metric Cards)
    current: {
      type: Number,
      min: 0,
      default: 0,
    }, // Amperes
    temperature: {
      type: Number,
      min: -20,
      max: 150,
      default: 0,
    }, // Celsius
    vibration: {
      type: Number,
      min: 0,
      default: 0,
    }, // mm/s
    flow: {
      type: Number,
      min: 0,
      default: 0,
    }, // L/min

    // ─── Configurable Safety Thresholds ──────────────────────
    // These match the Motor Max Parameters in the frontend settings page
    maxCurrent: {
      type: Number,
      min: 0,
      default: 25, // Default: 25A
    },
    maxTemperature: {
      type: Number,
      min: 0,
      default: 50, // Default: 50°C
    },
    maxVibration: {
      type: Number,
      min: 0,
      default: 50, // Default: 50 mm/s
    },
    maxFlow: {
      type: Number,
      min: 0,
      default: 50, // Default: 50 L/min
    },

    // Time-series data
    chartData: [chartDataSchema],

    // Logs / events (e.g., "Temperature threshold alert")
    history: [historySchema],
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ───
motorSchema.index({ userId: 1, isActive: -1 });

// ─── Instance Methods ───

/**
 * Adds a new motor reading.
 * Updates 'latest' fields, handles 'isRunning' state, and pushes to chart history.
 * Uses configurable thresholds (maxCurrent, maxTemperature, etc.) for alerts.
 */
motorSchema.methods.addReading = function (data, options = {}) {
  const { updateStateOnly = false } = options;

  // 1. Update Latest Values
  this.current = data.current ?? this.current;
  this.temperature = data.temperature ?? this.temperature;
  this.vibration = data.vibration ?? this.vibration;
  this.flow = data.flow ?? this.flow;

  this.lastSeen = new Date();

  // 2. Update Power State Logic (Optional, if sensor confirms on/off)
  if (data.isRunning !== undefined) {
    // If state changed from false to true, record start time
    if (data.isRunning === true && this.isRunning === false) {
      this.lastStartTime = new Date();
      // Add to history
      this.history.push({
        title: "System Started",
        description: "Motor activated via toggle or scheduler",
        category: "action",
        timestamp: new Date(),
      });
    }
    // If state changed from true to false
    else if (data.isRunning === false && this.isRunning === true) {
      // Add to history
      this.history.push({
        title: "System Stopped",
        description: "Motor deactivated",
        category: "action",
        timestamp: new Date(),
      });
    }
    this.isRunning = data.isRunning;
  }

  // 3. Check Thresholds (Uses configurable limits from the document)
  // ─── Current Alert ───────────────────────────────────────
  if (this.current >= this.maxCurrent) {
    this.history.push({
      title: "Current Alert",
      description: `High current detected: ${this.current.toFixed(1)}A (limit: ${this.maxCurrent}A)`,
      category: "alert",
    });
  }

  // ─── Temperature Alert ─────────────────────────────────
  if (this.temperature >= this.maxTemperature) {
    this.history.push({
      title: "Temperature Alert",
      description: `High temp detected: ${this.temperature.toFixed(1)}°C (limit: ${this.maxTemperature}°C)`,
      category: "alert",
    });
  }

  // ─── Vibration Alert ───────────────────────────────────
  if (this.vibration >= this.maxVibration) {
    this.history.push({
      title: "Vibration Alert",
      description: `High vibration detected: ${this.vibration.toFixed(2)} mm/s (limit: ${this.maxVibration} mm/s)`,
      category: "alert",
    });
  }

  // ─── Flow Alert ────────────────────────────────────────
  if (this.flow >= this.maxFlow) {
    this.history.push({
      title: "Flow Alert",
      description: `High flow detected: ${this.flow.toFixed(1)} L/min (limit: ${this.maxFlow} L/min)`,
      category: "alert",
    });
  }

  // 4. Push to Chart Data (Skip if only updating state, e.g., Toggle button)
  if (!updateStateOnly) {
    // Limit array size (e.g., keep last 2000 points to prevent 16MB doc limit)
    if (this.chartData.length >= 2000) {
      this.chartData.shift();
    }

    this.chartData.push({
      timestamp: data.timestamp || new Date(),
      current: this.current,
      temperature: this.temperature,
      vibration: this.vibration,
      flow: this.flow,
    });
  }

  // Limit history size
  if (this.history.length > 100) {
    this.history.shift();
  }

  return this.save();
};

// ─── Static Method: Update Thresholds ───────────────────────
/**
 * Updates the configurable safety thresholds for a motor device.
 * Called by the frontend settings page via POST /user/settings/max-params
 */
motorSchema.statics.updateMaxParams = async function (hardwareId, limits) {
  const motor = await this.findOne({ hardwareId });
  if (!motor) {
    throw new Error("Motor device not found");
  }

  if (limits.current !== undefined) motor.maxCurrent = limits.current;
  if (limits.temperature !== undefined) motor.maxTemperature = limits.temperature;
  if (limits.vibration !== undefined) motor.maxVibration = limits.vibration;
  if (limits.flow !== undefined) motor.maxFlow = limits.flow;

  await motor.save();
  return motor;
};

// ─── Static Method: Get Thresholds ──────────────────────────
/**
 * Returns the current safety thresholds for a motor device.
 * Called by the frontend settings page via GET /user/settings/max-params
 */
motorSchema.statics.getMaxParams = async function (hardwareId) {
  const motor = await this.findOne(
    { hardwareId },
    { maxCurrent: 1, maxTemperature: 1, maxVibration: 1, maxFlow: 1, _id: 0 }
  );
  if (!motor) {
    throw new Error("Motor device not found");
  }

  return {
    current: motor.maxCurrent,
    temperature: motor.maxTemperature,
    vibration: motor.maxVibration,
    flow: motor.maxFlow,
  };
};

// Renamed model from 'Soil' to 'Motor' to match the MotoX context
const Motor = mongoose.model("Motor", motorSchema);

module.exports = Motor;
