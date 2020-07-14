"use strict";
const socket = ioServer("http://localhost:3000", {
  autoConnect: false,
}).connect();

const room = "testing";

socket.emit("test", "please!");

socket.on("sessionID", function (id) {
  console.log("session id is ", id);
});

socket.on("test return", function (message) {
  console.log("test return ", message);
});

socket.emit("create or join", room);

socket.on("log", function (array) {
  console.log.apply(console, array);
});

socket.on("joined", function (room, socketId) {
  console.log(`${socketId} joined ${room}`);
  console.log("왜 못 받니 ...");
});

socket.on("why", function (string) {
  console.log(string);
});
console.log("started");
