const { llm } = require("../llm");

const SYSTEM_PROMPT =
  "You are an expert code explanation agent embedded in a collaborative code editor. " +
  "Explain code clearly and concisely. Describe what it does, how it works, and any " +
  "important patterns or concepts used. Target developers of all levels.";

/**
 * Build the user message with room context attached.
 */
function buildUserMessage(input, context) {
  const parts = [input];

  if (context?.code) {
    parts.push(
      `\n\nCurrent code in the editor (${context.language}):\n\`\`\`${context.language}\n${context.code}\n\`\`\``
    );
  }
  if (context?.output) {
    parts.push(`\n\nProgram output:\n${context.output}`);
  }

  return parts.join("");
}

/**
 * LangGraph node — non-streaming invoke for StateGraph.
 */
async function explainerAgent(state) {
  const { input, context } = state;
  const response = await llm.invoke([
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: buildUserMessage(input, context) },
  ]);
  return { ...state, response: response.content };
}

/**
 * Async generator — token-level streaming for direct use.
 */
async function* streamExplainer(input, context) {
  const history = (context?.history || []).map((m) => ({
    role: m.role,
    content: m.content,
  }));
  const stream = await llm.stream([
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: buildUserMessage(input, context) },
  ]);
  for await (const chunk of stream) {
    if (chunk.content) yield chunk.content;
  }
}

module.exports = { explainerAgent, streamExplainer };
