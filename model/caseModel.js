const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  AISummary: { type: String, required: true },
  citation: {
    year: { type: Date, required: true },
    lawReport: { type: String, required: true },
    page: { type: Number, required: true },
    landmark: { type: Boolean, default: false },
  },
  legalIssue: [{ type: String, required: true }],
  legalPrinciple: [
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
    },
  ],
  areaOfLaw: { type: String },
  quiz: [
    {
      question: { type: String },
      answers: [{ type: String }],
      correctAnswer: { type: String },
    },
  ],
  numQuizGenerated: { type: Number },
});

module.exports = mongoose.model("Case", caseSchema);
