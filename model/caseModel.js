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
  legalPrinciple: [{ type: String, required: true }],
});

module.exports = mongoose.model("Case", caseSchema);
