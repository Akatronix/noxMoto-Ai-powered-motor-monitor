const express = require("express");
const {
  createMotorData,
} = require("../../controllers/meter/createMeter.controller");
const {
  hardwareData,
} = require("../../controllers/meter/hardwareData.controller");
const {
  updateMaxParams,
} = require("../../controllers/meter/updateMaxParams.controller");
const {
  getMaxParams,
} = require("../../controllers/meter/getMaxParams.controller");

const { verifyUser } = require("../../middlewares/VerifyUser");

const router = express.Router();

router.post("/create", verifyUser, createMotorData);
router.post("/max-params", verifyUser, updateMaxParams);
router.get("/max-params", verifyUser, getMaxParams);
router.post("/hardware", hardwareData);

module.exports = router;
