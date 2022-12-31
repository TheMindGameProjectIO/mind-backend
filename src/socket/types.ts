import { ISocketAuthPayloadData } from "@/models/payload.model";
import { ISocketAuthType } from "@/utils/enum";
import { IUser } from "@models/user.model";
import { Socket } from "socket.io";
import { SocketData } from "./classes";

interface ServerToClientEvents {
  "auth:verified:email": () => void;
  "auth:verified:password:reset": ({ token }: { token: string }) => void;
  ping: () => void;
  pong: () => void;
  "game:self:joined": () => void;
}

interface ClientToServerEvents {
  ping: () => void;
  pong: () => void;
}

interface InterServerEvents {}

export type ServerToClientEvent = keyof ServerToClientEvents;
export type ClientToServerEvent = keyof ClientToServerEvents;

export { ServerToClientEvents, ClientToServerEvents, InterServerEvents };

export type ISocket<AdditionalSocketData = {}> = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData<AdditionalSocketData>
>;


export type IGameSocket = ISocket<ISocketAuthPayloadData[ISocketAuthType.GAME]>;