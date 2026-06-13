const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const { ChatGroq } = require("@langchain/groq");

let _llm = null;

function getLLM() {
  if (!_llm) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        "GROQ_API_KEY is not set. Create backend/.env with your key from https://console.groq.com/keys"
      );
    }
    _llm = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      streaming: true,
    });
  }
  return _llm;
}

// Proxy object so existing `llm.invoke()` / `llm.stream()` calls still work
const llm = new Proxy(
  {},
  {
    get(_, prop) {
      return (...args) => getLLM()[prop](...args);
    },
  }
);

module.exports = { llm };
