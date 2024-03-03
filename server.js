const express = require("express");
const app = express();
var cors = require("cors");

// humare home server ko web socket server se connect kr dega
const http = require("http");
const { Server } = require("socket.io");
const ACTIONS = require("./src/actions");
const path = require("path");
const server = http.createServer(app);

const io = new Server(server);

app.use(cors());
// jab bhi humare server par request aaega to  turant build folder ka html file render ho jaega
app.use(express.static("build"));
// jab bhi kuchh load hoga ya phir koi unknown link pe jaega to index file render ho jaega jo react se link hai to koi bhi error nhi aaega
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
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

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
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
