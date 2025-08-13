const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // NEW: pending requests
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  questions: [
    {
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // NEW: course deadline
  deadline: { type: Date, required: true },

  createdAt: { type: Date, default: Date.now },
});

const course = mongoose.model("course", courseSchema);
module.exports = course;
