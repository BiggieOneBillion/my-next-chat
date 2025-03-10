"use strict";
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = createServer(handler);
    const io = new Server(httpServer);
    const onlineUsers = {};
    io.on("connection", (socket) => {
        console.log("Socket connected, ID:", socket.id);
        socket.on("send-message", () => {
            console.log("--------------------MESSAGE SENT---------------------");
        });
        socket.on("join-room", (roomId) => {
            socket.join(roomId);
            console.log(`User ${socket.id} joined room: ${roomId}`);
            io.to(roomId).emit("new-message", {
                sender: "system",
                text: `A new user joined the room`,
                roomId: roomId,
            });
        });
        socket.on("user:connect", (userId) => {
            onlineUsers[userId] = socket.id;
            console.log("-------------USER ONLINE----------------", userId, "SOCKET ID:", socket.id);
            io.emit("users:online", Object.keys(onlineUsers));
        });
        socket.on("disconnect", () => {
            const userId = Object.keys(onlineUsers).find((key) => onlineUsers[key] === socket.id);
            if (userId) {
                delete onlineUsers[userId];
                io.emit("users:online", Object.keys(onlineUsers));
            }
        });
    });
    httpServer
        .once("error", (err) => {
        console.error(err);
        process.exit(1);
    })
        .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
