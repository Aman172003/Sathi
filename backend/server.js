const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const app = express();
var cors = require("cors");

// humare home server ko web socket server se connect kr dega
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("../frontend/src/actions");
const { analyzeError, explainCode } = require("./aiHelpers");
const { streamMessage } = require("./agent");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
// jab bhi humare server par request aaega to  turant build folder ka html file render ho jaega
app.use(express.static(path.join(__dirname, "../frontend/build")));
// jab bhi kuchh load hoga ya phir koi unknown link pe jaega to index file render ho jaega jo react se link hai to koi bhi error nhi aaega
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../frontend", "build", "index.html"));
});

const userSocketMap = {};

function getAllConnectedClients(roomId) {
  // iska data type map hoga
  // io me jiska bhi rom roomId se match kr gya wo hume mil jaega
  // wrna empty array mil jaega
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
}

// jaise hi koi server humare socket server se judega
// socket hum bnaenge socket.js file me
io.on("connection", (socket) => {
  console.log("Socket Connected ", socket.id);
  // jab koi roomId aur username ke sath server par join hoga tab
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    // saare client ko btaenge ki ek naya clint enter hua hau room me
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        // clients ka list
        clients,
        // koun sa client join hua uska username
        username,
        // naye client ka socket id
        socketId: socket.id,
      });
    });
  });

  // jab code change hoga tab ka event listener
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    // jo code change hoga wo saare clients ko chala jaega
    // client se jo hume code milega wahi code hum sabko emit krenge server se
    // socket.in krne se ye parent matlab jo code likh rha hai usko chhod ke baaki clients ko chnage bhej dega
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SEND_MESSAGE, ({ roomId, message }) => {
    socket.in(roomId).emit(ACTIONS.SEND_MESSAGE, { message });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.LANG_CHANGE, ({ roomId, language }) => {
    socket.in(roomId).emit(ACTIONS.LANG_CHANGE, { language });
  });

  socket.on(ACTIONS.SYNC_OUTPUT, ({ roomId, output }) => {
    socket.in(roomId).emit(ACTIONS.SYNC_OUTPUT, { output });
  });

  socket.on(ACTIONS.RUN_CODE, ({ roomId, output }) => {
    // Emit the output to all clients in the room
    socket.in(roomId).emit(ACTIONS.DISPLAY_OUTPUT, { output });
  });

  // AI: Analyze error and provide debugging suggestions
  socket.on(ACTIONS.ANALYZE_ERROR, async ({ roomId, error, language, code }) => {
    console.log("Received ANALYZE_ERROR request for room:", roomId);
    try {
      console.log("Calling analyzeError with language:", language);
      const analysis = await analyzeError(error, language, code);
      console.log("Got analysis, sending to room:", roomId);
      // Send to all clients in the room (including sender)
      io.to(roomId).emit(ACTIONS.ERROR_ANALYSIS_RESULT, {
        analysis,
        error,
      });
    } catch (err) {
      console.error("Error in ANALYZE_ERROR:", err);
      io.to(roomId).emit(ACTIONS.ERROR_ANALYSIS_RESULT, {
        analysis: "Failed to analyze error. Please try again. Error: " + err.message,
        error,
      });
    }
  });

  // AI: Explain selected code
  socket.on(ACTIONS.EXPLAIN_CODE, async ({ roomId, code, language }) => {
    console.log("Received EXPLAIN_CODE request for room:", roomId);
    try {
      console.log("Calling explainCode with language:", language);
      const explanation = await explainCode(code, language);
      console.log("Got explanation, sending to room:", roomId);
      // Send to all clients in the room (including sender)
      io.to(roomId).emit(ACTIONS.CODE_EXPLANATION_RESULT, {
        explanation,
        code,
      });
    } catch (err) {
      console.error("Error in EXPLAIN_CODE:", err);
      io.to(roomId).emit(ACTIONS.CODE_EXPLANATION_RESULT, {
        explanation: "Failed to explain code. Please try again. Error: " + err.message,
        code,
      });
    }
  });

  // AI Agent Chat Handler
  socket.on(ACTIONS.AGENT_MESSAGE, async ({ roomId, message, code, language, output, users }) => {
    console.log("Received AGENT_MESSAGE from room:", roomId);
    try {
      // Build context for the agent
      const context = {
        roomId,
        code,
        language,
        output,
        users,
      };

      // Stream the response
      const agentStream = streamMessage(message, context);

      let fullResponse = "";
      for await (const chunk of agentStream) {
        if (chunk) {
          fullResponse += chunk;
          // Emit chunks for streaming UI
          io.to(roomId).emit(ACTIONS.AGENT_RESPONSE_STREAM, {
            chunk: chunk,
            socketId: socket.id,
          });
        }
      }

      // Signal end of stream
      io.to(roomId).emit(ACTIONS.AGENT_RESPONSE_END, {
        fullResponse,
        socketId: socket.id,
      });
    } catch (err) {
      console.error("Error in AGENT_MESSAGE:", err);
      io.to(roomId).emit(ACTIONS.AGENT_RESPONSE, {
        response: "Error: " + err.message,
        socketId: socket.id,
        error: true,
      });
    }
  });

  // below tab run hoga jab koi client room chhod ke chala jaaye ya browser band kr de
  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave();
  });
});

const PORT = process.env.PORT || 12000;
server.listen(PORT, () => {
  console.log(`Backend Server is Live at port ${PORT}`);
});
