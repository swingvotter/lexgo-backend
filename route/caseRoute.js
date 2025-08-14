const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createCase,
  getAllCases,
  getSingleCase,
  updateCase,
  deleteCase,
} = require("../controller/caseController");
const adminOnly = require("../middleware/adminMiddleware");

// Protect all case endpoints
router.use(auth);

// Create
router.post("/", adminOnly, createCase);

// Read all
router.get("/", getAllCases);

// Read one
router.get("/:id", getSingleCase);

// Update
router.patch("/:id", adminOnly, updateCase);

// Delete
router.delete("/:id", adminOnly, deleteCase);

module.exports = router;
