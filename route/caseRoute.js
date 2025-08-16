const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createCase,
  getAllCases,
  getSingleCase,
  updateCase,
  deleteCase,
  generateQuiz,
  getQuiz,
  regenerateQuiz,
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

// Quiz endpoints
// Generate quiz for a case (POST /cases/:id/quiz/generate)
router.post("/:id/quiz/generate", generateQuiz);

// Get quiz for a case (GET /cases/:id/quiz)
router.get("/:id/quiz", getQuiz);

// Regenerate quiz for a case (PUT /cases/:id/quiz/regenerate)
router.put("/:id/quiz/regenerate", regenerateQuiz);

module.exports = router;
