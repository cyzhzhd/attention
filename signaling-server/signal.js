const server = require("http").createServer();
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.emit("sessionID", socket.id);

  socket.on("joinSession", (sessionID) => {
    socket.join(sessionID, () => {
      let rooms = socket.rooms;
      // 방에 있는 유저에게 전달
      Object.values(rooms).forEach((room) => {
        console.log("a user joined session", room);
        socket.to(room).emit("newParticipant");
      });
    });
  });

  socket.on("sendCandidate", (candidate) => {
    let rooms = socket.rooms;
    Object.values(rooms).forEach((room) => {
      socket.to(room).emit("gotCandidate", candidate);
    });
  });

  socket.on("sendOffer", (offer) => {
    let rooms = socket.rooms;
    Object.values(rooms).forEach((room) => {
      socket.to(room).emit("gotOffer", offer);
    });
  });

  socket.on("sendAnswer", (answer) => {
    let rooms = socket.rooms;
    Object.values(rooms).forEach((room) => {
      socket.to(room).emit("gotAnswer", answer);
    });
  });

  socket.on("disconnect", (reason) => {
    console.log("ondisconnect", reason);
  });
});

console.log("start listening");
server.listen(3000);
