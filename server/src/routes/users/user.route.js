const express = require("express");
const {
  getUserData,
} = require("../../controllers/user/getUserData.controller");
const {
  updateUserInfo,
} = require("../../controllers/user/updateUserInfo.controller");
const { verifyUser } = require("../../middlewares/VerifyUser");
const { toggleMotor } = require("../../controllers/meter/toggle.controller");

const router = express.Router();

router.get("/getData", verifyUser, getUserData);
router.post("/updateUserInfo", verifyUser, updateUserInfo);
router.post("/toggle", verifyUser, toggleMotor);

module.exports = router;
