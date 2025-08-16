const Case = require("../model/caseModel");
const { generateAISummary, generateQuizQuestions } = require("../helper/AIhelper");

/* CREATE CASE */
const createCase = async (req, res) => {
  try {
    const { title, citation, legalIssue, legalPrinciple, areaOfLaw } = req.body;

    if (
      !title ||
      !Array.isArray(legalPrinciple) ||
      legalPrinciple.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "title and legalPrinciple[] are required",
      });
    }

    // Validate citation object
    if (
      !citation ||
      typeof citation !== "object" ||
      citation.year === undefined ||
      citation.lawReport === undefined ||
      citation.page === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "citation is required and must include year, lawReport, and page",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OPENAI_API_KEY is not configured on the server",
      });
    }

    const AISummary = await generateAISummary(legalPrinciple);

    const created = await Case.create({
      title,
      AISummary,
      citation,
      legalIssue,
      legalPrinciple,
      areaOfLaw,
    });

    return res.status(201).json({
      success: true,
      message: "case created successfully",
      case: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* GET ALL CASES */
const getAllCases = async (req, res) => {
  try {
    const cases = await Case.find({}).sort({ _id: -1 });
    return res.status(200).json({
      success: true,
      cases,
      total: cases.length,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

/* GET SINGLE CASE */
const getSingleCase = async (req, res) => {
  const { id } = req.params;
  try {
    const found = await Case.findById(id);
    if (!found) {
      return res
        .status(404)
        .json({ success: false, message: "case not found" });
    }
    return res.status(200).json({ success: true, case: found });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

/* UPDATE CASE */
const updateCase = async (req, res) => {
  const { id } = req.params;
  const { title, legalIssue, legalPrinciple, areaOfLaw } = req.body;
  try {
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (legalIssue !== undefined) updates.legalIssue = legalIssue;
    if (areaOfLaw !== undefined) updates.areaOfLaw = areaOfLaw;

    // Support partial updates for citation via either nested object or dot-paths
    const allowedCitationFields = ["year", "lawReport", "page", "landmark"];
    if (req.body.citation && typeof req.body.citation === "object") {
      for (const key of allowedCitationFields) {
        if (req.body.citation[key] !== undefined) {
          updates[`citation.${key}`] = req.body.citation[key];
        }
      }
    }
    for (const key of allowedCitationFields) {
      const pathKey = `citation.${key}`;
      if (req.body[pathKey] !== undefined) {
        updates[pathKey] = req.body[pathKey];
      }
    }

    // If legalPrinciple provided, regenerate AISummary
    if (legalPrinciple !== undefined) {
      if (!Array.isArray(legalPrinciple) || legalPrinciple.length === 0) {
        return res.status(400).json({
          success: false,
          message: "legalPrinciple must be a non-empty array",
        });
      }
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({
          success: false,
          message: "OPENAI_API_KEY is not configured on the server",
        });
      }
      const AISummary = await generateAISummary(legalPrinciple);
      updates.legalPrinciple = legalPrinciple;
      updates.AISummary = AISummary;
    }

    const updated = await Case.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "case not found" });
    }
    return res.status(200).json({
      success: true,
      message: "case updated successfully",
      case: updated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

/* DELETE CASE */
const deleteCase = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Case.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "case not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "case deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

/* GENERATE QUIZ FOR CASE */
const generateQuiz = async (req, res) => {
  const { id } = req.params;
  const { numQuizGenerated } = req.body;

  try {
    // Validate numQuizGenerated
    if (!numQuizGenerated || typeof numQuizGenerated !== 'number' || numQuizGenerated < 1 || numQuizGenerated > 50) {
      return res.status(400).json({
        success: false,
        message: "numQuizGenerated must be a number between 1 and 50",
      });
    }

    // Find the case
    const caseData = await Case.findById(id);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check if case has legal principles
    if (!caseData.legalPrinciple || caseData.legalPrinciple.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Case must have legal principles to generate quiz",
      });
    }

    // Check if quiz already exists for this case
    if (caseData.quiz && caseData.quiz.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Quiz already exists for this case. Use the get quiz endpoint to retrieve it.",
        existingQuiz: {
          numQuestions: caseData.quiz.length,
          numQuizGenerated: caseData.numQuizGenerated
        }
      });
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OPENAI_API_KEY is not configured on the server",
      });
    }

    // Generate quiz questions
    const quizQuestions = await generateQuizQuestions(caseData.legalPrinciple, numQuizGenerated);

    // Update the case with the generated quiz
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        quiz: quizQuestions,
        numQuizGenerated: numQuizGenerated
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Quiz generated successfully",
      quiz: updatedCase.quiz,
      numQuizGenerated: updatedCase.numQuizGenerated,
      caseTitle: updatedCase.title
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* GET QUIZ FOR CASE */
const getQuiz = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the case and only return quiz-related fields
    const caseData = await Case.findById(id).select('title quiz numQuizGenerated');
    
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check if quiz exists
    if (!caseData.quiz || caseData.quiz.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No quiz found for this case. Generate quiz first.",
      });
    }

    return res.status(200).json({
      success: true,
      quiz: caseData.quiz,
      numQuizGenerated: caseData.numQuizGenerated,
      caseTitle: caseData.title,
      totalQuestions: caseData.quiz.length
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* REGENERATE QUIZ FOR CASE */
const regenerateQuiz = async (req, res) => {
  const { id } = req.params;
  const { numQuizGenerated } = req.body;

  try {
    // Validate numQuizGenerated
    if (!numQuizGenerated || typeof numQuizGenerated !== 'number' || numQuizGenerated < 1 || numQuizGenerated > 50) {
      return res.status(400).json({
        success: false,
        message: "numQuizGenerated must be a number between 1 and 50",
      });
    }

    // Find the case
    const caseData = await Case.findById(id);
    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check if case has legal principles
    if (!caseData.legalPrinciple || caseData.legalPrinciple.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Case must have legal principles to generate quiz",
      });
    }

    // Check OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "OPENAI_API_KEY is not configured on the server",
      });
    }

    // Generate new quiz questions
    const quizQuestions = await generateQuizQuestions(caseData.legalPrinciple, numQuizGenerated);

    // Update the case with the new quiz (replacing existing one)
    const updatedCase = await Case.findByIdAndUpdate(
      id,
      {
        quiz: quizQuestions,
        numQuizGenerated: numQuizGenerated
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Quiz regenerated successfully",
      quiz: updatedCase.quiz,
      numQuizGenerated: updatedCase.numQuizGenerated,
      caseTitle: updatedCase.title
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = {
  createCase,
  getAllCases,
  getSingleCase,
  updateCase,
  deleteCase,
  generateQuiz,
  getQuiz,
  regenerateQuiz,
};
