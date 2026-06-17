const express = require("express");
const {
  registerController,
} = require("../../controllers/auth/register.controller");
const { loginHandler } = require("../../controllers/auth/login.controller");
const {
  refreshTokenController,
} = require("../../controllers/auth/refreshToken.controller");
const { logoutHandler } = require("../../controllers/auth/logout.controller");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginHandler);
router.get("/refresh", refreshTokenController);
router.post("/logout", logoutHandler);

module.exports = router;
