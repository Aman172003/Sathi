const OpenAI = require("openai");

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY not found in environment variables");
      return null;
    }
    console.log("Groq API Key loaded: ✓");
    client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1"
    });
  }
  return client;
}

/**
 * Analyzes error output and provides debugging suggestions
 * @param {string} error - The error message from code execution
 * @param {string} language - The programming language
 * @param {string} code - The code that produced the error
 * @returns {Promise<string>} - AI analysis and fix suggestions
 */
async function analyzeError(error, language, code) {
  try {
    const client = getClient();
    if (!client)
      return "API key not configured. Please set GROQ_API_KEY in .env";

    const prompt = `I have a ${language} code error. Please analyze it and suggest fixes.

Error: ${error}

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. What the error means
2. Why it occurred
3. How to fix it
4. A corrected code snippet if possible`;

    const result = await client.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    });
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error analyzing code error:", error);
    return "Sorry, I couldn't analyze this error. Please check the error message and code manually.";
  }
}

/**
 * Explains selected code snippet
 * @param {string} code - The code to explain
 * @param {string} language - The programming language
 * @returns {Promise<string>} - AI explanation of the code
 */
async function explainCode(code, language) {
  try {
    const client = getClient();
    if (!client)
      return "API key not configured. Please set GROQ_API_KEY in .env";

    const prompt = `Explain this ${language} code in simple terms. Include what it does and how it works.

\`\`\`${language}
${code}
\`\`\`

Please provide a clear, beginner-friendly explanation.`;

    const result = await client.chat.completions.create({
      model: "qwen/qwen3-32b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024
    });
    return result.choices[0].message.content;
  } catch (error) {
    console.error("Error explaining code:", error);
    return "Sorry, I couldn't explain this code. Please try again later.";
  }
}

module.exports = {
  analyzeError,
  explainCode,
};
