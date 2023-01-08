import { ISocketAuthPayloadData } from "@/models/payload.model";
import { ISocketAuthType } from "@/utils/enum";
import { IUser } from "@models/user.model";
import { Socket } from "socket.io";
import { SocketData } from "./classes";
import Player from "@redisDB/schemas/Player";

export interface ServerToClientEvents {
  "auth:verified:email": () => void;
  "auth:verified:password:reset": ({ token }: { token: string }) => void;
  ping: () => void;
  pong: () => void;
  "game:self:joined": () => void;
  "game:created": () => void;
  message: (message: string) => void;
  response: (event: keyof ClientToServerEvents, response: {message: string, status: "success" | "fail"}) => void;
  "game:player:joined": () => void;
  "game:player:left": () => void;
  "game:self:left": () => void;
  "game:started": () => void;
}

export interface ClientToServerEvents {
  ping: () => void;
  pong: () => void;
  "game:start": () => void;
  "connection": () => void;
  "game:player:joined": () => void;
}

export interface InterServerEvents {}

export type ServerToClientEvent = keyof ServerToClientEvents;

export type ClientToServerEvent = keyof ClientToServerEvents;

export type ISocket<AdditionalSocketData = {}> = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData<AdditionalSocketData>
>;


export type IGameSocket = ISocket<ISocketAuthPayloadData[ISocketAuthType.GAME]>;