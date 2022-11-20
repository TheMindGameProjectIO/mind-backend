import {IUser} from "@models/user.model";
import {Socket} from "socket.io";

interface ServerToClientEvents {
    'auth:verified:email': () => void;
    // noArg: () => void;
    // basicEmit: (a: number, b: string, c: Buffer) => void;
    // withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    // hello: () => void;
}

interface InterServerEvents {
    // ping: () => void;
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