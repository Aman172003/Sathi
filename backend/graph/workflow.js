const { StateGraph, END } = require("@langchain/langgraph");
const { supervisorAgent } = require("../agents/supervisorAgent");
const { explainerAgent } = require("../agents/explainerAgent");
const { debuggerAgent } = require("../agents/debuggerAgent");
const { qaAgent } = require("../agents/qaAgent");

/**
 * Conditional edge function — routes to the agent node chosen by supervisor.
 */
function routeAfterSupervisor(state) {
  return state.agentType || "qa";
}

/**
 * Build and compile the multi-agent StateGraph.
 * Compatible with @langchain/langgraph 0.0.x channel format.
 *
 * Flow:
 *   supervisor → (explain | debug | qa) → END
 */
function buildWorkflow() {
  // In langgraph 0.0.x, channels use reducer/default objects.
  // A null reducer means "last write wins".
  const channels = {
    input: {
      value: (x, y) => (y !== undefined ? y : x),
      default: () => "",
    },
    context: {
      value: (x, y) => (y !== undefined ? y : x),
      default: () => null,
    },
    agentType: {
      value: (x, y) => (y !== undefined ? y : x),
      default: () => "qa",
    },
    response: {
      value: (x, y) => (y !== undefined ? y : x),
      default: () => "",
    },
  };

  const workflow = new StateGraph({ channels });

  // Nodes
  workflow.addNode("supervisor", supervisorAgent);
  workflow.addNode("explain", explainerAgent);
  workflow.addNode("debug", debuggerAgent);
  workflow.addNode("qa", qaAgent);

  // Entry point
  workflow.setEntryPoint("supervisor");

  // Conditional routing after supervisor classifies the request
  workflow.addConditionalEdges("supervisor", routeAfterSupervisor, {
    explain: "explain",
    debug: "debug",
    qa: "qa",
  });

  // Terminal edges
  workflow.addEdge("explain", END);
  workflow.addEdge("debug", END);
  workflow.addEdge("qa", END);

  return workflow.compile();
}

const app = buildWorkflow();

module.exports = { app };
