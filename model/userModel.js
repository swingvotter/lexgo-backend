const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  studentId: {
    type: String,
    // uniqueness is enforced only for students via a partial index below
    validate: {
      validator: function (value) {
        // Only require studentId if role is "student"
        if (this.role === "student" && !value) {
          return false;
        }
        return true;
      },
      message: "Student ID is required for students",
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: ["student", "lecturer", "admin"],
    default: "student",
  },
  onboardingCompleted: {
    type: Boolean,
    default: false,
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // reference to courses in the Course collection
    },
  ],
  progress: {
    lessonsCompleted: { type: Number, default: 0 },
    learningStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
  },

  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note", // reference to courses in the Course collection
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Enforce unique studentId only for users whose role is student
userSchema.index(
  { studentId: 1 },
  { unique: true, partialFilterExpression: { role: "student" } }
);

const user = mongoose.model("user", userSchema);
module.exports = user;
