import http from "http";
import app from "@setups/rest";
import {Server, Socket} from "socket.io";
import jwt from "jsonwebtoken";
import {IAuthPayload} from "@models/payload.model";
import env from "@utils/env";
import {ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData} from "@/socket/types";
import User from "@schemas/user.schema";
import {getCurrentDate} from "@utils/datetime";
import socketHandler from "@socket/index";

const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
        origin: ['http://localhost:3000', "http://localhost:5173"],
    }
});


io.use(async (socket, next) => {
    console.log('authenticating socket');
    if (!socket.handshake.auth.token) return next(new Error('Authentication error'));
    try {
        console.log(socket.handshake.auth);
        const {_id} = jwt.verify(socket.handshake.auth.token as string, env.SECRET_KEY) as IAuthPayload;
        if (!_id) next(new Error('Authentication error'));
        socket.data.user = await User.findById(_id);
        next();
    } catch (e) {
        next(new Error('Authentication error'));
    }
})
    .on('connection', (socket: Socket) => {
        socketHandler.save(socket);
        console.log('a user connected');

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });

        socket.on('ping', () => {
            console.log('ping', getCurrentDate());
            socket.emit('pong');
        })
    });

console.log("socket server ready to start on port 8000");
io.listen(3000);
export default io;

