/**
 * Supervisor Agent
 * Routes user requests to the appropriate specialized agent using
 * keyword-based classification (fast, no extra LLM call).
 *
 * agentType values: "explain" | "debug" | "qa"
 */
function supervisorAgent(state) {
  const { input } = state;
  const lower = input.toLowerCase();

  let agentType;

  // Debug patterns — error/fix-related language
  if (
    /\b(error|bug|fix|debug|not working|crash|fail|exception|undefined|null|traceback|stack trace|typeerror|syntaxerror|referenceerror|cannot read|is not a function|nan|broken|wrong output|incorrect)\b/.test(
      lower
    )
  ) {
    agentType = "debug";
  }
  // Explain patterns — comprehension-seeking language
  else if (
    /\b(explain|what does|how does|what is|describe|understand|meaning|clarify|walk me through|what are|how is|tell me about)\b/.test(
      lower
    )
  ) {
    agentType = "explain";
  }
  // Default: general programming Q&A
  else {
    agentType = "qa";
  }

  return { ...state, agentType };
}

module.exports = { supervisorAgent };
