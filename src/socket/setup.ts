import http from "http";
import app from "@setups/rest";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { IAuthPayload, ISocketAuthPayload } from "@models/payload.model";
import env from "@utils/env";
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents } from "@/socket/types";
import User from "@schemas/user.schema";
import { getCurrentDate } from "@utils/datetime";
import socketHandler from "@socket/index";
import { SocketData } from "./classes";

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"],
    },
});

io.use(async (socket, next) => {
    console.log("authenticating socket");

    /**
     * nobody can connect without a special token
     */
    if (!socket.handshake.auth.token) return next(new Error("Authentication error"));

    try {
        /**
         * payload should have all fields that are required in `ISocketAuthPayload`
         */
        const { _id } = jwt.verify(socket.handshake.auth.token as string, env.SECRET_KEY) as ISocketAuthPayload;
        if (!_id) next(new Error("Authentication error"));

        /**
         * user may or may not exist.
         *
         * if not, then socket connection will be processed as anonymous
         *
         * if yes, then socket connection will be processed as authenticated
         */
        const userEntity = await User.findById(_id);
        socket.data = new SocketData(userEntity || { _id });
    } catch (e) {
        next(new Error("Authentication error"));
    }
}).on("connection", (socket: Socket) => {
    socketHandler.save(socket);
    console.log("a user connected");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("ping", () => {
        console.log("ping", getCurrentDate());
        socket.emit("pong");
    });
});

console.log(`socket server ready to start on port ${env.SOCKET_PORT}`);
io.listen(env.SOCKET_PORT);

export default io;
