import express, { Request, Response } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import * as controllers from "./controllers";

export interface SocketList {
  [key: string]: { userName: string; video: boolean; audio: boolean };
}

const app = express();
const httpServer: HttpServer = createServer(app);
export const io: Server = new Server(httpServer);

const socketList: SocketList = {};
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running.");
});

io.on("connection", (socket: Socket) => {
  console.log(`New User connected: ${socket.id}`);

  controllers.checkUser(socket, socketList);
  controllers.joinRoom(socket, socketList);
  controllers.callUser(socket, socketList);
  controllers.acceptCall(socket);
  controllers.sendMessage(socket);
  controllers.leaveRoom(socket, socketList);
  controllers.toggleCameraAudio(socket, socketList);
  controllers.disconnect(socket);
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
