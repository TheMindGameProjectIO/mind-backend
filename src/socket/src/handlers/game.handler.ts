import { IGameSocket, ISocket } from "@/socket/types";

export default function gameHandler(socket: IGameSocket){
    socket.emit("game:self:joined");

    socket.join("game:lobby");

}