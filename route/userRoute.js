const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  incrementAskAI,
} = require("../controller/userController");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/refresh-token", refreshAccessToken);

// Increment askAI counter for the logged-in user
router.post("/ask-ai/increment", auth, incrementAskAI);

module.exports = router;
