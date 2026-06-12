const { ChatGroq } = require("@langchain/groq");
const { tool } = require("@langchain/core/tools");
const { z } = require("zod");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");

// Initialize Groq chat
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "qwen/qwen3-32b",
  temperature: 0.7,
  streaming: true,
});

// Tool 1: Explain Code
const explainCodeTool = tool(
  async (input) => {
    const { code, language } = input;
    const response = await model.invoke([
      {
        role: "user",
        content: `Explain this ${language} code in simple terms. Include what it does and how it works.

\`\`\`${language}
${code}
\`\`\`

Please provide a clear, beginner-friendly explanation.`,
      },
    ]);
    return response.content;
  },
  {
    name: "explain_code",
    description: "Explains selected code snippet in simple terms",
    schema: z.object({
      code: z.string().describe("The code to explain"),
      language: z.string().describe("Programming language of the code"),
    }),
  }
);

// Tool 2: Debug Error
const debugErrorTool = tool(
  async (input) => {
    const { error, language, code } = input;
    const response = await model.invoke([
      {
        role: "user",
        content: `I have a ${language} code error. Please analyze it and suggest fixes.

Error: ${error}

Code:
\`\`\`${language}
${code}
\`\`\`

Please provide:
1. What the error means
2. Why it occurred
3. How to fix it
4. A corrected code snippet if possible`,
      },
    ]);
    return response.content;
  },
  {
    name: "debug_error",
    description: "Analyzes error output and provides debugging suggestions",
    schema: z.object({
      error: z.string().describe("The error message"),
      language: z.string().describe("Programming language"),
      code: z.string().describe("The code that produced the error"),
    }),
  }
);

// Tool 3: General Q&A (can reference code context)
const qaToolGenerator = (context) =>
  tool(
    async (input) => {
      const { question } = input;
      const contextStr =
        context &&
        `Current Room Context:
- Room ID: ${context.roomId}
- Language: ${context.language}
- Users joined: ${context.users.join(", ")}
- Current Code:
\`\`\`${context.language}
${context.code}
\`\`\`
- Output: ${context.output || "None"}

`;

      const response = await model.invoke([
        {
          role: "user",
          content: `${contextStr || ""}Question: ${question}

Please provide a helpful answer.`,
        },
      ]);
      return response.content;
    },
    {
      name: "general_qa",
      description: "Answer general questions, can reference current code context",
      schema: z.object({
        question: z.string().describe("The question to answer"),
      }),
    }
  );

// Create agent executor
async function createCodingAgent(context = null) {
  const tools = [
    explainCodeTool,
    debugErrorTool,
    qaToolGenerator(context),
  ];

  const agent = await createReactAgent({
    llm: model,
    tools,
  });

  return agent;
}

// Process chat message through agent
async function processMessage(message, context = null) {
  try {
    const agent = await createCodingAgent(context);

    const input = { input: message };
    const result = await agent.invoke(input);

    return result.output;
  } catch (error) {
    console.error("Agent error:", error);
    throw error;
  }
}

// Stream message through agent
async function* streamMessage(message, context = null) {
  try {
    const agent = await createCodingAgent(context);

    const input = { input: message };

    // Stream the response
    const stream = await agent.stream(input);

    for await (const chunk of stream) {
      if (chunk.agent && chunk.agent.output) {
        yield chunk.agent.output;
      }
    }
  } catch (error) {
    console.error("Agent streaming error:", error);
    yield `Error: ${error.message}`;
  }
}

module.exports = {
  createCodingAgent,
  processMessage,
  streamMessage,
  explainCodeTool,
  debugErrorTool,
};
