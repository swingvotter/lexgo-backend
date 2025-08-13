const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} = require("../controller/userController");
const express = require("express");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/login", logoutUser);
router.post("/refresh-token", refreshAccessToken);

module.exports = router;
