import io from "@socket/setup";
import {ISocket, ServerToClientEvents} from "@socket/types";
import {IUser} from "@models/user.model";

const socketHandler = {
    io,

    save: (socket: ISocket) => {
        socket.join(socket.data.user?._id.toString() as string);
    },

    emitEventToUser: <Ev extends keyof ServerToClientEvents>(user: IUser, event: Ev) => {
        // @ts-ignore
        socketHandler.io.to(user._id.toString()).emit(event);
    }
}

// export function useListenEvent<Ev extends keyof ServerToClientEvents>(event: Ev, listener: ServerToClientEvents[Ev], deps: DependencyList | undefined) {
//     useEffect(() => {
//         socket.connection.on(event, listener as any);
//         return () => {
//             socket.connection.off(event, listener as any);
//         };
//     }, deps);
// }

export default socketHandler;