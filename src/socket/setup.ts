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
import { connection as pubClient } from "@/redisDB/setup";
import { IUser } from "@/models/user.model";
import logger from "@/setups/winston";

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
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ['Access-Control-Allow-Origin', 'ngrok-skip-browser-warning'],
    exposedHeaders: ['Access-Control-Allow-Origin', 'ngrok-skip-browser-warning'],
    credentials: true,
  },
});
io.adapter(createAdapter(pubClient, subClient));

io.use(async (socket, next) => {
  logger.info(`new socket connection ${socket.id} is being processed`);

  /**
   * nobody can connect without a special token
   */
  if (!socket.handshake.auth.token){
    logger.error(`socket connection ${socket.id} is rejected due to no token`);
    return next(new Error("Authentication error"));
  }

  try {
    /**
     * payload should have all fields that are required in `ISocketAuthPayload`
     */
    // const { _id } = jwt.verify(socket.handshake.auth.token as string, env.SECRET_KEY) as ISocketAuthPayload;
    const { _id, data, type } = verifySocketToken<any>(
      socket.handshake.auth.token
    );

    if (!_id){
      logger.error(`socket connection ${socket.id} is rejected due to invalid token (no _id)`);
       next(new Error("Authentication error"))
      };

    /**
     * user may or may not exist.
     *
     * if not, then socket connection will be processed as anonymous
     *
     * if yes, then socket connection will be processed as authenticated
     */
    let userEntity: IUser = await User.findById(_id);
    if (!userEntity) {
      userEntity = { _id} as IUser
      logger.warn(`socket connection ${socket.id} is processed as anonymous`);
    } else {
      logger.info(`socket connection ${socket.id} is processed as authenticated`);
    }
    socket.data = new SocketData(userEntity, type, data);
    next();
  } catch (e) {
    next(new Error("Authentication error"));
  }
}).on("connection", (socket: ISocket) => {

  socketHandler.save(socket);

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

io.listen(env.SOCKET_PORT);
console.log(`socket server ready to start on port ${env.SOCKET_PORT}`);

export default io;

