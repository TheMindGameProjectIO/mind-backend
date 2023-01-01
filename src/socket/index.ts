import io from "@socket/setup";
import { ISocket, ServerToClientEvents } from "@socket/types";
import { IUser } from "@models/user.model";
import { EventParams } from "socket.io/dist/typed-events";

const socketHandler = {
    io,

    userAlreadyExist: (user: IUser) => {
        return io.sockets.adapter.rooms.has(user._id.toString());
    },

    save: (socket: ISocket) => {
        socket.join(socket.data.user?._id.toString() as string);
    },

    delete: (socket: ISocket, message: string = "You were disconnected") => {
        socket.leave(socket.data.user?._id.toString() as string);
        socket.emit("response", "connection", message);
        socket.disconnect();
    },

    emitEventToUser: <Ev extends keyof ServerToClientEvents>(
        user: IUser,
        event: Ev,
        ...params: EventParams<ServerToClientEvents, Ev>
    ) => {
        socketHandler.io.to(user._id.toString()).emit(event, ...params);
    },

    emitTo: <Ev extends keyof ServerToClientEvents>(
        _id: string,
        event: Ev,
        ...params: EventParams<ServerToClientEvents, Ev>
    ) => {
        socketHandler.io.to(_id).emit(event, ...params);
    },
};

// export function useListenEvent<Ev extends keyof ServerToClientEvents>(event: Ev, listener: ServerToClientEvents[Ev], deps: DependencyList | undefined) {
//     useEffect(() => {
//         socket.connection.on(event, listener as any);
//         return () => {
//             socket.connection.off(event, listener as any);
//         };
//     }, deps);
// }

export default socketHandler;
