const { llm } = require("../llm");

const SYSTEM_PROMPT =
  "You are a knowledgeable programming assistant embedded in a collaborative code editor. " +
  "Answer questions clearly and helpfully. Reference the current code context when relevant.";

/**
 * Build the user message with full room context attached.
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
  if (context?.users?.length) {
    parts.push(`\n\nCollaborators in this room: ${context.users.join(", ")}`);
  }

  return parts.join("");
}

/**
 * LangGraph node — non-streaming invoke for StateGraph.
 */
async function qaAgent(state) {
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
async function* streamQA(input, context) {
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

module.exports = { qaAgent, streamQA };
