"use strict";

// import * as http from "http";
// import * as socketIO from "socket.io";
// const server = http.createServer();
// const io = socketIO(server);
const server = require("http").createServer();
const ioServer = require("socket.io")(server);

ioServer.sockets.on("connection", function (socket) {
  console.log("user connected", socket.id);
  socket.emit("sessionID", socket.id);

  function log(...message: string[]) {
    const array = ["Message from server:"];
    array.push.apply(array, message);
    socket.emit("log", array);
  }

  socket.on("message", function (message) {
    log("Client said: ", message);
    socket.to(message.room).emit("message", message);
  });

  socket.on("create or join", function (room: string) {
    log("Received request to create or join room" + room);

    const clientsInRoom: SocketIO.Room = ioServer.sockets.adapter.rooms[room];
    const numClients = clientsInRoom
      ? Object.keys(clientsInRoom.sockets).length
      : 0;
    log(`${room} now has ${numClients + 1} client(s)`);

    if (numClients === 0) {
      socket.join(room);
      log(`${socket.id} created ${room}`);
      socket.emit("created", room, socket.id);
    } else {
      socket.join(room);
      log(`${socket.id} joined ${room}`);
      ioServer.sockets.in(room).emit("joined", room, socket.id);
    }
  });
});

console.log("start listening");
server.listen(3000);
