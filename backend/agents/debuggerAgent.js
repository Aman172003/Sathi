const { llm } = require("../llm");

const SYSTEM_PROMPT =
  "You are an expert debugging agent embedded in a collaborative code editor. " +
  "Analyze errors carefully, explain what went wrong and why, then provide a " +
  "corrected code snippet. Structure your response as:\n" +
  "1. What the error means\n" +
  "2. Why it occurred\n" +
  "3. How to fix it\n" +
  "4. Corrected code (if applicable)";

/**
 * Build the user message with full error context attached.
 */
function buildUserMessage(input, context) {
  const parts = [input];

  if (context?.code) {
    parts.push(
      `\n\nCode (${context.language}):\n\`\`\`${context.language}\n${context.code}\n\`\`\``
    );
  }
  if (context?.output) {
    parts.push(`\n\nError / Output:\n${context.output}`);
  }

  return parts.join("");
}

/**
 * LangGraph node — non-streaming invoke for StateGraph.
 */
async function debuggerAgent(state) {
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
async function* streamDebugger(input, context) {
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

module.exports = { debuggerAgent, streamDebugger };
