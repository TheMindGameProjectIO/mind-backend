import http from "http";
import app from "@setups/rest";
import { Server } from "socket.io";
import env from "@utils/env";
import {
  ClientToServerEvents,
  IGameSocket,
  InterServerEvents,
  ISocket,
  ServerToClientEvents,
} from "@/socket/types";
import User from "@schemas/user.schema";
import { getCurrentDate } from "@utils/datetime";
import socketHandler from "@socket/index";
import { SocketData } from "./classes";
import { verifySocketToken } from "@/utils/token";
import gameHandler from "./src/handlers/game.handler";
import { ISocketAuthType } from "@/utils/enum";
import { createAdapter } from "@socket.io/redis-adapter";
import { connection as pubClient } from "@setups/redis";

const subClient = pubClient.duplicate();
const server = http.createServer(app);

pubClient.on("error", (err) => {
  console.log(err.message);
});

subClient.on("error", (err) => {
  console.log(err.message);
});

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  cors: {
    origin: ["*"],
  },
});
io.adapter(createAdapter(pubClient, subClient));

io.use(async (socket, next) => {
  console.log("authenticating socket");

  /**
   * nobody can connect without a special token
   */
  if (!socket.handshake.auth.token)
    return next(new Error("Authentication error"));

  try {
    /**
     * payload should have all fields that are required in `ISocketAuthPayload`
     */
    // const { _id } = jwt.verify(socket.handshake.auth.token as string, env.SECRET_KEY) as ISocketAuthPayload;
    const { _id, data, type } = verifySocketToken<any>(
      socket.handshake.auth.token
    );
    if (!_id) next(new Error("Authentication error"));

    /**
     * user may or may not exist.
     *
     * if not, then socket connection will be processed as anonymous
     *
     * if yes, then socket connection will be processed as authenticated
     */
    const userEntity = await User.findById(_id);
    socket.data = new SocketData(userEntity || { _id }, type, data);
  } catch (e) {
    next(new Error("Authentication error"));
  }
}).on("connection", (socket: ISocket) => {
  socketHandler.save(socket);
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("ping", () => {
    console.log("ping", getCurrentDate());
    socket.emit("pong");
  });

  socket.data.type === ISocketAuthType.GAME &&
    gameHandler(socket as IGameSocket);
});

console.log(`socket server ready to start on port ${env.SOCKET_PORT}`);
io.listen(env.SOCKET_PORT);

export default io;
