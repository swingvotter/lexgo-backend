const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateAISummary = async (legalPrinciples) => {
  if (!Array.isArray(legalPrinciples) || legalPrinciples.length === 0) {
    throw new Error("legalPrinciple must be a non-empty array");
  }

  const joinedPrinciples = legalPrinciples
    .filter(Boolean)
    .map((principle) => {
      if (typeof principle === 'object' && principle.content) {
        return principle.content;
      }
      return String(principle);
    })
    .join("\n- ");

  const prompt = `Summarize the following legal principles into a concise, plain-English paragraph (3-6 sentences). Avoid repetition and focus on the core holdings and rules. If multiple principles overlap, merge them logically.\n\nLegal principles:\n- ${joinedPrinciples}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a legal assistant. Produce accurate, concise summaries, suitable for law students. Avoid hedging and citations.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 250,
    });

    const summary = completion.choices?.[0]?.message?.content?.trim();
    if (!summary) {
      throw new Error("Failed to generate summary");
    }
    return summary;
  } catch (err) {
    throw new Error(err.message || "AI summary generation failed");
  }
};

const generateQuizQuestions = async (legalPrinciples, numQuestions) => {
  if (!Array.isArray(legalPrinciples) || legalPrinciples.length === 0) {
    throw new Error("legalPrinciples must be a non-empty array");
  }

  if (!numQuestions || numQuestions < 1 || numQuestions > 50) {
    throw new Error("numQuestions must be between 1 and 50");
  }

  // Extract content from legal principles
  const principlesContent = legalPrinciples
    .filter(Boolean)
    .map((principle) => {
      if (typeof principle === 'object' && principle.title && principle.content) {
        return `${principle.title}: ${principle.content}`;
      }
      return String(principle);
    })
    .join("\n\n");

  const prompt = `Based STRICTLY on the following legal principles, generate exactly ${numQuestions} multiple-choice quiz questions. Each question must:

1. Be directly based on the legal principles provided below
2. Have exactly 4 possible answers (A, B, C, D)
3. Have only one correct answer
4. Test understanding of the legal concepts, rules, or applications mentioned in the principles
5. Be clear and unambiguous

Legal Principles:
${principlesContent}

Format your response as a JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "answers": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A"
  }
]

IMPORTANT: 
- Generate exactly ${numQuestions} questions, no more, no less
- Base questions ONLY on the legal principles provided above
- Ensure the correctAnswer exactly matches one of the answers in the answers array
- Do not include any text outside the JSON array`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a legal education assistant. Generate accurate multiple-choice questions based strictly on the provided legal principles. Always respond with valid JSON format only."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices?.[0]?.message?.content?.trim();
    if (!response) {
      throw new Error("Failed to generate quiz questions");
    }

    // Parse the JSON response
    let quizQuestions;
    try {
      quizQuestions = JSON.parse(response);
    } catch (parseError) {
      throw new Error("Invalid JSON response from AI");
    }

    // Validate the response structure
    if (!Array.isArray(quizQuestions) || quizQuestions.length !== numQuestions) {
      throw new Error(`Expected exactly ${numQuestions} questions, got ${quizQuestions?.length || 0}`);
    }

    // Validate each question structure
    for (const question of quizQuestions) {
      if (!question.question || !Array.isArray(question.answers) || 
          question.answers.length !== 4 || !question.correctAnswer) {
        throw new Error("Invalid question structure");
      }
      
      // Ensure correctAnswer is one of the answers
      if (!question.answers.includes(question.correctAnswer)) {
        throw new Error("Correct answer must be one of the provided answers");
      }
    }

    return quizQuestions;
  } catch (err) {
    throw new Error(`Quiz generation failed: ${err.message}`);
  }
};

module.exports = { generateAISummary, generateQuizQuestions };
