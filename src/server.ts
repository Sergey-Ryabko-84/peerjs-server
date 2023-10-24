import express, { Request, Response } from "express";
import { createServer, Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { controllers } from "./controllers";

dotenv.config();
const PORT = process.env.PORT || 8080;

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Server is running.");
});

app.use(cors);

const httpServer: HttpServer = createServer(app);

const io: Server = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

io.on("connection", (socket: Socket) => {
  console.log(`New User connected: ${socket.id}`);

  controllers(socket);
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
