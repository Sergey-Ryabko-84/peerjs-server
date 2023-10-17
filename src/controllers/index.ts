import { Socket } from "socket.io";
import { io, SocketList } from "../server";

export const disconnect = (socket: Socket) => {
  socket.on("disconnect", () => {
    try {
      socket.disconnect();
      console.log("User disconnected!");
    } catch (err) {
      console.log("Error in disconnect: ", err);
    }
  });
};

export const checkUser = (socket: Socket, socketList: SocketList) => {
  socket.on("BE-check-user", async ({ roomId, userName }) => {
    let error = false;

    // Set User List
    try {
      io.of("/")
        .in(roomId)
        .fetchSockets()
        .then((sockets) => {
          sockets.forEach((client) => {
            if (socketList[client.id]?.userName === userName) {
              error = true;
            }
          });
          socket.emit("FE-error-user-exist", { error });
        });
    } catch (error) {
      io.in(roomId).emit("FE-error-user-exist", { err: true });
    }
  });
};

export const joinRoom = (socket: Socket, socketList: SocketList) => {
  socket.on("BE-join-room", async ({ roomId, userName }) => {
    // Socket Join RoomName
    socket.join(roomId);
    socketList[socket.id] = { userName, video: true, audio: true };

    // Set User List
    try {
      const roomSockets = await io.of("/").in(roomId).fetchSockets();
      const users: Array<{
        userId: string;
        info: { userName: string; video: boolean; audio: boolean };
      }> = [];

      for (const client of roomSockets) {
        const socketInfo = socketList[client.id];
        if (socketInfo) {
          users.push({ userId: client.id, info: socketInfo });
        }
      }

      socket.to(roomId).emit("FE-user-join", users);
    } catch (error) {
      io.in(roomId).emit("FE-error-user-exist", { err: true });
    }
  });
};

export const callUser = (socket: Socket, socketList: SocketList) => {
  socket.on("BE-call-user", ({ userToCall, from, signal }) => {
    io.to(userToCall).emit("FE-receive-call", {
      signal,
      from,
      info: socketList[socket.id],
    });
  });
};

export const acceptCall = (socket: Socket) => {
  socket.on("BE-accept-call", ({ signal, to }) => {
    io.to(to).emit("FE-call-accepted", {
      signal,
      answerId: socket.id,
    });
  });
};

export const sendMessage = (socket: Socket) => {
  socket.on("BE-send-message", ({ roomId, msg, sender }) => {
    io.in(roomId).emit("FE-receive-message", { msg, sender });
  });
};

export const leaveRoom = (socket: Socket, socketList: SocketList) => {
  socket.on("BE-leave-room", ({ roomId, leaver }) => {
    delete socketList[socket.id];
    socket.to(roomId).emit("FE-user-leave", { userId: socket.id, userName: [socket.id] });
    socket.leave(roomId);
  });
};

export const toggleCameraAudio = (socket: Socket, socketList: SocketList) => {
  socket.on("BE-toggle-camera-audio", ({ roomId, switchTarget }) => {
    if (switchTarget === "video") {
      socketList[socket.id].video = !socketList[socket.id].video;
    } else {
      socketList[socket.id].audio = !socketList[socket.id].audio;
    }
    socket.to(roomId).emit("FE-toggle-camera", { userId: socket.id, switchTarget });
  });
};
