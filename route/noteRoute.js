const {
  createNote,
  getAllNotes,
  getSingleNote,
  editNote,
  deleteSingleNote,
  deleteAllNotes,
} = require("../controller/noteController");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

// Protect all note endpoints
router.use(auth);

// Create a note
router.post("/", createNote);

// Get all notes for the logged-in user
router.get("/", getAllNotes);

// Get single note
router.get("/:id", getSingleNote);

// Edit single note
router.patch("/:id", editNote);

// Delete single note
router.delete("/:id", deleteSingleNote);

// Delete all notes for the logged-in user
router.delete("/", deleteAllNotes);

module.exports = router;
