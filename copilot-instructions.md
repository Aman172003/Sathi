# Sathi - Project Context

## Project Overview
**Sathi** is a collaborative real-time code editor with chat functionality. Multiple users can join a room using a room ID, edit code together in real-time, chat with each other, and execute code with synchronized output.

## Tech Stack
- **Frontend**: ReactJS, TailwindCSS, CodeMirror, Socket.io-client, Firebase
- **Backend**: Node.js, Express.js, Socket.io, CORS
- **Database**: Firestore
- **Code Execution**: Online-Code-Compiler API
- **Additional**: React Router, React Hot Toast, React Icons

## Project Structure
```
/workspaces/sathi
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.js
│   │   │   ├── Client.js
│   │   │   ├── Editor.js
│   │   │   ├── EditorPage.js
│   │   │   ├── Footer.js
│   │   │   ├── Home.js
│   │   │   └── Socket.js
│   │   ├── firebase/
│   │   │   └── Config.js
│   │   ├── media/
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

## How to Run Locally

### Option 1: Run Both (Recommended)
```bash
cd frontend
npm install
npm run both
```

### Option 2: Run Separately
**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

**Frontend runs on:** `http://localhost:3000`
**Backend port:** Check `backend/server.js` for the port configuration

## Important Files
- **Frontend Entry**: `frontend/src/index.js`
- **Main App Component**: `frontend/src/App.js`
- **Backend Server**: `backend/server.js`
- **Firebase Config**: `frontend/src/firebase/Config.js`
- **Editor Component**: `frontend/src/components/Editor.js`
- **Chat Component**: `frontend/src/components/Chat.js`
- **Socket Configuration**: `frontend/src/components/Socket.js`

## Environment Setup
- **Backend .env**: May need Firebase credentials or API configuration
- **Frontend**: Firebase credentials should be configured in `frontend/src/firebase/Config.js`
- **Node.js**: v14+ recommended
- **npm**: v6+ recommended

## Common Commands
- `npm run build` (from backend): Installs frontend deps and builds production frontend
- `npm run both` (from frontend): Runs frontend + backend concurrently using nodemon
- `npm start` (backend): Starts Node.js server
- `npm start` (frontend): Starts React dev server

## Known Issues
- Some npm vulnerabilities exist in development dependencies (jest, react-scripts, webpack) but don't affect runtime
- These are inherited from react-scripts and would require major version upgrades to fully resolve

## Development Guidelines
- Socket.io is used for real-time communication between clients
- React Hot Toast is used for notifications
- UUID is used for generating unique room IDs
- Avatar component displays user avatars in rooms
- Always run `npm run both` from frontend directory to start both services
- Firebase must be properly configured before running
