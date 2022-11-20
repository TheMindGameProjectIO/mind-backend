import {IUser} from "@models/user.model";
import {Socket} from "socket.io";

interface ServerToClientEvents {
    'auth:verified:email': () => void;
}

interface ClientToServerEvents {
}

interface InterServerEvents {
}

interface SocketData {
    user: IUser | null;
}

export {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
}

export type ISocket = Socket<ServerToClientEvents, ClientToServerEvents>