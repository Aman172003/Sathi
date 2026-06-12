# Sathi - Project Context

## Project Overview
**Sathi** is a collaborative real-time code editor with chat functionality and AI-powered debugging. Multiple users can join a room using a room ID, edit code together in real-time, chat with each other, execute code with synchronized output, and get AI assistance for error analysis and code explanation.

## Tech Stack
- **Frontend**: ReactJS, TailwindCSS, CodeMirror, Socket.io-client, Firebase
- **Backend**: Node.js, Express.js, Socket.io, CORS, Groq API, LangGraph
- **Database**: Firestore
- **Code Execution**: Online-Code-Compiler API
- **AI Agent**: LangGraph with Qwen 3 32B model via Groq
- **Additional**: React Router, React Hot Toast, React Icons

## AI Features (NEW - LangGraph Agent)
### Agentic AI Assistant
- Multi-turn conversational chatbot powered by LangGraph
- Pop-up modal interface (like Chat component)
- Full context awareness: code, output, room info, users, languages
- Intelligent tool use:
  - **Code Explanation**: Understand any code snippet
  - **Error Debugging**: Analyze errors and suggest fixes
  - **General Q&A**: Answer questions about code and programming
- Streaming responses for real-time interaction
- Shared conversation history per room
- Uses Qwen 3 32B model via Groq for fast, reasoning-focused responses

## Project Structure
```
/workspaces/sathi
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── aiHelpers.js (Legacy - can be removed)
│   ├── agent.js (NEW - LangGraph agent with tools)
│   ├── .env (requires GROQ_API_KEY)
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.js
│   │   │   ├── Client.js
│   │   │   ├── Editor.js
│   │   │   ├── EditorPage.js (UPDATED - removed old AI buttons)
│   │   │   ├── AiAssistant.js (NEW - conversational chatbot)
│   │   │   ├── Footer.js
│   │   │   ├── Home.js
│   │   │   └── Socket.js
│   │   ├── firebase/
│   │   │   └── Config.js
│   │   ├── media/
│   │   ├── actions.js (UPDATED - new AI agent actions)
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## Key Features
- User-friendly landing page with real-time IDE
- Room-based collaboration (users join via room ID)
- Real-time synchronized code editing
- Live chat between collaborators
- Multiple programming language support
- Code execution with output display synchronized across all clients
- **NEW**: AI error analysis and debugging suggestions
- **NEW**: AI code explanation feature

## How to Run Locally

### Prerequisites
- Node.js v14+ and npm v6+
- Groq API Key (get from https://console.groq.com/keys - free signup at https://console.groq.com/login)

### Setup & Run

1. **Configure backend:**
```bash
cd backend
cp .env.example .env
# Edit .env and add your GROQ_API_KEY from https://console.groq.com/keys
npm install
```

2. **Configure frontend:**
```bash
cd ../frontend
npm install
```

3. **Run both (Recommended):**
```bash
cd frontend
npm run both
```

Or run separately:
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm start
```

**Frontend runs on:** `http://localhost:3000`
**Backend runs on:** `http://localhost:12000` (or check server.js for port)

## Important Files
- **Frontend Entry**: `frontend/src/index.js`
- **Main App Component**: `frontend/src/App.js`
- **Backend Server**: `backend/server.js`
- **AI Helpers**: `backend/aiHelpers.js` (NEW)
- **Firebase Config**: `frontend/src/firebase/Config.js`
- **Editor Component**: `frontend/src/components/Editor.js`
- **Chat Component**: `frontend/src/components/Chat.js`
- **Editor Page**: `frontend/src/components/EditorPage.js` (UPDATED)
- **Socket Configuration**: `frontend/src/components/Socket.js`
- **Actions**: `frontend/src/actions.js` (UPDATED)

## Environment Setup
- **Backend .env**: Must include GROQ_API_KEY for AI features to work (get from https://console.groq.com/keys)
- **Frontend**: Firebase credentials should be configured in `frontend/src/firebase/Config.js`
- **Node.js**: v14+ recommended
- **npm**: v6+ recommended

## Common Commands
- `npm run build` (from backend): Installs frontend deps and builds production frontend
- `npm run both` (from frontend): Runs frontend + backend concurrently using nodemon
- `npm start` (backend): Starts Node.js server with AI capabilities
- `npm start` (frontend): Starts React dev server

## New AI Socket Events
- `ANALYZE_ERROR`: Client sends error output, language, and code to backend
- `ERROR_ANALYSIS_RESULT`: Backend broadcasts AI analysis to all clients in room
- `EXPLAIN_CODE`: Client sends code and language for explanation
- `CODE_EXPLANATION_RESULT`: Backend broadcasts code explanation to all clients in room

## Known Issues
- Some npm vulnerabilities exist in development dependencies (jest, react-scripts, webpack) but don't affect runtime
- These are inherited from react-scripts and would require major version upgrades to fully resolve
- AI API calls may take 2-5 seconds; loading toasts indicate processing
- Groq free tier is very generous with no per-request rate limits; if you experience throttling, ensure your API key is properly configured

## Groq LLM Models Used
- **Error Debugging**: `qwen/qwen3-32b` (excellent for code analysis and reasoning)
- **Code Explanation**: `qwen/qwen3-32b` (great for technical explanations)
- **Alternative models available**: `llama-3.3-70b-versatile`, `deepseek-r1-distill-llama-70b`, `gemma2-9b-it`

## Development Guidelines
- Socket.io is used for real-time communication between clients
- React Hot Toast is used for notifications
- UUID is used for generating unique room IDs
- Avatar component displays user avatars in rooms
- Always run `npm run both` from frontend directory to start both services
- Google Geminise must be properly configured before running
- OpenAI API key must be set in .env for AI features to work
- AI panel appears at bottom-right when analysis/explanation is ready
- All room members see AI analysis/explanations in real-time

