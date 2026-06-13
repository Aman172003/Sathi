const { supervisorAgent } = require("./agents/supervisorAgent");
const { streamExplainer } = require("./agents/explainerAgent");
const { streamDebugger } = require("./agents/debuggerAgent");
const { streamQA } = require("./agents/qaAgent");

// Map agentType → streaming generator function
const AGENT_STREAMERS = {
  explain: streamExplainer,
  debug: streamDebugger,
  qa: streamQA,
};

/**
 * processMessage — collects full streaming response into a string.
 */
async function processMessage(message, context = null) {
  let full = "";
  for await (const chunk of streamMessage(message, context)) {
    full += chunk;
  }
  return full;
}

/**
 * streamMessage — token-level streaming.
 * 1. Supervisor classifies the request synchronously (keyword-based, no API call).
 * 2. Delegates to the matching agent's streaming generator.
 * 3. Yields tokens as they arrive from the LLM.
 */
async function* streamMessage(message, context = null) {
  try {
    const { agentType } = supervisorAgent({ input: message, context });
    console.log(`[Agent] Routed to: ${agentType}`);

    const streamer = AGENT_STREAMERS[agentType] || streamQA;

    for await (const chunk of streamer(message, context)) {
      yield chunk;
    }
  } catch (error) {
    console.error("Agent streaming error:", error);
    yield `Error: ${error.message}`;
  }
}

module.exports = {
  processMessage,
  streamMessage,
};
