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

module.exports = generateAISummary;
