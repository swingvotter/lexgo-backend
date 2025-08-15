const Note = require("../model/noteModel");

/* CREATE A NOTE */
const createNote = async (req, res) => {
  try {
    const { title, content, importanceLevel, legalTopic, tags } = req.body;
    const userId = req.userInfo && req.userInfo.id;

    if (!title || !content || !importanceLevel || !legalTopic || !tags) {
      return res.status(400).json({
        success: false,
        message:
          "title, content, importanceLevel, legalTopic, tags are required",
      });
    }

    const existingNote = await Note.findOne({ title, user: userId });
    if (existingNote) {
      return res.status(400).json({
        success: false,
        message: "Note already exists with that same title",
      });
    }

    const newNote = await Note.create({
      user: userId,
      title,
      content,
      importanceLevel,
      legalTopic,
      tags,
    });

    return res.status(201).json({
      success: true,
      message: "note created successfully",
      note: newNote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* GET ALL NOTES (for logged-in user) */
const getAllNotes = async (req, res) => {
  try {
    const userId = req.userInfo && req.userInfo.id;

    const page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 30;

    if (limit > 30) limit = 30;

    const skip = Number((page - 1) * limit);
    const totalNotes = await Note.countDocuments({ user: userId });
    const totalPages = Math.ceil(totalNotes / limit);

    const notes = await Note.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: "notes fetched successfully",
      notes,
      totalNotes,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* GET SINGLE NOTE (owned by user) */
const getSingleNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.userInfo && req.userInfo.id;

  try {
    const singleNote = await Note.findOne({ _id: id, user: userId });

    if (!singleNote) {
      return res.status(404).json({
        success: false,
        message: "note does not exist with that Id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "note fetched successfully",
      note: singleNote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* EDIT SINGLE NOTE (owned by user) */
const editNote = async (req, res) => {
  const { id } = req.params;
  const { content, importanceLevel, legalTopic, tags } = req.body;
  const userId = req.userInfo && req.userInfo.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "id is missing",
    });
  }

  const updates = {};
  if (content !== undefined) updates.content = content;
  if (importanceLevel !== undefined) updates.importanceLevel = importanceLevel;
  if (legalTopic !== undefined) updates.legalTopic = legalTopic;
  if (tags !== undefined) updates.tags = tags;

  try {
    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, user: userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      return res.status(404).json({
        success: false,
        message: "note does not exist with that Id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "note updated successfully",
      note: updatedNote,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* DELETE SINGLE NOTE (owned by user) */
const deleteSingleNote = async (req, res) => {
  const { id } = req.params;
  const userId = req.userInfo && req.userInfo.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "id is missing",
    });
  }

  try {
    const deletedNote = await Note.findOneAndDelete({ _id: id, user: userId });

    if (!deletedNote) {
      return res.status(404).json({
        success: false,
        message: "note does not exist with that Id",
      });
    }

    return res.status(200).json({
      success: true,
      message: "note deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* DELETE ALL NOTES (owned by user) */
const deleteAllNotes = async (req, res) => {
  try {
    const userId = req.userInfo && req.userInfo.id;
    const result = await Note.deleteMany({ user: userId });

    return res.status(200).json({
      success: true,
      message:
        result.deletedCount > 0
          ? "all notes deleted successfully"
          : "no notes to delete",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getSingleNote,
  editNote,
  deleteSingleNote,
  deleteAllNotes,
};
