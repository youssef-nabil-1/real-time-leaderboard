import { Server } from "socket.io";

let io;

export const initSocket = (httpServer, opts) => {
    io = new Server(httpServer, opts);

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
