import { IUser } from "@models/user.model";
import { Socket } from "socket.io";

interface ServerToClientEvents {
    "auth:verified:email": () => void;
}

interface ClientToServerEvents {}

interface InterServerEvents {}

export type ServerToClientEvent = keyof ServerToClientEvents;
export type ClientToServerEvent = keyof ClientToServerEvents;

export { ServerToClientEvents, ClientToServerEvents, InterServerEvents };

export type ISocket = Socket<ServerToClientEvents, ClientToServerEvents>;
