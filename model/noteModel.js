const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: { type: String, required: [true, "title is a required field"] },
  legalTopic: {
    type: String,
    required: [true, "legalTopic is a required field"],
  },
  importanceLevel: {
    type: String,
    enum: ["Low Priority", "Medium Priority", "High Priority"],
    required: [true, "importance level is a required field"],
  },
  content: { type: String, required: [true, "content is a required field"] },
  tags: [{ type: String, required: [true, "tag is a required field"] }],
  createdAt: { type: Date, default: Date.now },
});

// Avoid duplicate titles per user for scale and data consistency
noteSchema.index({ user: 1, title: 1 }, { unique: true });

module.exports = mongoose.model("Note", noteSchema);
