import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import path from "path";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket: Socket) => {});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Connected : ${PORT}`);
});
