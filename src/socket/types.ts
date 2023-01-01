import { ISocketAuthPayloadData } from "@/models/payload.model";
import { ISocketAuthType } from "@/utils/enum";
import { IUser } from "@models/user.model";
import { Socket } from "socket.io";
import { SocketData } from "./classes";

export interface ServerToClientEvents {
  "auth:verified:email": () => void;
  "auth:verified:password:reset": ({ token }: { token: string }) => void;
  ping: () => void;
  pong: () => void;
  "game:self:joined": () => void;
  "game:created": () => void;
  message: (message: string) => void;
  response: (event: keyof ClientToServerEvents, response: string) => void;
}

export interface ClientToServerEvents {
  ping: () => void;
  pong: () => void;
  "game:start": () => void;
  "connection": () => void;
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